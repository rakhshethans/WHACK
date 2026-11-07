import { buildRoadmap, nextPractice, SKILLS } from './roadmaps.mjs';

const STAGES = [
  [0, 'Settlement'], [100, 'Village'], [250, 'Town'],
  [500, 'City'], [900, 'Metropolis'],
];

const XP_AWARDS = [40, 60, 65, 85, 110, 140, 175, 225];
const POST_CHECKPOINT_XP = [150, 175, 175];
const XP_PER_LATER_LEVEL = 500;

export function createWorld() {
  return { islands: [] };
}

export function getStage(xp) {
  const [lastThreshold, lastName] = STAGES.at(-1);
  if (xp >= lastThreshold) {
    const extraLevels = Math.floor((xp - lastThreshold) / XP_PER_LATER_LEVEL);
    const threshold = lastThreshold + extraLevels * XP_PER_LATER_LEVEL;
    return {
      level: STAGES.length + extraLevels, name: lastName,
      threshold, nextThreshold: threshold + XP_PER_LATER_LEVEL,
    };
  }
  const levelIndex = Math.max(0, STAGES.findLastIndex(([threshold]) => xp >= threshold));
  const [threshold, name] = STAGES[levelIndex];
  return { level: levelIndex + 1, name, threshold, nextThreshold: STAGES[levelIndex + 1][0] };
}

function addIsland(world, island) {
  return { ...world, islands: [...world.islands, { ...island, id: 'island-' + (world.islands.length + 1), xp: 0 }] };
}

export function createIsland(world, { title, experience, minutes, objective, category }) {
  const name = title.trim();
  if (!name) return world;
  const skill = Object.hasOwn(SKILLS, category) ? category : 'guitar';
  const sessionMinutes = Math.min(120, Math.max(1, Math.round(Number(minutes)) || 15));
  const target = String(objective ?? '').trim();
  const { focus, checkpoint, next, steps } = buildRoadmap({ category: skill, objective: target, experience });
  const goals = steps.map(([title, description, finish], index) => ({
    id: 'goal-' + (index + 1),
    title,
    description,
    finish,
    minutes: Math.min(sessionMinutes, 10 + index * 5),
    xp: XP_AWARDS[index],
    prerequisites: index ? ['goal-' + index] : [],
    completed: false,
  }));
  return addIsland(world, {
    title: name, category: skill, objective: target, sessionMinutes, roadmap: { focus, checkpoint, next }, goals,
  });
}

export function getActiveGoal(island) {
  const completedIds = new Set(island.goals.filter(goal => goal.completed).map(goal => goal.id));
  const next = island.goals.find(goal => !goal.completed && goal.prerequisites.every(id => completedIds.has(id)));
  if (next || completedIds.size < island.goals.length) return next;

  const practiceIndex = island.goals.filter(goal => goal.continuation).length;
  const { title, description, finish } = nextPractice(island, practiceIndex);
  return {
    id: 'goal-' + (island.goals.length + 1), title, description, finish,
    minutes: island.sessionMinutes ?? (Math.max(0, ...island.goals.map(goal => goal.minutes || 0)) || 15),
    xp: POST_CHECKPOINT_XP[practiceIndex % POST_CHECKPOINT_XP.length],
    prerequisites: island.goals.length ? [island.goals.at(-1).id] : [],
    completed: false, continuation: true,
  };
}

export function completeGoal(world, islandId, goalId) {
  const island = world.islands.find(({ id }) => id === islandId);
  const goal = island && getActiveGoal(island);
  if (!goal || goal.id !== goalId) return world;

  const completed = { ...goal, completed: true };
  const goals = island.goals.some(item => item.id === goalId)
    ? island.goals.map(item => item.id === goalId ? completed : item)
    : [...island.goals, completed];
  const updatedIsland = { ...island, xp: island.xp + goal.xp, goals };
  return { ...world, islands: world.islands.map(other => other.id === islandId ? updatedIsland : other) };
}

export function adoptIsland(world, source) {
  return addIsland(world, {
    title: source.title,
    category: source.category,
    objective: source.objective,
    sessionMinutes: source.sessionMinutes,
    roadmap: source.roadmap ? { ...source.roadmap } : undefined,
    attribution: source.attribution ?? source.owner ?? source.title,
    goals: source.goals.filter(goal => !goal.continuation).map(goal => ({ ...goal, prerequisites: [...goal.prerequisites], completed: false })),
  });
}
