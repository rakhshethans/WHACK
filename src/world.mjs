import { buildRoadmap, nextPractice, SKILLS } from './roadmaps.mjs';
import { buildCustomRoadmap, customArtworkTheme, nextCustomPractice } from './custom-roadmap.mjs';
import { coachGoal, DIFFICULTIES, guidedNextGoal } from './difficulty.mjs';
import { isBoilerplateGoal, unclearTopic } from './local-planner.mjs';
import { applyIslandInactivity, getStage, levelChallenge, practiceDeadline, practiceXp } from './progression.mjs';
import { knownLandmark, readIslandIcon, validLandmark } from './island-art.mjs';

export { getStage } from './progression.mjs';
export const GOAL_FEEDBACK_LIMIT = 500;

export const XP_AWARDS = [40, 60, 65, 85, 110, 140, 175, 225];
const POST_CHECKPOINT_XP = [150, 175, 175];

export function createWorld() {
  return { islands: [] };
}

function addIsland(world, island) {
  return { ...world, islands: [...world.islands, { ...island, id: 'island-' + (world.islands.length + 1), xp: 0 }] };
}

function starterGoal([title, description, finish], index, minutes, prerequisite) {
  return { id: 'goal-' + (index + 1), title, description, finish, minutes,
    xp: XP_AWARDS[index], prerequisites: prerequisite ? [prerequisite] : [], completed: false };
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
  const landmark = onDevice && (knownLandmark(input) ?? (validLandmark(plan.landmark) ? plan.landmark : 'compass'));
  const goals = steps.map((step, index) => starterGoal(step, index,
    skill === 'custom' ? sessionMinutes : Math.min(sessionMinutes, 10 + index * 5), index ? 'goal-' + index : undefined));
  if (onDevice) {
    let projectedXp = 0;
    for (const goal of goals) {
      goal.practiceLevel = getStage(projectedXp).level;
      projectedXp = practiceXp(projectedXp, goal.xp);
    }
  }
  return addIsland(world, {
    title: name, category: skill, topic: customTopic, theme, experience, objective: target,
    ...(landmark ? { landmark } : {}),
    sessionMinutes, roadmap: { focus, checkpoint, next, practiceFocus, onDevice }, goals,
  });
}

export function createGeneratedIsland(world, input) {
  return [1, XP_AWARDS.length].includes(input.localRoadmap?.steps?.length)
    ? createIsland(world, { ...input, category: 'custom' }) : world;
}

export function needsRoadmapRevision(island) {
  return island.category === 'custom' && (
    (!island.roadmap?.onDevice && island.roadmap?.checkpoint?.startsWith('Complete a small real example of '))
    || island.goals.some(goal => !goal.completed && isBoilerplateGoal(goal))
  );
}

export function canPersonaliseAdoptedRoadmap(island) {
  return Boolean(island?.attribution && !island.roadmap?.personalised);
}

export function reviseIslandRoadmap(world, islandId, input) {
  const island = world.islands.find(item => item.id === islandId);
  if (!island) return world;
  const personalising = canPersonaliseAdoptedRoadmap(island);
  if (personalising ? input.localRoadmap?.steps?.length !== 1 : !needsRoadmapRevision(island)) return world;
  const [replacement] = createGeneratedIsland(createWorld(), input).islands;
  if (!replacement) return world;
  const { id, xp, attribution, nextXpLossAt, practicePreference, iconOverride } = island;
  if (replacement.goals.length === 1) {
    const revised = { ...replacement, id, xp, attribution, nextXpLossAt, practicePreference, iconOverride, difficulty: island.difficulty,
      goals: island.goals.filter(goal => goal.completed) };
    if (personalising) {
      Object.assign(revised, { title: island.title, category: island.category, landmark: island.landmark, theme: island.theme });
      revised.roadmap.personalised = true;
    }
    revised.goals.push({ ...generatedPracticeGoal(revised, replacement.goals[0]), practiceLevel: getStage(xp).level });
    return replaceIsland(world, revised);
  }
  const starters = island.goals.filter(goal => !goal.continuation);
  const goals = replacement.goals.map((goal, i) => {
    const previous = starters[i];
    return previous?.completed ? previous : previous ? { ...goal, id: previous.id, xp: previous.xp, prerequisites: previous.prerequisites } : goal;
  });
  goals.push(...island.goals.filter(goal => goal.continuation && goal.completed));
  return replaceIsland(world, { ...replacement, id, xp, attribution, nextXpLossAt, practicePreference, iconOverride, goals });
}

