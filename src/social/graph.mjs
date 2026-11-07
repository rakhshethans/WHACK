import { SKILLS } from '../roadmaps.mjs';
import { getStage } from '../world.mjs';

/**
 * Curated complementary skill relationships (1-hop related skill bridges).
 * Keys are canonical skill keys produced by `normalizeSkill`.
 */
export const RELATED_SKILLS = {
  guitar: ['songwriting', 'public-speaking', 'meeting-people'],
  songwriting: ['guitar', 'public-speaking', 'photography'],
  photography: ['visual-storytelling', 'songwriting', 'urban-sketching'],
  'visual-storytelling': ['photography', 'origami', 'public-speaking'],
  'public-speaking': ['meeting-people', 'songwriting', 'chess'],
  'meeting-people': ['public-speaking', 'japanese', 'spanish', 'french'],
  japanese: ['origami', 'spanish', 'french', 'meeting-people'],
  spanish: ['japanese', 'french', 'meeting-people', 'guitar'],
  french: ['spanish', 'japanese', 'photography'],
  chess: ['shogi', 'public-speaking', 'origami'],
  shogi: ['chess', 'japanese'],
  origami: ['japanese', 'visual-storytelling', 'chess'],
  'urban-sketching': ['photography', 'visual-storytelling', 'origami'],
};

const TOPIC_PATTERNS = [
  { pattern: /\bjapanese\b/i, skillKey: 'japanese', skillLabel: 'Japanese', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bspanish\b/i, skillKey: 'spanish', skillLabel: 'Spanish', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bfrench\b/i, skillKey: 'french', skillLabel: 'French', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bmandarin\b/i, skillKey: 'mandarin', skillLabel: 'Mandarin', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bkorean\b/i, skillKey: 'korean', skillLabel: 'Korean', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bgerman\b/i, skillKey: 'german', skillLabel: 'German', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\bitalian\b/i, skillKey: 'italian', skillLabel: 'Italian', themeKey: 'language', themeLabel: 'Language' },
  { pattern: /\borigami|paper folding\b/i, skillKey: 'origami', skillLabel: 'Origami', themeKey: 'craft', themeLabel: 'Paper craft' },
  { pattern: /\bchess\b/i, skillKey: 'chess', skillLabel: 'Chess', themeKey: 'board', themeLabel: 'Strategy games' },
  { pattern: /\bshogi\b/i, skillKey: 'shogi', skillLabel: 'Shogi', themeKey: 'board', themeLabel: 'Strategy games' },
  { pattern: /\bcheckers\b/i, skillKey: 'checkers', skillLabel: 'Checkers', themeKey: 'board', themeLabel: 'Strategy games' },
  { pattern: /\bpublic speaking|debate|give a (?:short )?(?:talk|speech)|present(?:ation)?\b/i, skillKey: 'public-speaking', skillLabel: 'Public speaking', themeKey: 'speaking', themeLabel: 'Speaking' },
  { pattern: /\bvisual storytelling|photo essay|photo story|documentary\b/i, skillKey: 'visual-storytelling', skillLabel: 'Visual storytelling', themeKey: 'visual', themeLabel: 'Visual arts' },
  { pattern: /\bmeet(?:ing)? (?:new )?people|make friends|social confidence|networking\b/i, skillKey: 'meeting-people', skillLabel: 'Meeting new people', themeKey: 'people', themeLabel: 'Community' },
  { pattern: /\bsketch(?:ing)?|drawing\b/i, skillKey: 'urban-sketching', skillLabel: 'Urban sketching', themeKey: 'visual', themeLabel: 'Visual arts' },
  { pattern: /\bguitar\b/i, skillKey: 'guitar', skillLabel: 'Guitar', themeKey: 'music', themeLabel: 'Music' },
  { pattern: /\bsongwriting\b/i, skillKey: 'songwriting', skillLabel: 'Songwriting', themeKey: 'music', themeLabel: 'Music' },
  { pattern: /\bphotograph(?:y|er)?\b/i, skillKey: 'photography', skillLabel: 'Photography', themeKey: 'visual', themeLabel: 'Visual arts' },
];

function slugifySkill(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'skill';
}

