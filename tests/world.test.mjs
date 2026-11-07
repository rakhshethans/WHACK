import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, completeGoal, createIsland, createWorld, getActiveGoal, getStage } from '../src/world.mjs';

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