export function needsGeneratedPractice(island) {
  return Boolean(island.roadmap?.onDevice && !needsRoadmapRevision(island) && island.goals.every(goal => goal.completed));
}

export function canQueueGeneratedPractice(island) {
  return Boolean(island.roadmap?.onDevice && !needsRoadmapRevision(island) && island.goals.slice(0, -1).every(goal => goal.completed));
}

function replaceIsland(world, island) {
  return { ...world, islands: world.islands.map(item => item.id === island.id ? island : item) };
}

export function canQueueRoadmapGoal(island) {
  return Boolean(island?.roadmap?.onDevice && !needsRoadmapRevision(island) && island.goals.length < XP_AWARDS.length);
}

export function projectedRoadmapLevel(island) {
  let xp = island.xp;
  for (const goal of island.goals) {
    if (!goal.completed) xp = practiceXp(xp, goal.xp);
  }
  return getStage(xp).level;
}

export function appendRoadmapGoal(world, islandId, goal) {
  const island = world.islands.find(item => item.id === islandId);
  if (!island || !canQueueRoadmapGoal(island) || !goal || isBoilerplateGoal(goal)) return world;
  const practiceLevel = projectedRoadmapLevel(island);
  return replaceIsland(world, { ...island, goals: [...island.goals, { ...generatedPracticeGoal(island, goal), practiceLevel }] });
}

export function setIslandIcon(world, islandId, choice) {
  const island = world.islands.find(item => item.id === islandId);
  const iconOverride = readIslandIcon(choice);
  if (!island || (choice && !iconOverride)) return world;
  return replaceIsland(world, { ...island, iconOverride });
}

function generatedPracticeGoal(island, goal) {
  const index = island.goals.length;
  const practice = index < XP_AWARDS.length
    ? starterGoal([goal.title, goal.description, goal.finish], index, island.sessionMinutes, island.goals.at(-1)?.id)
    : continuationGoal(island, goal, island.goals.filter(item => item.continuation).length);
  // An adopted roadmap can have completed goals out of order.
  let number = index + 1;
  const usedIds = new Set(island.goals.map(item => item.id));
  while (usedIds.has(practice.id)) practice.id = 'goal-' + ++number;
  return practice;
}

export function plannedPracticeLevel(island, ahead = false) {
  const active = ahead ? availableGoal(island) : null;
  return getStage(active ? practiceXp(island.xp, active.xp) : island.xp).level;
}

export function appendGeneratedPractice(world, islandId, goal, { ahead = false, practiceLevel } = {}) {
  const island = world.islands.find(item => item.id === islandId);
  if (!island || !(ahead ? canQueueGeneratedPractice(island) : needsGeneratedPractice(island)) || !goal || isBoilerplateGoal(goal)) return world;
  const currentLevel = plannedPracticeLevel(island, ahead);
  if (practiceLevel !== undefined && practiceLevel !== currentLevel) return world;
  return replaceIsland(world, { ...island, goals: [...island.goals, { ...generatedPracticeGoal(island, goal), practiceLevel: currentLevel }] });
}

function discardOutdatedPractice(island, previousLevel) {
  if (!island.roadmap?.onDevice) return island;
  const changedLevel = getStage(island.xp).level !== previousLevel;
  let projectedXp = island.xp;
  let outdated = false;
  const goals = island.goals.filter(goal => {
    if (goal.completed) return true;
    const level = getStage(projectedXp).level;
    outdated ||= goal.practiceLevel === undefined ? changedLevel : goal.practiceLevel !== level;
    if (outdated) return false;
    projectedXp = practiceXp(projectedXp, goal.xp);
    return true;
  });
  if (!outdated) return island;
  return { ...island, goals, goalFeedback: undefined, nextGoalAdjustment: undefined };
}

export function applyInactivity(world, now = Date.now()) {
  let changed = false;
  const islands = world.islands.map(island => {
    const updated = applyIslandInactivity(island, now);
    if (updated === island) return island;
    changed = true;
    if (updated.xp === island.xp) return updated;
    const previousLevel = getStage(island.xp).level;
    const dropped = getStage(updated.xp).level < previousLevel;
    const reset = dropped ? { ...updated, difficulty: 'standard', goalFeedback: undefined, nextGoalAdjustment: undefined } : updated;
    return discardOutdatedPractice(reset, previousLevel);
  });
  return changed ? { ...world, islands } : world;
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
  if (!goal || island.roadmap?.onDevice) return goal;
  const coached = goal.adapted && island.goalFeedback?.id !== goal.id ? goal : coachGoal(goal, island);
  const practiceLevel = getStage(island.xp).level;
  return { ...coached, practiceLevel, levelPractice: levelChallenge(practiceLevel) };
}

