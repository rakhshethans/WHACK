import { getStage } from '../world.mjs';
import { SKILLS } from '../roadmaps.mjs';

const STARTER_XP_AWARDS = [40, 60, 65, 85, 110, 140, 175, 225];
const VALID_CATEGORIES = new Set(['guitar', 'songwriting', 'photography', 'custom']);
const VALID_EXPERIENCES = new Set(['beginner', 'intermediate', 'advanced']);

/**
 * Sanitises a single goal into a public starter goal template.
 * Strips owner completion state, timestamps, difficulty adjustments, and XP awards.
 */
export function toPublicGoal(goal, index = 0) {
  if (!goal || goal.continuation) return null;
  const id = String(goal.id || `goal-${index + 1}`).trim();
  const title = String(goal.title ?? '').trim();
  const practiceText = String(goal.description ?? goal.practice ?? '').trim();
  const finish = String(goal.finish ?? '').trim();
  if (!title || !practiceText || !finish) return null;

  const minutes = Math.min(120, Math.max(1, Math.round(Number(goal.minutes)) || 15));
  const prerequisites = Array.isArray(goal.prerequisites)
    ? goal.prerequisites.map(item => String(item).trim()).filter(Boolean)
    : index > 0 ? [`goal-${index}`] : [];

  return {
    id,
    title,
    description: practiceText,
    practice: practiceText,
    finish,
    minutes,
    prerequisites,
  };
}

/**
 * Projects an island record into a safe PublicIsland.
 * Publishing is strictly opt-in per island (`isPublic === true`).
 * Never exposes private objectives, per-goal completion progress, or raw browser storage.
 */
export function toPublicIsland(rawIsland, owner = {}) {
  if (!rawIsland || rawIsland.isPublic !== true) return null;

  const category = VALID_CATEGORIES.has(rawIsland.category) ? rawIsland.category : 'guitar';
  const topic = category === 'custom' ? String(rawIsland.topic ?? '').trim() || undefined : undefined;
  const theme = rawIsland.theme ? String(rawIsland.theme).trim() : undefined;
  const experience = VALID_EXPERIENCES.has(rawIsland.experience) ? rawIsland.experience : 'beginner';
  const sessionMinutes = Math.min(120, Math.max(1, Math.round(Number(rawIsland.sessionMinutes ?? rawIsland.minutes)) || 20));
  const xp = Math.max(0, Math.floor(Number(rawIsland.xp) || 0));
  const stage = getStage(xp);

  const starterGoals = Array.isArray(rawIsland.goals)
    ? rawIsland.goals.filter(goal => !goal?.continuation).map((goal, idx) => toPublicGoal(goal, idx)).filter(Boolean)
    : [];

  const focus = String(rawIsland.roadmap?.focus ?? topic ?? SKILLS[category]?.label ?? 'Skill practice').trim();
  const checkpoint = String(rawIsland.roadmap?.checkpoint ?? '').trim();
  const next = rawIsland.roadmap?.next ? String(rawIsland.roadmap.next).trim() : undefined;

  // Only include summary text that the owner explicitly chose to share publicly
  const explicitSummary = String(rawIsland.publicSummary ?? '').trim();
  const sharedObjective = rawIsland.shareObjective === true ? String(rawIsland.objective ?? '').trim() : '';
  const publicSummary = explicitSummary || sharedObjective || focus;

  const creatorName = String(owner.displayName ?? rawIsland.creatorName ?? rawIsland.attribution ?? 'Explorer').trim();
  const creatorHandle = String(owner.handle ?? rawIsland.creatorHandle ?? 'explorer').trim();

  const result = {
    id: String(rawIsland.id ?? '').trim(),
    ownerId: String(rawIsland.ownerId ?? owner.id ?? '').trim(),
    creatorName,
    creatorHandle,
    isSample: Boolean(owner.isSample ?? rawIsland.isSample),
    title: String(rawIsland.title ?? '').trim() || 'Untitled Island',
    category,
    experience,
    sessionMinutes,
    xp,
    level: stage.level,
    stageName: stage.name,
    publicSummary,
    roadmap: {
      focus,
      checkpoint,
      ...(next ? { next } : {}),
    },
    goals: starterGoals,
  };

  if (topic) result.topic = topic;
  if (theme) result.theme = theme;
  if (rawIsland.attribution) result.attribution = String(rawIsland.attribution).trim();
  if (rawIsland.sharedMilestone) {
    result.sharedMilestone = String(rawIsland.sharedMilestone).trim();
  }

  return result;
}

