import { buildRoadmap, nextPractice, SKILLS } from './roadmaps.mjs';
import { buildCustomRoadmap, customArtworkTheme, nextCustomPractice } from './custom-roadmap.mjs';
import { coachGoal, DIFFICULTIES, guidedNextGoal } from './difficulty.mjs';
import { isBoilerplateGoal, unclearTopic } from './local-planner.mjs';

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

export function createIsland(world, { title = '', experience = 'beginner', minutes, objective, category = 'custom', topic, localRoadmap }) {
  const skill = Object.hasOwn(SKILLS, category) ? category : 'guitar';
  const customTopic = skill === 'custom' ? String(topic ?? '').trim() : undefined;
  const name = title.trim() || customTopic;
  if (!name || (skill === 'custom' && unclearTopic(customTopic))) return world;
  const sessionMinutes = Math.min(120, Math.max(1, Math.round(Number(minutes)) || 15));
  const target = String(objective ?? '').trim() || customTopic || '';
  const input = { topic: customTopic, objective: target, experience, minutes: sessionMinutes };
  const onDevice = skill === 'custom' && Boolean(localRoadmap);
  const plan = onDevice ? { focus: customTopic, theme: customArtworkTheme(input), ...localRoadmap }
    : skill === 'custom' ? buildCustomRoadmap(input) : buildRoadmap({ category: skill, objective: target, experience });
  if (!plan) return world;
  const { focus, theme, checkpoint, next, practiceFocus, steps } = plan;
  const goals = steps.map(([title, description, finish], index) => ({
    id: 'goal-' + (index + 1),
    title,
    description,
    finish,
    minutes: skill === 'custom' ? sessionMinutes : Math.min(sessionMinutes, 10 + index * 5),
    xp: XP_AWARDS[index],
    prerequisites: index ? ['goal-' + index] : [],
    completed: false,
  }));
  return addIsland(world, {
    title: name, category: skill, topic: customTopic, theme, experience, objective: target,
    sessionMinutes, roadmap: { focus, checkpoint, next, practiceFocus, onDevice }, goals,
  });
}

export function createGeneratedIsland(world, input) {
  return input.localRoadmap?.steps?.length === XP_AWARDS.length
    ? createIsland(world, { ...input, category: 'custom' }) : world;
}

export function needsRoadmapRevision(island) {
  return island.category === 'custom' && (
    (!island.roadmap?.onDevice && island.roadmap?.checkpoint?.startsWith('Complete a small real example of '))
    || island.goals.some(goal => !goal.completed && isBoilerplateGoal(goal))
  );
}

export function reviseIslandRoadmap(world, islandId, input) {
  const island = world.islands.find(item => item.id === islandId);
  if (!island || !needsRoadmapRevision(island)) return world;
  const [replacement] = createGeneratedIsland(createWorld(), input).islands;
  if (!replacement) return world;
  const { id, xp, attribution } = island;
  const starters = island.goals.filter(goal => !goal.continuation);
  const goals = replacement.goals.map((goal, i) => {
    const previous = starters[i];
    return previous?.completed ? previous : previous ? { ...goal, id: previous.id, xp: previous.xp, prerequisites: previous.prerequisites } : goal;
  });
  goals.push(...island.goals.filter(goal => goal.continuation && goal.completed));
  return { ...world, islands: world.islands.map(item => item.id === id
    ? { ...replacement, id, xp, attribution, goals } : item) };
}

export function needsGeneratedPractice(island) {
  return Boolean(island.roadmap?.onDevice && !needsRoadmapRevision(island) && island.goals.every(goal => goal.completed));
}

export function appendGeneratedPractice(world, islandId, goal) {
  const island = world.islands.find(item => item.id === islandId);
  if (!island || !needsGeneratedPractice(island) || !goal || isBoilerplateGoal(goal)) return world;
  const continuation = continuationGoal(island, goal, island.goals.filter(item => item.continuation).length);
  return { ...world, islands: world.islands.map(item => item.id === islandId
    ? { ...item, goals: [...item.goals, continuation] } : item) };
}

function availableGoal(island) {
  if (needsRoadmapRevision(island)) return;
  const completedIds = new Set(island.goals.filter(goal => goal.completed).map(goal => goal.id));
  const next = island.goals.find(goal => !goal.completed && goal.prerequisites.every(id => completedIds.has(id)));
  if (next || completedIds.size < island.goals.length) return next;

  if (island.roadmap?.onDevice) return;
  const practiceIndex = island.goals.filter(goal => goal.continuation).length;
  const practice = island.category === 'custom'
    ? nextCustomPractice(island, practiceIndex) : nextPractice(island, practiceIndex);
  return practice ? continuationGoal(island, practice, practiceIndex) : undefined;
}