/**
 * Normalizes an island or interest into an exact skill key/label and an optional broad theme.
 * Preserves exact skills (e.g. Japanese vs Spanish) and never uses the generic 'compass' artwork
 * fallback as a shared skill or theme link.
 */
export function normalizeIslandSkill(island) {
  if (!island) {
    return { skillKey: 'guitar', skillLabel: 'Guitar', themeKey: 'music', themeLabel: 'Music' };
  }

  const category = String(island.category ?? '').trim().toLowerCase();
  if (category === 'guitar') {
    return { skillKey: 'guitar', skillLabel: 'Guitar', themeKey: 'music', themeLabel: 'Music' };
  }
  if (category === 'songwriting') {
    return { skillKey: 'songwriting', skillLabel: 'Songwriting', themeKey: 'music', themeLabel: 'Music' };
  }
  if (category === 'photography') {
    return { skillKey: 'photography', skillLabel: 'Photography', themeKey: 'visual', themeLabel: 'Visual arts' };
  }

  const rawTopic = String(island.topic || island.roadmap?.focus || island.title || '').trim();
  for (const entry of TOPIC_PATTERNS) {
    if (entry.pattern.test(rawTopic)) {
      return {
        skillKey: entry.skillKey,
        skillLabel: entry.skillLabel,
        themeKey: entry.themeKey,
        themeLabel: entry.themeLabel,
      };
    }
  }

  // Fallback for custom skills: keep exact topic slug distinct; only keep non-compass theme as a weak bridge
  const skillKey = slugifySkill(rawTopic || category || 'custom-skill');
  const skillLabel = rawTopic || (Object.hasOwn(SKILLS, category) ? SKILLS[category].label : 'Custom skill');
  const rawTheme = String(island.theme ?? '').trim().toLowerCase();
  const validTheme = rawTheme && rawTheme !== 'compass' && rawTheme !== 'custom' ? rawTheme : null;
  const themeLabels = {
    language: 'Language',
    board: 'Strategy games',
    speaking: 'Speaking',
    visual: 'Visual arts',
    people: 'Community',
    origami: 'Paper craft',
    music: 'Music',
  };

  return {
    skillKey,
    skillLabel,
    themeKey: validTheme,
    themeLabel: validTheme ? (themeLabels[validTheme] || validTheme) : null,
  };
}

/**
 * Normalizes a profile interest tag (e.g. 'guitar', 'speaking', 'Japanese') to match the skill graph.
 */
export function normalizeInterestToken(token) {
  const raw = String(token ?? '').trim();
  if (!raw) return null;
  for (const entry of TOPIC_PATTERNS) {
    if (entry.pattern.test(raw)) {
      return entry;
    }
  }
  const lower = raw.toLowerCase();
  if (lower === 'speaking') {
    return { skillKey: 'public-speaking', skillLabel: 'Public speaking', themeKey: 'speaking', themeLabel: 'Speaking' };
  }
  if (lower === 'people') {
    return { skillKey: 'meeting-people', skillLabel: 'Meeting new people', themeKey: 'people', themeLabel: 'Community' };
  }
  if (lower === 'visual') {
    return { skillKey: 'visual-storytelling', skillLabel: 'Visual storytelling', themeKey: 'visual', themeLabel: 'Visual arts' };
  }
  if (lower === 'board') {
    return { skillKey: 'chess', skillLabel: 'Chess', themeKey: 'board', themeLabel: 'Strategy games' };
  }
  if (lower === 'language') {
    return { skillKey: null, skillLabel: null, themeKey: 'language', themeLabel: 'Language' };
  }
  return {
    skillKey: slugifySkill(raw),
    skillLabel: raw,
    themeKey: null,
    themeLabel: null,
  };
}

/**
 * Builds a directed weighted graph over:
 * - `user:viewer` and `user:<profile.id>`
 * - `skill:<skillKey>` (exact skill nodes)
 * - `theme:<themeKey>` (broad non-compass theme nodes)
 *
 * And runs Personalized PageRank (Random Walk with Restart from `user:viewer`, alpha = 0.80,
 * with dangling nodes returning mass to `user:viewer`) alongside Adamic-Adar inverse-frequency
 * skill similarity.
 */
