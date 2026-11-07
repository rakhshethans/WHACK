import { SKILLS } from '../roadmaps.mjs';

const COMPLEMENTARY_SKILLS = {
  guitar: ['songwriting', 'people', 'speaking'],
  songwriting: ['guitar', 'speaking', 'photography'],
  photography: ['visual', 'songwriting', 'language'],
  people: ['speaking', 'language', 'guitar'],
  speaking: ['people', 'songwriting', 'board'],
  language: ['people', 'speaking', 'photography'],
  visual: ['photography', 'songwriting', 'compass'],
  board: ['speaking', 'people', 'compass'],
  compass: ['people', 'photography', 'guitar'],
};

function islandSkillKey(island) {
  if (!island) return 'guitar';
  if (island.category === 'custom') {
    return island.theme || (island.topic ? island.topic.toLowerCase() : 'compass');
  }
  return island.category || 'guitar';
}

function islandSkillLabel(island) {
  if (!island) return 'Skill';
  if (island.category === 'custom' && island.topic) return island.topic;
  if (Object.hasOwn(SKILLS, island.category)) return SKILLS[island.category].label;
  return island.title || 'Skill';
}

/**
 * Deterministic, explainable people recommendation engine.
 * Classifies compatible public profiles into:
 * - "Similar Explorers"
 * - "Mentor Matches"
 * - "Discovery Matches"
 */