/**
 * Projects a raw user/profile record into a safe PublicProfile.
 * Excludes email, private notes, raw browser storage, and unpublished islands.
 */
export function toPublicProfile(
  rawProfile,
  {
    viewerId = null,
    followingIds = new Set(),
    followerIds = new Set(),
    blockedIds = new Set(),
  } = {},
) {
  if (!rawProfile || rawProfile.isPublic === false) return null;
  const id = String(rawProfile.id ?? '').trim();
  if (!id || blockedIds.has(id)) return null;

  const handle = String(rawProfile.handle ?? id).trim().replace(/^@/, '');
  const displayName = String(rawProfile.displayName ?? handle).trim();
  const bio = String(rawProfile.bio ?? '').trim();
  const interests = Array.isArray(rawProfile.interests)
    ? rawProfile.interests.map(item => String(item).trim()).filter(Boolean)
    : [];

  const rawIslands = Array.isArray(rawProfile.islands) ? rawProfile.islands : [];
  const publicIslands = rawIslands
    .map(island => toPublicIsland(island, { id, handle, displayName, isSample: Boolean(rawProfile.isSample) }))
    .filter(Boolean);

  const isFollowing = followingIds instanceof Set
    ? followingIds.has(id)
    : Array.isArray(followingIds)
      ? followingIds.includes(id)
      : Boolean(rawProfile.isFollowing);

  const followsViewer = followerIds instanceof Set
    ? followerIds.has(id)
    : Array.isArray(followerIds)
      ? followerIds.includes(id)
      : Boolean(rawProfile.followsViewer);

  return {
    id,
    handle,
    displayName,
    bio,
    interests,
    isSample: Boolean(rawProfile.isSample),
    followerCount: Math.max(0, Number(rawProfile.followerCount) || 0),
    followingCount: Math.max(0, Number(rawProfile.followingCount) || 0),
    isFollowing: id === viewerId ? false : isFollowing,
    followsViewer: id === viewerId ? false : followsViewer,
    publicIslandCount: publicIslands.length,
    publicIslands,
  };
}

/**
 * Converts a PublicIsland into an AdoptableRoadmapTemplate suitable for `onAdopt(template)`
 * and directly compatible with `adoptIsland(world, template)` in `src/world.mjs`.
 */