export function buildInterestGraph(viewerWorld, candidateProfiles = []) {
  const nodes = new Set(['user:viewer']);
  const outEdges = new Map();

  function addDirectedEdge(from, to, weight) {
    if (!from || !to || from === to || weight <= 0) return;
    nodes.add(from);
    nodes.add(to);
    let map = outEdges.get(from);
    if (!map) {
      map = new Map();
      outEdges.set(from, map);
    }
    map.set(to, (map.get(to) ?? 0) + weight);
  }

  function addSymmetricEdge(a, b, weight) {
    addDirectedEdge(a, b, weight);
    addDirectedEdge(b, a, weight);
  }

  const viewerIslands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  for (const island of viewerIslands) {
    const { skillKey, themeKey } = normalizeIslandSkill(island);
    const level = island.level ?? Math.max(1, Math.floor((island.xp ?? 0) / 100) + 1);
    const skillNode = `skill:${skillKey}`;
    addSymmetricEdge('user:viewer', skillNode, 3.0 + 0.3 * level);
    if (themeKey) {
      addSymmetricEdge(skillNode, `theme:${themeKey}`, 0.9);
    }
  }

  // Add curated related-skill edges
  for (const [skillKey, relatedList] of Object.entries(RELATED_SKILLS)) {
    for (const relatedKey of relatedList) {
      addDirectedEdge(`skill:${skillKey}`, `skill:${relatedKey}`, 1.25);
    }
  }

  for (const profile of candidateProfiles) {
    const userNode = `user:${profile.id}`;
    nodes.add(userNode);

    if (profile.isFollowing) {
      addDirectedEdge('user:viewer', userNode, 1.5);
      addDirectedEdge(userNode, 'user:viewer', 0.8);
    }
    if (profile.followsViewer) {
      addDirectedEdge('user:viewer', userNode, 0.9);
      addDirectedEdge(userNode, 'user:viewer', 1.2);
    }

    const seenProfileSkills = new Set();
    for (const island of profile.publicIslands ?? []) {
      const { skillKey, themeKey } = normalizeIslandSkill(island);
      seenProfileSkills.add(skillKey);
      const level = island.level ?? 1;
      const skillNode = `skill:${skillKey}`;
      addSymmetricEdge(userNode, skillNode, 2.5 + 0.25 * level);
      if (themeKey) {
        addSymmetricEdge(skillNode, `theme:${themeKey}`, 0.9);
      }
    }

    for (const token of profile.interests ?? []) {
      const norm = normalizeInterestToken(token);
      if (!norm) continue;
      if (norm.skillKey && !seenProfileSkills.has(norm.skillKey)) {
        addSymmetricEdge(userNode, `skill:${norm.skillKey}`, 1.1);
      } else if (norm.themeKey) {
        addSymmetricEdge(userNode, `theme:${norm.themeKey}`, 0.65);
      }
    }
  }

  return { nodes: [...nodes], outEdges };
}

export function computePersonalizedPageRank(graph, {
  startNode = 'user:viewer',
  alpha = 0.80,
  iterations = 24,
} = {}) {
  const { nodes, outEdges } = graph;
  const nodeIndex = new Map(nodes.map((id, idx) => [id, idx]));
  const n = nodes.length;
  if (n === 0 || !nodeIndex.has(startNode)) return new Map();

  const startIdx = nodeIndex.get(startNode);
  let scores = new Float64Array(n);
  scores[startIdx] = 1.0;

  for (let step = 0; step < iterations; step += 1) {
    const next = new Float64Array(n);
    next[startIdx] += 1 - alpha;

    for (let u = 0; u < n; u += 1) {
      const currentMass = scores[u];
      if (currentMass === 0) continue;
      const uId = nodes[u];
      const edges = outEdges.get(uId);
      if (!edges || edges.size === 0) {
        // Dangling node returns its walk mass to the restart node
        next[startIdx] += alpha * currentMass;
        continue;
      }
      let totalWeight = 0;
      for (const w of edges.values()) totalWeight += w;
      if (totalWeight <= 0) {
        next[startIdx] += alpha * currentMass;
        continue;
      }
      for (const [vId, w] of edges.entries()) {
        const v = nodeIndex.get(vId);
        if (v !== undefined) {
          next[v] += alpha * currentMass * (w / totalWeight);
        }
      }
    }
    scores = next;
  }

  const result = new Map();
  for (let i = 0; i < n; i += 1) {
    result.set(nodes[i], scores[i]);
  }
  return result;
}

