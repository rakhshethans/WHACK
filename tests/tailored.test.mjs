import assert from 'node:assert/strict';
import test from 'node:test';
import { generateContinuation, generateCustomRoadmap, generateStarterRoadmap, warmStarterModel } from '../src/local-planner.mjs';
import { renderIsland } from '../src/scene.mjs';
import { appendGeneratedPractice, completeGoal, createGeneratedIsland, createWorld, getActiveGoal,
  canQueueGeneratedPractice, needsGeneratedPractice, needsRoadmapRevision, reviseIslandRoadmap, setDifficulty } from '../src/world.mjs';

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
  create: async () => ({ prompt: async (prompt, options) => { inspect(prompt, options); return JSON.stringify(data); }, destroy() {} }),
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

test('one exercise starts the island, and a queued exercise unlocks only after completion', async () => {
  let requestedCount;
  const model = {
    ...mockModel(response),
    create: async () => ({
      prompt: async (prompt, { responseConstraint }) => {
        requestedCount = responseConstraint.properties.goals.maxItems;
        assert.match(prompt, /Summarise monthly expenses from CSV/);
        return JSON.stringify({ ...response, goals: goals.slice(0, requestedCount) });
      }, destroy() {},
    }),
  };
  const { plan } = await generateStarterRoadmap(input, { model });
  assert.equal(requestedCount, 1);
  let world = createGeneratedIsland(createWorld(), { ...input, localRoadmap: plan });
  const [island] = world.islands;
  assert.equal(island.goals.length, 1);
  assert.ok(canQueueGeneratedPractice(island));
  assert.equal(getActiveGoal(island).title, goals[0].title);
  for (const [index, source] of goals.slice(1).entries()) {
    const { title, practice: description, finish } = source;
    world = appendGeneratedPractice(world, island.id, { title, description, finish }, { ahead: true });
    const [queued] = world.islands;
    assert.equal(getActiveGoal(queued).title, goals[index].title);
    assert.equal(canQueueGeneratedPractice(queued), false);
    assert.equal(completeGoal(world, island.id, queued.goals.at(-1).id), world);
    world = completeGoal(world, island.id, getActiveGoal(queued).id);
  }
  world = completeGoal(world, island.id, getActiveGoal(world.islands[0]).id);
  assert.equal(world.islands[0].xp, 900);
});

test('Chrome can generate validated JSON when native response constraints are unavailable', async () => {
  let calls = 0;
  const model = { availability: async () => 'available', create: async () => ({
    async prompt(prompt, options) {
      calls++;
      if (options.responseConstraint) throw new DOMException('responseConstraint is not supported', 'NotSupportedError');
      assert.match(prompt, /Return only JSON/);
      return '```json\n' + JSON.stringify({ ...response, goals: goals.slice(0, 1) }) + '\n```';
    }, destroy() {},
  }) };
  const result = await generateStarterRoadmap(input, { model });
  assert.equal(result.status, 'ready');
  assert.equal(calls, 2);
});

test('a valid first exercise is accepted when Nano omits or leaves the checkpoint blank', async () => {
  for (const checkpoint of ['', undefined]) {
    const result = await generateStarterRoadmap(input, { model: mockModel({ decision: 'ready', checkpoint, goals: [goals[0]] }) });
    assert.equal(result.status, 'ready');
    assert.equal(result.plan.checkpoint, undefined);
    assert.equal(result.plan.steps[0][0], goals[0].title);
  }
});

test('the first goal contains no icon request and familiar skills keep their landmarks', async () => {
  const unusual = { ...input, topic: 'Learn bookbinding', objective: 'Bind a notebook' };
  let requests = 0;
  const model = mockModel({ decision: 'ready', landmark: 'brush', goals: [{
    title: 'Mark three stitch holes', practice: 'Mark three evenly spaced holes along the notebook fold with a ruler.',
    finish: 'The middle mark lines up with the centre of the fold.',
  }] }, (prompt, options) => {
    requests++;
    assert.doesNotMatch(prompt, /landmark|pictogram/);
    assert.equal(options.responseConstraint.properties.landmark, undefined);
  });
  const { plan } = await generateStarterRoadmap(unusual, { model });
  assert.equal(requests, 1);
  const [bookbinding] = createGeneratedIsland(createWorld(), { ...unusual, localRoadmap: plan }).islands;
  assert.match(renderIsland(bookbinding, 1), /class="topic-seal"/);

  const [photo] = createGeneratedIsland(createWorld(), { ...input, topic: 'Photography', localRoadmap: plan }).islands;
  assert.match(renderIsland(photo, 1), /data-landform="(?:alpine|mesa)" data-landmark="camera"/);
  assert.equal(renderIsland(photo, 1), renderIsland(JSON.parse(JSON.stringify(photo)), 1));
  assert.notEqual(renderIsland(photo, 1), renderIsland(photo, 3));

  const [unsafe] = createGeneratedIsland(createWorld(), { ...unusual, localRoadmap: { ...plan, landmark: '<script>' } }).islands;
  assert.match(renderIsland(unsafe, 1), /data-landmark="compass"/);
  assert.match(renderIsland(unsafe, 1), /class="topic-seal"/);
  assert.doesNotMatch(renderIsland(unsafe, 1), /<script>/);
});

test('starter warmup reuses the session and skips models that need a download', async () => {
  let created = 0;
  let destroyed = 0;
  let warmSignal;
  const model = { availability: async () => 'available', create: async ({ signal }) => {
    created++;
    warmSignal = signal;
    return {
      prompt: async () => JSON.stringify({ ...response, goals: [goals[0]] }),
      destroy() { destroyed++; },
    };
  } };
  const warmup = warmStarterModel(model);
  assert.equal((await generateStarterRoadmap(input, { model, warmup })).status, 'ready');
  assert.equal(created, 1);
  assert.equal(destroyed, 1);
  assert.equal(await warmup.take(), null);

  const unused = warmStarterModel(model);
  await Promise.resolve();
  unused.cancel();
  assert.ok(warmSignal.aborted);
  assert.equal(await unused.take(), null);

  const downloadable = warmStarterModel({ ...model, availability: async () => 'downloadable' });
  assert.equal(await downloadable.take(), null);
  assert.equal(created, 2);
});

test('model setup and prompt timeouts are reported separately', async () => {
  const expire = async signal => {
    if (!signal.aborted) await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
    throw new DOMException('Timed out', 'TimeoutError');
  };
  const availability = async () => 'available';
  assert.deepEqual(await generateStarterRoadmap(input, { setupTimeout: 5, model: {
    availability, create: ({ signal }) => expire(signal),
  } }), { status: 'setup-timeout' });
  const model = { availability, create: async ({ signal: setup }) => ({
    async prompt(_, { signal }) {
      assert.notEqual(signal, setup);
      return expire(signal);
    }, destroy() {},
  }) };
  const keepAlive = setInterval(() => {}, 100);
  try {
    assert.deepEqual(await generateStarterRoadmap(input, { model, timeout: 5 }), { status: 'generation-timeout' });
  } finally { clearInterval(keepAlive); }
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
  const { plan: repair } = await generateStarterRoadmap(input, { model: mockModel({ ...response, goals: [goals[1]] }) });
  const [updated] = reviseIslandRoadmap({ islands: [saved] }, saved.id, { ...input, localRoadmap: repair }).islands;
  assert.equal(updated.xp, 40);
  assert.equal(updated.id, saved.id);
  assert.deepEqual(updated.goals[0], saved.goals[0]);
  assert.equal(getActiveGoal(updated).title, goals[1].title);
});