export function toAdoptableRoadmap(publicIsland, ownerProfile = {}) {
  if (!publicIsland) {
    throw new Error('Cannot build an adoptable roadmap without a public island.');
  }
  const creatorDisplayName = String(
    ownerProfile.displayName ?? publicIsland.creatorName ?? publicIsland.attribution ?? 'Explorer',
  ).trim();
  const creatorHandle = String(
    ownerProfile.handle ?? publicIsland.creatorHandle ?? 'explorer',
  ).trim().replace(/^@/, '');
  const creatorId = String(ownerProfile.id ?? publicIsland.ownerId ?? '').trim();
  const isSample = Boolean(ownerProfile.isSample ?? publicIsland.isSample);

  const starterGoals = (publicIsland.goals ?? [])
    .filter(goal => !goal?.continuation)
    .map((goal, index) => {
      const id = String(goal.id || `goal-${index + 1}`).trim();
      const practice = String(goal.practice ?? goal.description ?? '').trim();
      return {
        id,
        title: String(goal.title ?? '').trim(),
        description: practice,
        practice,
        finish: String(goal.finish ?? '').trim(),
        minutes: Math.min(120, Math.max(1, Math.round(Number(goal.minutes)) || 15)),
        xp: STARTER_XP_AWARDS[index] ?? STARTER_XP_AWARDS.at(-1),
        prerequisites: Array.isArray(goal.prerequisites) ? [...goal.prerequisites] : index > 0 ? [`goal-${index}`] : [],
        completed: false,
      };
    });

  const category = VALID_CATEGORIES.has(publicIsland.category) ? publicIsland.category : 'guitar';
  const objective = String(
    publicIsland.publicSummary ?? publicIsland.roadmap?.focus ?? publicIsland.topic ?? SKILLS[category]?.objective ?? '',
  ).trim();

  const template = {
    title: String(publicIsland.title ?? 'Adopted Island').trim(),
    category,
    experience: VALID_EXPERIENCES.has(publicIsland.experience) ? publicIsland.experience : 'beginner',
    objective,
    sessionMinutes: Math.min(120, Math.max(1, Math.round(Number(publicIsland.sessionMinutes)) || 20)),
    xp: 0,
    attribution: publicIsland.attribution || creatorDisplayName,
    owner: creatorDisplayName,
    creator: {
      id: creatorId,
      handle: creatorHandle,
      displayName: creatorDisplayName,
      isSample,
      sourceIslandId: String(publicIsland.id ?? ''),
    },
    roadmap: {
      focus: String(publicIsland.roadmap?.focus ?? objective).trim(),
      checkpoint: String(publicIsland.roadmap?.checkpoint ?? '').trim(),
      ...(publicIsland.roadmap?.next ? { next: String(publicIsland.roadmap.next).trim() } : {}),
    },
    goals: starterGoals,
  };

  if (publicIsland.topic) template.topic = String(publicIsland.topic).trim();
  if (publicIsland.theme) template.theme = String(publicIsland.theme).trim();

  return template;
}

/**
 * Validates an adoptable starter template before creation.
 * Checks required metadata, goal titles, practice instructions, finish conditions,
 * and prerequisite graph integrity.
 */
export function validateAdoptableRoadmap(template) {
  const errors = [];
  if (!template || typeof template !== 'object') {
    return { valid: false, errors: ['Template must be an object.'] };
  }
  if (!String(template.title ?? '').trim()) {
    errors.push('Template title is required.');
  }
  if (!VALID_CATEGORIES.has(template.category)) {
    errors.push('Template category must be guitar, songwriting, photography, or custom.');
  }
  if (template.category === 'custom' && !String(template.topic ?? '').trim()) {
    errors.push('Custom island templates require a topic.');
  }
  if (!String(template.attribution ?? template.creator?.displayName ?? '').trim()) {
    errors.push('Creator attribution is required.');
  }
  if (!Array.isArray(template.goals) || template.goals.length === 0) {
    errors.push('At least one starter goal is required.');
    return { valid: false, errors };
  }

  const seenIds = new Set();
  for (const [index, goal] of template.goals.entries()) {
    const label = `Goal ${index + 1}`;
    const id = String(goal?.id ?? '').trim();
    if (!id) errors.push(`${label} is missing an id.`);
    if (seenIds.has(id)) errors.push(`${label} has a duplicate id "${id}".`);
    seenIds.add(id);

    if (!String(goal?.title ?? '').trim()) {
      errors.push(`${label} is missing a title.`);
    }
    if (!String(goal?.practice ?? goal?.description ?? '').trim()) {
      errors.push(`${label} is missing practice instructions.`);
    }
    if (!String(goal?.finish ?? '').trim()) {
      errors.push(`${label} is missing a finish condition.`);
    }
    if (!Array.isArray(goal?.prerequisites)) {
      errors.push(`${label} prerequisites must be an array.`);
    } else {
      for (const prereqId of goal.prerequisites) {
        if (prereqId === id) {
          errors.push(`${label} cannot depend on itself.`);
        } else if (!seenIds.has(prereqId)) {
          errors.push(`${label} prerequisite "${prereqId}" must refer to an earlier starter goal.`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
