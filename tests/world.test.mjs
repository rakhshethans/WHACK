import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, completeGoal, createIsland, createWorld, getStage } from '../src/world.mjs';

const guitar = { title: 'Learn guitar', category: 'guitar', experience: 'intermediate', minutes: 8, objective: 'play at an open mic' };

test('the roadmap respects skill level, practice time and the objective', () => {
  const [island] = createIsland(createWorld(), guitar).islands;
  assert.equal(island.goals[0].title, 'Measure your chord changes');
  assert.ok(island.goals.every(goal => goal.minutes <= 8));
  assert.match(island.goals.at(-1).description, /open mic/);
});

test('only unlocked goals earn XP, and each goal can earn it once', () => {
  const world = createIsland(createWorld(), guitar);
  const [island] = world.islands;
  const [first, second] = island.goals;
  assert.equal(completeGoal(world, island.id, second.id), world);
  const updated = completeGoal(world, island.id, first.id);
  assert.equal(getStage(updated.islands[0].xp).level, 2);
  assert.equal(getStage(updated.islands[0].xp).nextThreshold, 250);
  assert.equal(world.islands[0].xp, 0);
  assert.equal(completeGoal(updated, island.id, first.id), updated);
  const completed = island.goals.slice(1).reduce((state, goal) => completeGoal(state, island.id, goal.id), updated);
  assert.deepEqual(getStage(completed.islands[0].xp), { level: 5, name: 'Metropolis', threshold: 900, nextThreshold: null });
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
