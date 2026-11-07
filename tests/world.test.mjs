import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, completeGoal, createIsland, createWorld, getActiveGoal, getStage, setDifficulty } from '../src/world.mjs';
import { generateCustomRoadmap } from '../src/local-planner.mjs';
import { renderIsland } from '../src/scene.mjs';
import { relatedSkill } from '../src/skill-connections.mjs';

const guitar = { title: 'Learn guitar', category: 'guitar', experience: 'intermediate', minutes: 8, objective: 'play at an open mic' };

test('the roadmap respects skill level, practice time and the objective', () => {
  const [island] = createIsland(createWorld(), guitar).islands;
  assert.equal(island.goals[0].title, 'Measure your chord changes');
  assert.ok(island.goals.every(goal => goal.minutes <= 8));
  assert.equal(island.objective, guitar.objective);
  assert.equal(island.roadmap.focus, 'Acoustic singer-songwriter');
  assert.ok(island.goals.every(goal => goal.finish.length > 0));
});

test('only unlocked goals earn XP, and each goal can earn it once', () => {
  const world = createIsland(createWorld(), guitar);
  const [island] = world.islands;
  const [first, second] = island.goals;
  assert.equal(completeGoal(world, island.id, second.id), world);
  const updated = completeGoal(world, island.id, first.id);
  assert.equal(updated.islands[0].xp, 40);
  assert.equal(getStage(updated.islands[0].xp).level, 1);
  assert.equal(getStage(updated.islands[0].xp).nextThreshold, 100);
  assert.equal(getActiveGoal(updated.islands[0]).id, second.id);
  const levelTwo = completeGoal(updated, island.id, second.id);
  assert.equal(levelTwo.islands[0].xp, 100);
  assert.equal(getStage(levelTwo.islands[0].xp).level, 2);
  assert.equal(world.islands[0].xp, 0);
  assert.equal(completeGoal(updated, island.id, first.id), updated);
  const completed = island.goals.slice(1).reduce((state, goal) => completeGoal(state, island.id, goal.id), updated);
  assert.deepEqual(getStage(completed.islands[0].xp), { level: 5, name: 'Metropolis', threshold: 900, nextThreshold: 1400 });
});

test('adoption starts a separate island at level one and preserves credit', () => {
  const world = createIsland(createWorld(), guitar);
  const [island] = world.islands;
  const progressed = completeGoal(world, island.id, island.goals[0].id);
  const [source] = progressed.islands;
  const [original, adopted] = adoptIsland(progressed, { ...source, owner: 'Demo explorer' }).islands;
  assert.equal(original.goals[0].completed, true);
  assert.notEqual(adopted.id, original.id);
  assert.equal(adopted.xp, 0);
  assert.equal(adopted.attribution, 'Demo explorer');
  assert.ok(adopted.goals.every(goal => !goal.completed));
  assert.deepEqual(adopted.goals[1].prerequisites, original.goals[1].prerequisites);
});

test('an Ed Sheeran ambition builds towards a first solo set with distinct skill milestones', () => {
  const [island] = createIsland(createWorld(), { ...guitar, experience: 'beginner', objective: 'I want to be better than Ed Sheeran' }).islands;
  assert.equal(island.roadmap.focus, 'Acoustic singer-songwriter');
  assert.match(island.roadmap.checkpoint, /three-song solo set/);
  assert.match(island.roadmap.next, /perform regularly/);
  assert.ok(island.goals.some(goal => /live loop/.test(goal.title)));
  assert.ok(island.goals.some(goal => /Sing over/.test(goal.title)));
  assert.ok(island.goals.some(goal => /original song/.test(goal.title)));
  assert.ok(island.goals.every(goal => goal.minutes <= guitar.minutes));
  const [ordinary] = createIsland(createWorld(), { ...guitar, objective: 'Play one song for friends' }).islands;
  assert.equal(ordinary.roadmap.focus, 'Song accompaniment');
  assert.ok(!ordinary.goals.some(goal => /live loop/.test(goal.title)));
});

test('the selected skill and ambition change the practice goals', () => {
  const world = createIsland(createWorld(), { ...guitar, category: 'photography', objective: 'Make a landscape portfolio' });
  const [landscape, portrait, writing] = createIsland(
    createIsland(world, { ...guitar, category: 'photography', objective: 'Take portraits of my friends' }),
    { ...guitar, category: 'songwriting', objective: 'Write better lyrics' },
  ).islands;
  assert.equal(landscape.goals[0].title, 'Build foreground and depth');
  assert.equal(portrait.goals[0].title, 'Find flattering light');
  assert.equal(writing.goals[0].title, 'Write a lyrical hook');
  const [fingerstyle] = createIsland(createWorld(), { ...guitar, objective: 'Play a fingerstyle arrangement' }).islands;
  assert.equal(fingerstyle.roadmap.focus, 'Fingerstyle arrangement');
});