export function recommendExplorers(viewerWorld, publicProfiles = [], { viewerId = null, blockedIds = new Set() } = {}) {
  const viewerIslands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  const viewerSkills = new Map();

  for (const island of viewerIslands) {
    const key = islandSkillKey(island);
    const level = island.level ?? Math.max(1, Math.floor((island.xp ?? 0) / 100) + 1);
    const prev = viewerSkills.get(key);
    if (!prev || level > prev.level) {
      viewerSkills.set(key, { key, label: islandSkillLabel(island), level, title: island.title });
    }
  }

  // Default seed interest if viewer has an empty ocean so new users still get explainable matches
  const hasViewerIslands = viewerSkills.size > 0;
  const primaryViewerSkill = hasViewerIslands
    ? [...viewerSkills.values()][0]
    : { key: 'guitar', label: 'Guitar', level: 1, title: 'your first island' };

  const candidates = publicProfiles.filter(profile => (
    profile &&
    profile.id &&
    profile.id !== viewerId &&
    !blockedIds.has(profile.id) &&
    Array.isArray(profile.publicIslands) &&
    profile.publicIslands.length > 0
  ));

  const scored = candidates.map(profile => {
    const sharedIslands = [];
    const mentorIslands = [];
    const novelIslands = [];
    const complementaryIslands = [];

    for (const island of profile.publicIslands) {
      const key = islandSkillKey(island);
      const viewerSkill = viewerSkills.get(key);
      if (viewerSkill) {
        sharedIslands.push({ island, viewerSkill });
        if ((island.level ?? 1) > viewerSkill.level) {
          mentorIslands.push({ island, viewerSkill });
        }
      } else {
        novelIslands.push(island);
        const complements = COMPLEMENTARY_SKILLS[primaryViewerSkill.key] ?? [];
        if (complements.includes(key) || complements.includes(island.category)) {
          complementaryIslands.push(island);
        }
      }
    }

    const maxIslandLevel = Math.max(...profile.publicIslands.map(i => i.level ?? 1));
    const similarScore = sharedIslands.length * 30 + (profile.publicIslands.length * 4);
    const mentorScore = mentorIslands.length * 45 + maxIslandLevel * 8 + (sharedIslands.length * 10);
    const discoveryScore = complementaryIslands.length * 35 + novelIslands.length * 20 + maxIslandLevel * 3;

    return {
      profile,
      sharedIslands,
      mentorIslands,
      novelIslands,
      complementaryIslands,
      maxIslandLevel,
      similarScore,
      mentorScore,
      discoveryScore,
    };
  });

  const results = [];
  const assignedIds = new Set();

  // 1. Mentor Match: highest mentorScore (or highest level shared/featured island)
  const mentorCandidate = [...scored]
    .sort((a, b) => b.mentorScore - a.mentorScore || b.maxIslandLevel - a.maxIslandLevel)
    .find(item => !assignedIds.has(item.profile.id));

  if (mentorCandidate) {
    assignedIds.add(mentorCandidate.profile.id);
    const featured = mentorCandidate.mentorIslands[0]?.island
      ?? mentorCandidate.sharedIslands[0]?.island
      ?? mentorCandidate.profile.publicIslands[0];
    const skillLabel = islandSkillLabel(featured);
    const reason = mentorCandidate.mentorIslands.length > 0
      ? `${mentorCandidate.profile.displayName} has reached Level ${featured.level} (${featured.stageName}) in ${skillLabel} with "${featured.title}" and shares a structured roadmap you can adopt.`
      : `${mentorCandidate.profile.displayName} has developed "${featured.title}" to Level ${featured.level} (${featured.stageName}) in ${skillLabel}, offering a proven progression path.`;

    results.push({
      category: 'Mentor Matches',
      profile: mentorCandidate.profile,
      featuredIsland: featured,
      score: mentorCandidate.mentorScore,
      reason,
    });
  }

  // 2. Similar Explorer: shares an interest or similar pace
  const similarCandidate = [...scored]
    .sort((a, b) => b.similarScore - a.similarScore || a.maxIslandLevel - b.maxIslandLevel)
    .find(item => !assignedIds.has(item.profile.id));

  if (similarCandidate) {
    assignedIds.add(similarCandidate.profile.id);
    const shared = similarCandidate.sharedIslands[0]?.island ?? similarCandidate.profile.publicIslands[0];
    const skillLabel = islandSkillLabel(shared);
    const reason = similarCandidate.sharedIslands.length > 0
      ? `Both of you are charting ${skillLabel} islands — ${similarCandidate.profile.displayName}'s "${shared.title}" focuses on ${shared.roadmap?.focus?.toLowerCase() || skillLabel.toLowerCase()}.`
      : `${similarCandidate.profile.displayName} builds structured ${skillLabel} sessions (${shared.sessionMinutes} min) at a steady pace alongside your archipelago.`;

    results.push({
      category: 'Similar Explorers',
      profile: similarCandidate.profile,
      featuredIsland: shared,
      score: similarCandidate.similarScore,
      reason,
    });
  }

  // 3. Discovery Match: introduces an unfamiliar or complementary skill
  const discoveryCandidate = [...scored]
    .sort((a, b) => b.discoveryScore - a.discoveryScore)
    .find(item => !assignedIds.has(item.profile.id));

  if (discoveryCandidate) {
    assignedIds.add(discoveryCandidate.profile.id);
    const novel = discoveryCandidate.complementaryIslands[0]
      ?? discoveryCandidate.novelIslands[0]
      ?? discoveryCandidate.profile.publicIslands[0];
    const novelLabel = islandSkillLabel(novel);
    const reason = hasViewerIslands && discoveryCandidate.complementaryIslands.length > 0
      ? `Because you practise ${primaryViewerSkill.label}, ${discoveryCandidate.profile.displayName}'s ${novelLabel} island ("${novel.title}") connects your skills to a new world.`
      : `${discoveryCandidate.profile.displayName} opens a new world in ${novelLabel} with "${novel.title}" (${novel.roadmap?.focus || novel.publicSummary}).`;

    results.push({
      category: 'Discovery Matches',
      profile: discoveryCandidate.profile,
      featuredIsland: novel,
      score: discoveryCandidate.discoveryScore,
      reason,
    });
  }

  // Include any remaining profiles with their strongest category so larger directories stay browsable
  for (const item of scored) {
    if (assignedIds.has(item.profile.id)) continue;
    const featured = item.novelIslands[0] ?? item.profile.publicIslands[0];
    const label = islandSkillLabel(featured);
    results.push({
      category: item.sharedIslands.length > 0 ? 'Similar Explorers' : 'Discovery Matches',
      profile: item.profile,
      featuredIsland: featured,
      score: Math.max(item.similarScore, item.discoveryScore),
      reason: `${item.profile.displayName} shares "${featured.title}", charting ${label} (${featured.roadmap?.focus || featured.publicSummary}).`,
    });
  }

  return results;
}