function continuationGoal(island, { title, description, finish }, practiceIndex) {
  return {
    id: 'goal-' + (island.goals.length + 1), title, description, finish,
    minutes: island.sessionMinutes ?? (Math.max(0, ...island.goals.map(goal => goal.minutes || 0)) || 15),
    xp: POST_CHECKPOINT_XP[practiceIndex % POST_CHECKPOINT_XP.length],
    prerequisites: island.goals.length ? [island.goals.at(-1).id] : [],
    completed: false, continuation: true,
  };
}

function goalVersion(island, goal) {
  const adapted = island.nextGoalAdjustment;
  if (!goal || adapted?.id !== goal.id) return goal;
  return { ...goal, title: adapted.title, description: adapted.description, finish: adapted.finish, adapted: adapted.feedback };
}

export function getActiveGoal(island) {
  const goal = goalVersion(island, availableGoal(island));
  if (island.roadmap?.onDevice) return goal;
  return goal?.adapted && island.goalFeedback?.id !== goal.id ? goal : coachGoal(goal, island);
}

export function setDifficulty(world, islandId, goalId, rating) {
  if (!DIFFICULTIES.some(option => option.value === rating)) return world;
  const island = world.islands.find(({ id }) => id === islandId);
  if (!island || availableGoal(island)?.id !== goalId) return world;
  if (island.goalFeedback?.id === goalId && island.goalFeedback.rating === rating) return world;
  if (island.category !== 'custom' && (island.difficulty ?? 'standard') === rating) return world;
  return {
    ...world, islands: world.islands.map(item => item.id === islandId
      ? { ...item, difficulty: rating, goalFeedback: { id: goalId, rating } } : item),
  };
}

function withGoalCompleted(island, goal) {
  const completed = { ...goal, completed: true };
  const goals = island.goals.some(item => item.id === goal.id)
    ? island.goals.map(item => item.id === goal.id ? completed : item)
    : [...island.goals, completed];
  return { ...island, xp: island.xp + goal.xp, goals };
}

function adaptationRequest(island, completed, plannedGoal) {
  const feedback = island.goalFeedback?.rating;
  if (island.category !== 'custom' || island.goalFeedback?.id !== completed.id || !plannedGoal
      || (feedback !== 'support' && feedback !== 'stretch')) return null;
  return {
    topic: island.topic,
    objective: island.objective,
    experience: island.experience,
    theme: island.theme,
    feedback,
    completed: goalVersion(island, completed),
    plannedGoal,
  };
}

export function getAdaptationRequest(island, goalId) {
  const goal = availableGoal(island);
  if (!goal || goal.id !== goalId) return null;
  return adaptationRequest(island, goal, availableGoal(withGoalCompleted(island, goal)));
}

export function completeGoal(world, islandId, goalId, generated) {
  const island = world.islands.find(({ id }) => id === islandId);
  const goal = island && availableGoal(island);
  if (!goal || goal.id !== goalId) return world;

  const updatedIsland = withGoalCompleted(island, island.roadmap?.onDevice ? goalVersion(island, goal) : goal);
  const request = adaptationRequest(island, goal, availableGoal(updatedIsland));
  delete updatedIsland.goalFeedback;
  delete updatedIsland.nextGoalAdjustment;
  const adjustment = request && (generated ?? (island.roadmap?.onDevice ? null : guidedNextGoal(request)));
  if (adjustment) {
    updatedIsland.nextGoalAdjustment = {
      ...adjustment,
      id: request.plannedGoal.id,
      feedback: request.feedback,
    };
  }
  return { ...world, islands: world.islands.map(other => other.id === islandId ? updatedIsland : other) };
}

export function adoptIsland(world, source) {
  return addIsland(world, {
    title: source.title,
    category: source.category,
    topic: source.topic,
    theme: source.theme,
    experience: source.experience,
    objective: source.objective,
    sessionMinutes: source.sessionMinutes,
    roadmap: source.roadmap ? { ...source.roadmap } : undefined,
    attribution: source.attribution ?? source.owner ?? source.title,
    goals: source.goals.filter(goal => !goal.continuation).map(goal => ({ ...goal, prerequisites: [...goal.prerequisites], completed: false })),
  });
}