test('a saved island without roadmap metadata can still earn XP and be adopted', () => {
  const legacyIsland = {
    id: 'island-1', title: 'Old Island', category: 'guitar', xp: 100,
    goals: [{ id: 'goal-1', xp: 100, prerequisites: [], completed: true },
      { id: 'goal-2', xp: 150, prerequisites: ['goal-1'], completed: false }],
  };
  const progressed = completeGoal({ islands: [legacyIsland] }, legacyIsland.id, 'goal-2');
  assert.equal(progressed.islands[0].xp, 250);
  const [original, adopted] = adoptIsland(progressed, progressed.islands[0]).islands;
  assert.equal(original.xp, 250);
  assert.equal(adopted.xp, 0);
  assert.ok(adopted.goals.every(goal => !goal.completed));
});

test('one goal remains available across many practice rounds and higher levels', () => {
  let world = createIsland(createWorld(), { ...guitar, objective: 'Better than Ed Sheeran' });
  const starterCount = world.islands[0].goals.length;
  const seen = new Set();
  for (let index = 0; index < starterCount + 20; index += 1) {
    const [island] = world.islands;
    const goal = getActiveGoal(island);
    assert.ok(!seen.has(goal.id), 'each goal receives a fresh ID');
    assert.ok(goal.minutes <= guitar.minutes);
    if (index === starterCount) {
      assert.equal(island.xp, 900);
      assert.match(goal.title, /Expand your live set/);
      assert.equal(getStage(island.xp).level, 5);
    }
    if (index === starterCount + 3) {
      assert.equal(island.xp, 1400);
      assert.equal(getStage(island.xp).level, 6);
    }
    seen.add(goal.id);
    world = completeGoal(world, island.id, goal.id);
    assert.equal(world.islands[0].xp, island.xp + goal.xp);
    assert.equal(completeGoal(world, island.id, goal.id), world);
  }
  const [source] = world.islands;
  const saved = JSON.parse(JSON.stringify(source));
  assert.deepEqual(getActiveGoal(saved), getActiveGoal(source));
  const adopted = adoptIsland(createWorld(), source).islands[0];
  assert.equal(adopted.goals.length, starterCount);
  assert.equal(getActiveGoal(adopted).id, 'goal-1');
});

test('a legacy island with all goals complete receives a continuation', () => {
  const island = {
    id: 'island-1', title: 'Old Guitar Island', category: 'guitar', xp: 900,
    goals: [{ id: 'goal-1', xp: 900, minutes: 20, prerequisites: [], completed: true }],
  };
  const goal = getActiveGoal(island);
  assert.equal(goal.id, 'goal-2');
  assert.equal(goal.minutes, 20);
  assert.equal(goal.continuation, true);
  const progressed = completeGoal({ islands: [island] }, island.id, goal.id);
  assert.equal(progressed.islands[0].xp, 1050);
  assert.notEqual(getActiveGoal(progressed.islands[0]).id, goal.id);
});

test('meeting new people creates a custom social progression without a second objective', () => {
  const input = { title: 'Meeting new people', topic: 'Meeting new people', category: 'custom', experience: 'beginner', minutes: 10 };
  let world = createIsland(createWorld(), input);
  const [island] = world.islands;
  assert.equal(island.category, 'custom');
  assert.equal(island.objective, input.topic);
  assert.equal(island.theme, 'people');
  assert.equal(getActiveGoal(island).title, 'Find a low-pressure place to meet people');
  assert.ok(island.goals.some(goal => goal.title === 'Say hello to one new person'));
  const campus = createIsland(createWorld(), { ...input, objective: 'Make friends on campus' }).islands[0];
  assert.match(getActiveGoal(campus).description, /on campus/);
  for (const goal of island.goals) world = completeGoal(world, island.id, goal.id);
  const [progressed] = world.islands;
  assert.equal(progressed.xp, 900);
  assert.match(getActiveGoal(progressed).title, /conversation in a new setting/);
  assert.equal(getActiveGoal(progressed).minutes, 10);
});

test('custom islands keep their own skill, outcome and appearance', () => {
  const input = { title: 'Paper Harbour', topic: 'Origami', category: 'custom', objective: 'Fold a paper crane', experience: 'beginner', minutes: 20 };
  const [origami, chess] = createIsland(createIsland(createWorld(), input), {
    ...input, title: 'Chess Island', topic: 'Chess', objective: 'Beat my friends at chess',
  }).islands;
  assert.match(getActiveGoal(origami).title, /Origami/);
  assert.ok(origami.goals.some(goal => goal.description.includes('Fold a paper crane')));
  assert.equal(chess.theme, 'board');
  assert.notEqual(renderIsland(origami, 1), renderIsland(chess, 1));
  const [copy] = adoptIsland(createWorld(), origami).islands;
  assert.equal(copy.topic, 'Origami');
  assert.equal(copy.theme, origami.theme);
  assert.equal(copy.xp, 0);
  assert.equal(renderIsland(JSON.parse(JSON.stringify(origami)), 1), renderIsland(origami, 1));
  assert.equal(createIsland(createWorld(), { ...input, topic: '   ' }).islands.length, 0);
});

