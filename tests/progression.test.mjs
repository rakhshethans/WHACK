import assert from 'node:assert/strict';
import test from 'node:test';
import {
  appendGeneratedPractice, applyInactivity, completeGoal, createGeneratedIsland, createIsland,
  createWorld, getActiveGoal, getStage, plannedPracticeLevel,
} from '../src/world.mjs';
import { DAY_MS, MAX_XP, maintenanceStatus, practiceDeadline } from '../src/progression.mjs';
import { renderIsland } from '../src/scene.mjs';

const now = Date.UTC(2026, 10, 7);
const guitar = () => createIsland(createWorld(), { title: 'Guitar Cove', category: 'guitar', minutes: 20 });
const practice = { title: 'Switch G to C', description: 'Move from G to C on alternating downbeats.', finish: 'Make four switches at 50 BPM.' };

test('level gaps grow through level 10, and mastery still accepts practice', () => {
  let xp = 0;
  let gap = 0;
  for (let level = 1; level < 10; level++) {
    const stage = getStage(xp);
    assert.equal(stage.level, level);
    assert.ok(stage.nextThreshold - xp > gap);
    gap = stage.nextThreshold - xp;
    xp = stage.nextThreshold;
    assert.equal(getStage(xp - 1).level, level);
  }
  assert.equal(xp, MAX_XP);
  assert.equal(getStage(xp).level, 10);
  assert.equal(getStage(xp).nextThreshold, null);
  const world = guitar();
  const [island] = world.islands;
  island.xp = MAX_XP - 1;
  island.nextXpLossAt = now + DAY_MS;
  const promoted = completeGoal(world, island.id, 'goal-1', null, now);
  assert.equal(promoted.islands[0].xp, MAX_XP);
  const maintained = completeGoal(promoted, island.id, 'goal-2', null, now + DAY_MS);
  assert.equal(maintained.islands[0].xp, MAX_XP);
  assert.deepEqual(maintenanceStatus(maintained.islands[0]), { nextLossAt: now + 8 * DAY_MS, xpLoss: 400 });
});

test('older islands get a full grace period and overdue loss follows each demoted level’s rate', () => {
  const world = guitar();
  world.islands[0].xp = 360;
  const saved = applyInactivity(world, now);
  const deadline = practiceDeadline(now);
  assert.deepEqual(maintenanceStatus(saved.islands[0]), { nextLossAt: deadline, xpLoss: 25 });
  assert.equal(saved.islands[0].xp, 360);
  assert.equal(applyInactivity(saved, deadline - 1), saved);
  const first = applyInactivity(saved, deadline);
  assert.equal(first.islands[0].xp, 335);
  assert.equal(getStage(first.islands[0].xp).level, 1);
  assert.deepEqual(maintenanceStatus(first.islands[0]), { nextLossAt: deadline + DAY_MS, xpLoss: 10 });
  assert.equal(applyInactivity(first, deadline), first);
  assert.deepEqual(applyInactivity(saved, deadline + DAY_MS), applyInactivity(first, deadline + DAY_MS));
  const exhausted = applyInactivity(saved, deadline + 400 * DAY_MS);
  assert.equal(exhausted.islands[0].xp, 0);
  assert.equal(maintenanceStatus(exhausted.islands[0]), null);
});

test('completing a goal settles overdue XP and postpones the next deduction exactly once', () => {
  const world = guitar();
  const [island] = world.islands;
  Object.assign(island, { xp: 360, nextXpLossAt: now });
  const completed = completeGoal(world, island.id, 'goal-1', null, now);
  assert.equal(completed.islands[0].xp, 375);
  assert.equal(completed.islands[0].nextXpLossAt, practiceDeadline(now));
  assert.equal(completeGoal(completed, island.id, 'goal-1', null, now + DAY_MS), completed);
});

test('demotion discards harder active and queued model goals but keeps completed history', () => {
  let world = createGeneratedIsland(createWorld(), {
    topic: 'Learn guitar', minutes: 10,
    localRoadmap: { steps: [['Tune the guitar', 'Tune all six strings with a chromatic tuner.', 'Each open string reads in tune.']] },
  });
  const id = world.islands[0].id;
  world = completeGoal(world, id, 'goal-1', null, now);
  Object.assign(world.islands[0], { xp: 2000, nextXpLossAt: now, difficulty: 'stretch' });
  world = appendGeneratedPractice(world, id, practice);
  world = appendGeneratedPractice(world, id, { ...practice, title: 'Play a chord loop' }, { ahead: true });
  assert.equal(getActiveGoal(world.islands[0]).practiceLevel, 4);
  const decayed = applyInactivity(world, now);
  const [island] = decayed.islands;
  assert.equal(island.difficulty, 'standard');
  assert.deepEqual(island.goals, world.islands[0].goals.slice(0, 1));
  assert.equal(plannedPracticeLevel(island), 3);
  assert.equal(appendGeneratedPractice(decayed, id, practice, { practiceLevel: 4 }), decayed);
  const refreshed = appendGeneratedPractice(decayed, id, practice, { practiceLevel: 3 });
  assert.equal(getActiveGoal(refreshed.islands[0]).practiceLevel, 3);
  assert.equal(plannedPracticeLevel(refreshed.islands[0], true), 3);
});

test('the next model goal is drafted for the projected level after promotion', () => {
  const world = createGeneratedIsland(createWorld(), {
    topic: 'Learn guitar', minutes: 10,
    localRoadmap: { steps: [['Tune the guitar', 'Tune all six strings with a chromatic tuner.', 'Each open string reads in tune.']] },
  });
  const [island] = world.islands;
  island.xp = 340;
  assert.equal(plannedPracticeLevel(island, true), 2);
  const queued = appendGeneratedPractice(world, island.id, practice, { ahead: true, practiceLevel: 2 });
  const completed = completeGoal(queued, island.id, 'goal-1', null, now);
  assert.equal(getActiveGoal(completed.islands[0]).practiceLevel, 2);
});

test('island art and authored practice change when XP drops below a level threshold', () => {
  const world = guitar();
  const [island] = world.islands;
  Object.assign(island, { xp: MAX_XP, nextXpLossAt: now });
  const [lower] = applyInactivity(world, now).islands;
  assert.equal(getStage(lower.xp).level, 9);
  assert.notEqual(getActiveGoal(lower).levelPractice, getActiveGoal(island).levelPractice);
  for (const landmark of [undefined, 'guitar']) {
    const stages = Array.from({ length: 10 }, (_, index) => renderIsland({ ...island, landmark }, index + 1));
    assert.equal(new Set(stages).size, 10);
  }
});