/**
 * Level complementarity between two explorers on the same skill, in [0, 1).
 * Scale-independent: Lv 1 vs Lv 50 -> 0.98 (mentor-style), Lv 37 vs Lv 50 -> 0.26, equal levels -> 0.
 */
export function levelComplementarity(levelA, levelB) {
  const a = Math.max(1, Number(levelA) || 1);
  const b = Math.max(1, Number(levelB) || 1);
  return Math.abs(a - b) / Math.max(a, b);
}

function islandLevel(island) {
  if (Number.isFinite(island?.level)) return island.level;
  return getStage(island?.xp ?? 0).level;
}

/**
 * Ranks public explorer profiles around the viewer.
 *
 * Eligibility: an explorer is only recommended when they share at least one exact skill/interest with
 * the viewer (via a public island or a declared interest). There is no quota, so 0-`limit` neighbours
 * are returned (default limit 8).
 *
 * Scoring prioritises mentor-style matches: each shared skill contributes
 * `rarity * (0.35 + 1.65 * levelComplementarity)`, so a large level gap on the same skill outranks
 * near-equal levels. Related-skill bridges, follow ties and Personalized PageRank only add small
 * secondary boosts among already-eligible explorers. Ties break on `profile.id`.
 */
export function rankNeighborsByGraph(
  viewerWorld,
  publicProfiles = [],
  {
    viewerId = null,
    blockedIds = new Set(),
    limit = 8,
  } = {},
) {
  const maxCount = Math.max(1, Math.min(10, Number(limit) || 8));
  const blocked = blockedIds instanceof Set ? blockedIds : new Set(blockedIds);

  const candidates = (publicProfiles ?? []).filter(profile => (
    profile &&
    profile.id &&
    profile.id !== viewerId &&
    !blocked.has(profile.id) &&
    Array.isArray(profile.publicIslands) &&
    profile.publicIslands.length > 0
  ));

  const viewerIslands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  const viewerSkills = new Map();
  for (const island of viewerIslands) {
    const norm = normalizeIslandSkill(island);
    const level = islandLevel(island);
    const existing = viewerSkills.get(norm.skillKey);
    if (!existing || level > existing.level) {
      viewerSkills.set(norm.skillKey, { ...norm, level, islandTitle: island.title });
    }
  }

  // No shared interests are possible without viewer skills, so nobody is recommended.
  if (candidates.length === 0 || viewerSkills.size === 0) return [];

  // Collect each candidate's exact skills (islands carry a level; declared interests do not)
  const skillExplorerCounts = new Map();
  const candidateSkillsMap = new Map();
  for (const profile of candidates) {
    const skills = new Map();
    for (const island of profile.publicIslands) {
      const norm = normalizeIslandSkill(island);
      const level = islandLevel(island);
      const existing = skills.get(norm.skillKey);
      if (!existing || (existing.level ?? 0) < level) {
        skills.set(norm.skillKey, { ...norm, island, level });
      }
    }
    for (const token of profile.interests ?? []) {
      const norm = normalizeInterestToken(token);
      if (norm?.skillKey && !skills.has(norm.skillKey)) {
        skills.set(norm.skillKey, { ...norm, island: null, level: null });
      }
    }
    candidateSkillsMap.set(profile.id, skills);
    for (const skillKey of skills.keys()) {
      skillExplorerCounts.set(skillKey, (skillExplorerCounts.get(skillKey) ?? 0) + 1);
    }
  }

  const graph = buildInterestGraph(viewerWorld, candidates);
  const pprMap = computePersonalizedPageRank(graph, { startNode: 'user:viewer' });
  let maxRawPpr = 0;
  for (const profile of candidates) {
    maxRawPpr = Math.max(maxRawPpr, pprMap.get(`user:${profile.id}`) ?? 0);
  }

  const evaluated = [];
  for (const profile of candidates) {
    const cSkills = candidateSkillsMap.get(profile.id) ?? new Map();
    const sharedSkills = [];
    let relatedBridgeCount = 0;

    for (const [skillKey, info] of cSkills.entries()) {
      const viewerSkill = viewerSkills.get(skillKey);
      if (viewerSkill) {
        const df = skillExplorerCounts.get(skillKey) ?? 1;
        const rarity = 18 / Math.log(1.7 + df);
        // Interest-only matches have no level to compare, so they score as a modest neutral gap.
        const complementarity = info.level == null ? 0.3 : levelComplementarity(viewerSkill.level, info.level);
        sharedSkills.push({
          skillKey,
          skillLabel: info.skillLabel,
          viewerLevel: viewerSkill.level,
          theirLevel: info.level,
          complementarity,
          score: rarity * (0.35 + 1.65 * complementarity),
          island: info.island,
        });
      } else if ([...viewerSkills.keys()].some(v => (RELATED_SKILLS[v] ?? []).includes(skillKey))) {
        relatedBridgeCount += 1;
      }
    }

    if (sharedSkills.length === 0) continue; // Only recommend explorers who share an interest

    sharedSkills.sort((a, b) => b.score - a.score || a.skillKey.localeCompare(b.skillKey));

    const sharedScore = sharedSkills.reduce((sum, item) => sum + item.score, 0);
    const bridgeScore = relatedBridgeCount * 2;
    const socialScore = (profile.isFollowing ? 2 : 0) + (profile.followsViewer ? 1 : 0);
    const rawPpr = pprMap.get(`user:${profile.id}`) ?? 0;
    const pprScore = maxRawPpr > 0 ? (rawPpr / maxRawPpr) * 3 : 0;
    const baselineScore = sharedScore + bridgeScore + socialScore;
    const score = Number((baselineScore + pprScore).toFixed(4));

    const top = sharedSkills[0];
    let matchType;
    let reasonLabel;
    let reasonDetail;
    if (top.theirLevel == null) {
      matchType = 'shared-interest';
      reasonLabel = `Shared interest · ${top.skillLabel}`;
      reasonDetail = `${profile.displayName} lists ${top.skillLabel} as an interest.`;
    } else if (top.theirLevel > top.viewerLevel) {
      matchType = 'mentor';
      reasonLabel = `Mentor · ${top.skillLabel} Lv ${top.theirLevel} (you Lv ${top.viewerLevel})`;
      reasonDetail = `${profile.displayName} is further along in ${top.skillLabel} with "${top.island.title}" and can guide your next steps.`;
    } else if (top.theirLevel < top.viewerLevel) {
      matchType = 'mentee';
      reasonLabel = `You could mentor · ${top.skillLabel} Lv ${top.theirLevel} (you Lv ${top.viewerLevel})`;
      reasonDetail = `${profile.displayName} is earlier in ${top.skillLabel} with "${top.island.title}", a skill where you are ahead.`;
    } else {
      matchType = 'peer';
      reasonLabel = `Peer · ${top.skillLabel} Lv ${top.theirLevel}`;
      reasonDetail = `${profile.displayName} is at the same level in ${top.skillLabel} with "${top.island.title}".`;
    }
    if (sharedSkills.length > 1) {
      reasonDetail += ` Also shares ${sharedSkills.slice(1).map(s => s.skillLabel).join(' & ')}.`;
    }

    evaluated.push({
      profile,
      score,
      baselineScore: Number(baselineScore.toFixed(4)),
      pprScore: Number(pprScore.toFixed(4)),
      hopCount: 1,
      matchType,
      complementarity: Number(top.complementarity.toFixed(4)),
      sharedSkills: sharedSkills.map(s => s.skillLabel),
      reasonLabel,
      reasonDetail,
    });
  }

  evaluated.sort((a, b) => b.score - a.score || a.profile.id.localeCompare(b.profile.id));

  return evaluated.slice(0, maxCount).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    ring: idx < 4 ? 'inner' : 'outer',
  }));
}
