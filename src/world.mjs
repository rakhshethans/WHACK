import { buildRoadmap, SKILLS } from './roadmaps.mjs';

const STAGES = [
  [0, 'Settlement'], [100, 'Village'], [250, 'Town'],
  [500, 'City'], [900, 'Metropolis'],
];

const XP_AWARDS = [100, 60, 90, 110, 140, 150, 150, 100];

export function createWorld() {
  return { islands: [] };
}

export function getStage(xp) {
  const levelIndex = Math.max(0, STAGES.findLastIndex(([threshold]) => xp >= threshold));
  const [threshold, name] = STAGES[levelIndex];
  return { level: levelIndex + 1, name, threshold, nextThreshold: STAGES[levelIndex + 1]?.[0] ?? null };
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
    title: name, category: skill, objective: target, roadmap: { focus, checkpoint, next }, goals,
  });
}

export function completeGoal(world, islandId, goalId) {
  const island = world.islands.find(({ id }) => id === islandId);
  const goal = island?.goals.find(({ id }) => id === goalId);
  if (!goal || goal.completed || !goal.prerequisites.every(id => island.goals.some(other => other.id === id && other.completed))) {
    return world;
  }
  const updatedIsland = {
    ...island,
    xp: island.xp + goal.xp,
    goals: island.goals.map(other => other.id === goalId ? { ...other, completed: true } : other),
  };
  return { ...world, islands: world.islands.map(other => other.id === islandId ? updatedIsland : other) };
}

export function adoptIsland(world, source) {
  return addIsland(world, {
    title: source.title,
    category: source.category,
    objective: source.objective,
    roadmap: source.roadmap ? { ...source.roadmap } : undefined,
    attribution: source.attribution ?? source.owner ?? source.title,
    goals: source.goals.map(goal => ({ ...goal, prerequisites: [...goal.prerequisites], completed: false })),
  });
}