test('the local planner accepts structured goals and falls back on unavailable or duplicate output', async () => {
  const input = { topic: 'Pottery', objective: 'Make a cup', experience: 'beginner', minutes: 10 };
  let created = 0;
  let destroyed = 0;
  const goals = Array.from({ length: 8 }, (_, index) => ({
    title: 'Shape practice piece ' + (index + 1),
    practice: 'Use a small piece of clay and practise a single shaping motion.',
    finish: 'Compare the rim against an earlier attempt.',
  }));
  const model = {
    availability: async () => 'available',
    create: async () => {
      created += 1;
      return {
        prompt: async (prompt, options) => {
          assert.match(prompt, /"topic":"Pottery"/);
          assert.equal(options.responseConstraint.properties.goals.minItems, 8);
          return JSON.stringify({ checkpoint: 'Finish a small practice cup.', goals });
        },
        destroy: () => { destroyed += 1; },
      };
    },
  };
  assert.equal(await generateCustomRoadmap(input, { model: { ...model, availability: async () => 'downloadable' } }), null);
  assert.equal(created, 0);
  const generated = await generateCustomRoadmap(input, { model });
  assert.equal(generated.steps.length, 8);
  const [island] = createIsland(createWorld(), { ...input, title: 'Pottery', category: 'custom', localRoadmap: generated }).islands;
  assert.equal(island.roadmap.onDevice, true);
  assert.equal(getActiveGoal(island).title, goals[0].title);
  goals[1].title = goals[0].title;
  assert.equal(await generateCustomRoadmap(input, { model }), null);
  assert.equal(destroyed, 2);
});

test('difficulty feedback adds tailored practice without awarding XP or changing the milestone', () => {
  const world = createIsland(createWorld(), { ...guitar, experience: 'beginner' });
  const [original] = world.islands;
  const first = getActiveGoal(original);
  const supported = setDifficulty(world, original.id, first.id, 'support');
  const [island] = supported.islands;
  const adjusted = getActiveGoal(island);
  assert.match(adjusted.practiceAdjustment, /G to C/);
  assert.equal(adjusted.finish, first.finish);
  assert.equal(adjusted.xp, first.xp);
  assert.equal(island.xp, 0);
  assert.equal(setDifficulty(supported, island.id, 'goal-2', 'stretch'), supported);
  assert.equal(setDifficulty(supported, island.id, first.id, 'invalid'), supported);

  const completed = completeGoal(supported, island.id, first.id);
  const [progressed] = completed.islands;
  assert.equal(progressed.xp, 40);
  assert.equal(progressed.goals[0].practiceAdjustment, undefined);
  assert.notEqual(getActiveGoal(progressed).practiceAdjustment, adjusted.practiceAdjustment);
  assert.ok(getActiveGoal(JSON.parse(JSON.stringify(progressed))).practiceAdjustment);
  const next = getActiveGoal(progressed);
  const stretched = setDifficulty(completed, island.id, next.id, 'stretch');
  assert.match(getActiveGoal(stretched.islands[0]).practiceAdjustment, /dynamics/);
  const standard = setDifficulty(stretched, island.id, next.id, 'standard');
  assert.equal(getActiveGoal(standard.islands[0]).practiceAdjustment, undefined);
  assert.equal(adoptIsland(createWorld(), progressed).islands[0].difficulty, undefined);
});

test('a related skill becomes available at 100 XP and points to an existing island when possible', () => {
  let world = createIsland(createWorld(), { ...guitar, title: 'Guitar Island' });
  const [guitarIsland] = world.islands;
  assert.equal(relatedSkill(guitarIsland, world.islands), null);
  world = guitarIsland.goals.slice(0, 2).reduce((current, goal) => completeGoal(current, guitarIsland.id, goal.id), world);
  const [progressed] = world.islands;
  const suggested = relatedSkill(progressed, world.islands);
  assert.equal(suggested.category, 'songwriting');
  assert.match(suggested.reason, /chord changes/);
  assert.equal(suggested.islandId, undefined);
  world = createIsland(world, { ...guitar, ...suggested, title: 'Songwriting Island' });
  assert.equal(relatedSkill(progressed, world.islands).islandId, world.islands[1].id);
});

test('related custom skills start with relevant practice goals', () => {
  for (const [source, title, first] of [
    [{ category: 'custom', theme: 'people' }, 'Public speaking', 'Choose one point to share'],
    [{ category: 'custom', theme: 'language' }, 'Meeting new people', 'Find a low-pressure place to meet people'],
    [{ category: 'photography' }, 'Visual storytelling', 'Define the story in one sentence'],
  ]) {
    const suggestion = relatedSkill({ ...source, id: 'island-1', xp: 100 }, []);
    assert.equal(suggestion.name, title);
    const [island] = createIsland(createWorld(), { ...guitar, ...suggestion, title }).islands;
    assert.equal(getActiveGoal(island).title, first);
  }
});
