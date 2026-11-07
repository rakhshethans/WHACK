import assert from 'node:assert/strict';
import test from 'node:test';
import { generateContinuation, generateCustomRoadmap } from '../src/local-planner.mjs';
import { appendGeneratedPractice, completeGoal, createGeneratedIsland, createWorld, getActiveGoal,
  needsGeneratedPractice, needsRoadmapRevision, reviseIslandRoadmap, setDifficulty } from '../src/world.mjs';

const input = { topic: 'Learn Python', objective: 'Summarise monthly expenses from CSV', experience: 'beginner', minutes: 10 };
const goals = [
  ['Print the total of three expenses', 'Add three expense amounts stored in a Python list and print their sum.', 'The sum printed matches your hand calculation.'],
  ['Label one expense', 'Make a Python dictionary with an amount and category and print its category.', 'The category printed matches the label in the dictionary.'],
  ['Read the CSV header', 'Use csv.DictReader on a CSV with amount and category columns.', 'Print both column names in the order they appear in the file.'],
  ['Convert one amount to a number', 'Read one CSV row and convert its amount text with Decimal.', 'Adding Decimal("0.10") to the amount increases it by exactly ten cents.'],
  ['Total expenses from a file', 'Loop through three CSV rows and add their Decimal amounts to a running total.', 'The printed total matches the sum of all three rows.'],
  ['Group expenses by category', 'Use a dictionary to add each amount to its category subtotal.', 'Two rows with the same category share one subtotal.'],
  ['Filter rows by month', 'Add a date column and compare the YYYY-MM part of each date with your target month.', 'Rows from two other months do not appear in the filtered result.'],
  ['Print the monthly summary', 'Combine the date filter and category totals, then print each category with its amount.', 'A small CSV with two months prints the correct totals for the selected month.'],
].map(([title, practice, finish]) => ({ title, practice, finish }));
const response = { decision: 'ready', checkpoint: 'Print a Python summary of expenses by category for one month.', goals };
const mockModel = (data, inspect = () => {}) => ({
  availability: async () => 'available',
  create: async () => ({ prompt: async prompt => { inspect(prompt); return JSON.stringify(data); }, destroy() {} }),
});

test('new islands require a generated plan, even for recognised skills', async () => {
  const world = createWorld();
  assert.equal(createGeneratedIsland(world, { topic: 'Guitar' }), world);
  assert.deepEqual(await generateCustomRoadmap(input, { model: null }), { status: 'unavailable' });
  for (const topic of ['???', 'asdfgh', 'learn something', 'xxxxxxxx']) {
    assert.deepEqual(await generateCustomRoadmap({ ...input, topic }, {
      model: { availability: async () => assert.fail('obvious invalid input must not invoke the model') },
    }), { status: 'clarify' });
  }
  for (const decision of ['clarify', 'unsuitable']) {
    assert.deepEqual(await generateCustomRoadmap(input, { model: mockModel({ decision, checkpoint: '', goals: [] }) }), { status: decision });
  }
  const generic = { ...response, goals: [{ ...goals[0], title: 'Isolate one part of the skill' }, ...goals.slice(1)] };
  assert.deepEqual(await generateCustomRoadmap(input, { model: mockModel(generic) }), { status: 'retry' });
});

test('generated goals use the exact outcome and continue only with another accepted exercise', async () => {
  const { plan } = await generateCustomRoadmap(input, { model: mockModel(response, prompt => {
    assert.match(prompt, /Summarise monthly expenses from CSV/);
    assert.match(prompt, /"minutes":10/);
  }) });
  let world = createGeneratedIsland(createWorld(), { ...input, localRoadmap: plan });
  const [island] = world.islands;
  assert.match(getActiveGoal(island).description, /Python list/);
  world = setDifficulty(world, island.id, island.goals[0].id, 'support');
  for (const goal of island.goals) world = completeGoal(world, island.id, goal.id);
  const [completed] = world.islands;
  assert.equal(completed.xp, 900);
  assert.equal(getActiveGoal(completed), undefined);
  assert.ok(needsGeneratedPractice(completed));
  assert.deepEqual(await generateContinuation(completed, { model: mockModel(goals[7]) }), { status: 'retry' });
  const { goal } = await generateContinuation(completed, { model: mockModel({
    title: 'Flag a CSV row with a blank amount', practice: 'Add one row with an empty amount and print its row number before skipping it.',
    finish: 'The other expense rows still produce the same category totals.',
  }, prompt => {
    assert.match(prompt, /Print the monthly summary/);
    assert.match(prompt, /"difficulty":"support"/);
  }) });
  const updated = appendGeneratedPractice(world, island.id, goal);
  assert.equal(updated.islands[0].xp, 900);
  assert.equal(getActiveGoal(updated.islands[0]).title, 'Flag a CSV row with a blank amount');
  assert.equal(appendGeneratedPractice(updated, island.id, goal), updated);
});

test('rebuilding a saved generic plan keeps completed goals and earned XP', async () => {
  const { plan } = await generateCustomRoadmap(input, { model: mockModel(response) });
  const world = createGeneratedIsland(createWorld(), { ...input, localRoadmap: plan });
  const [island] = completeGoal(world, 'island-1', 'goal-1').islands;
  const saved = { ...island, roadmap: { checkpoint: 'Complete a small real example of Python' }, goals: [
    island.goals[0], { ...island.goals[1], title: 'Isolate one part of the skill' }, ...island.goals.slice(2),
  ] };
  assert.ok(needsRoadmapRevision(saved));
  assert.equal(getActiveGoal(saved), undefined);
  const [updated] = reviseIslandRoadmap({ islands: [saved] }, saved.id, { ...input, localRoadmap: plan }).islands;
  assert.equal(updated.xp, 40);
  assert.equal(updated.id, saved.id);
  assert.deepEqual(updated.goals[0], saved.goals[0]);
  assert.equal(getActiveGoal(updated).title, goals[1].title);
});