export function reviseActiveGoal(world, islandId, goalId, note, replacement) {
  const island = world.islands.find(item => item.id === islandId);
  const goal = island?.roadmap?.onDevice && availableGoal(island);
  const practicePreference = note.trim();
  if (!goal || goal.id !== goalId || !practicePreference || practicePreference.length > GOAL_FEEDBACK_LIMIT ||
    !replacement || isBoilerplateGoal(replacement)) return world;
  const { title, description, finish } = replacement;
  const revised = { ...goal, title, description, finish, practiceLevel: getStage(island.xp).level };
  return replaceIsland(world, {
    ...island,
    practicePreference,
    nextGoalAdjustment: undefined,
    goals: island.goals.filter(item => item.completed || item === goal).map(item => item === goal ? revised : item),
  });
}

export function setDifficulty(world, islandId, goalId, rating) {
  if (!DIFFICULTIES.some(option => option.value === rating)) return world;
  const island = world.islands.find(({ id }) => id === islandId);
  if (!island || availableGoal(island)?.id !== goalId) return world;
  if (island.goalFeedback?.id === goalId && island.goalFeedback.rating === rating) return world;
  if (island.category !== 'custom' && !island.roadmap?.onDevice && (island.difficulty ?? 'standard') === rating) return world;
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
  return { ...island, xp: practiceXp(island.xp, goal.xp), goals };
}

function adaptationRequest(island, completed, plannedGoal) {
  const feedback = island.goalFeedback?.rating;
  if ((island.category !== 'custom' && !island.roadmap?.onDevice) || island.goalFeedback?.id !== completed.id || !plannedGoal
      || (feedback !== 'support' && feedback !== 'stretch')) return null;
  return {
    topic: island.topic,
    objective: island.objective,
    experience: island.experience,
    theme: island.theme,
    feedback,
    practicePreference: island.practicePreference,
    skillLevel: getStage(practiceXp(island.xp, completed.xp)).level,
    completed: goalVersion(island, completed),
    plannedGoal,
  };
}

export function getAdaptationRequest(island, goalId) {
  const goal = availableGoal(island);
  if (!goal || goal.id !== goalId) return null;
  const projected = discardOutdatedPractice(withGoalCompleted(island, goal), getStage(island.xp).level);
  return adaptationRequest(island, goal, availableGoal(projected));
}

export function completeGoal(world, islandId, goalId, generated, now = Date.now()) {
  world = applyInactivity(world, now);
  const island = world.islands.find(({ id }) => id === islandId);
  const goal = island && availableGoal(island);
  if (!goal || goal.id !== goalId) return world;

  const completed = withGoalCompleted(island, island.roadmap?.onDevice ? goalVersion(island, goal) : goal);
  const updatedIsland = discardOutdatedPractice(completed, getStage(island.xp).level);
  updatedIsland.nextXpLossAt = practiceDeadline(now);
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
  const onDevice = source.roadmap?.onDevice || source.category === 'custom' && Boolean(source.creator);
  const landmark = validLandmark(source.landmark) ? source.landmark
    : onDevice ? knownLandmark(source) ?? 'compass' : undefined;
  const starterGoals = source.goals.filter(goal => !goal.continuation);
  const goalIds = new Map(starterGoals.map((goal, index) => [goal.id, source.creator ? 'goal-' + (index + 1) : goal.id]));
  return addIsland(world, {
    title: source.title,
    category: source.category,
    topic: source.topic,
    theme: source.theme,
    ...(landmark ? { landmark } : {}),
    experience: source.experience,
    objective: source.objective,
    sessionMinutes: source.sessionMinutes,
    roadmap: source.roadmap ? { ...source.roadmap, ...(onDevice ? { onDevice: true } : {}) } : undefined,
    attribution: source.attribution ?? source.owner ?? source.title,
    goals: starterGoals.map(goal => ({
      ...goal, id: goalIds.get(goal.id), prerequisites: goal.prerequisites.map(id => goalIds.get(id) ?? id), completed: false,
    })),
  });
}
