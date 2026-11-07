import { createIsland, createWorld } from '../world.mjs';
import { toPublicIsland, toPublicProfile } from './contracts.mjs';
import { rankNeighborsByGraph } from './graph.mjs';
import { recommendExplorers } from './recommendations.mjs';
import { xpForLevel } from '../progression.mjs';

const LOCAL_VIEWER_ID = 'user-local-explorer';

function buildFixtureIsland({
  id,
  ownerId,
  title,
  category,
  topic,
  objective,
  publicSummary,
  shareObjective = false,
  isPublic = true,
  experience = 'beginner',
  minutes = 20,
  level = 3,
  sharedMilestone,
}) {
  const created = createIsland(createWorld(), {
    title,
    category,
    topic: topic || title,
    objective,
    experience,
    minutes,
  }).islands[0];

  return {
    ...created,
    id,
    ownerId,
    xp: xpForLevel(level),
    isPublic,
    shareObjective,
    publicSummary: publicSummary ?? objective,
    sharedMilestone,
    // Mark first two goals complete in raw owner storage to verify completion is stripped in public reads
    goals: created.goals.map((goal, idx) => ({
      ...goal,
      completed: idx < 2,
      ...(idx < 2 ? { completedAt: '2026-11-05T12:00:00Z' } : {}),
    })),
  };
}

export function createDefaultFixtureRecords() {
  return [
    {
      id: 'user-maya',
      handle: 'maya-chen',
      displayName: 'Maya Chen',
      email: 'maya.chen.private@warwick.example',
      bio: 'Acoustic guitarist building an open-mic set and fingerstyle arrangements in the North-West waters.',
      interests: ['guitar', 'songwriting'],
      isSample: true,
      isPublic: true,
      followerCount: 18,
      followingCount: 6,
      rawBrowserStorage: '{"worldhopper-world-v1":"private-local-snapshot"}',
      islands: [
        buildFixtureIsland({
          id: 'island-chord-coast',
          ownerId: 'user-maya',
          title: 'The Chord Coast',
          category: 'guitar',
          objective: 'Play an acoustic fingerstyle set at an open mic',
          publicSummary: 'Play an acoustic set from clean chords to a full performance',
          shareObjective: false,
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 4,
          sharedMilestone: 'Recorded a two-song acoustic run-through without stopping.',
        }),
        buildFixtureIsland({
          id: 'island-maya-lyric-cove',
          ownerId: 'user-maya',
          title: 'Lyric Cove',
          category: 'songwriting',
          objective: 'Write a verse and chorus over an acoustic progression',
          publicSummary: 'Drafting original acoustic hooks and verses',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 2,
        }),
        buildFixtureIsland({
          id: 'island-private-hidden',
          ownerId: 'user-maya',
          title: 'Secret Stage Fright Notes',
          category: 'custom',
          topic: 'Public speaking',
          objective: 'Overcome stage anxiety before December show',
          isPublic: false,
          experience: 'beginner',
          minutes: 10,
          level: 2,
        }),
      ],
    },
    {
      id: 'user-noah',
      handle: 'noah-silva',
      displayName: 'Noah Silva',
      email: 'noah.silva.private@warwick.example',
      bio: 'Songwriter and lyricist exploring live arrangement and rhythm guitar in the North-East archipelago.',
      interests: ['songwriting', 'guitar', 'people'],
      isSample: true,
      isPublic: true,
      followerCount: 24,
      followingCount: 9,
      islands: [
        buildFixtureIsland({
          id: 'island-verse-dunes',
          ownerId: 'user-noah',
          title: 'Verse Dunes',
          category: 'songwriting',
          objective: 'Write and record an original song',
          publicSummary: 'Write and record an original song from first hook to demo',
          isPublic: true,
          experience: 'intermediate',
          minutes: 30,
          level: 4,
          sharedMilestone: 'Finished a second draft after peer feedback.',
        }),
        buildFixtureIsland({
          id: 'island-noah-guitar',
          ownerId: 'user-noah',
          title: 'Rhythm Reef',
          category: 'guitar',
          objective: 'Play a song from start to finish',
          publicSummary: 'Steady chord transitions and rhythm control for rhythm guitar',
          isPublic: true,
          experience: 'beginner',
          minutes: 20,
          level: 2,
        }),
      ],
    },
    {
      id: 'user-ari',
      handle: 'ari-patel',
      displayName: 'Ari Patel',
      email: 'ari.patel.private@warwick.example',
      bio: 'Landscape photographer and visual storyteller charting weekend trails in the South-East.',
      interests: ['photography', 'visual', 'people'],
      isSample: true,
      isPublic: true,
      followerCount: 15,
      followingCount: 7,
      islands: [
        buildFixtureIsland({
          id: 'island-silver-lens',
          ownerId: 'user-ari',
          title: 'Silver Lens',
          category: 'photography',
          objective: 'Make a portfolio of mountain landscapes',
          publicSummary: 'Make a six-image portfolio of mountain and twilight landscapes',
          isPublic: true,
          experience: 'beginner',
          minutes: 20,
          level: 3,
          sharedMilestone: 'Sequenced a four-frame dusk study.',
        }),
        buildFixtureIsland({
          id: 'island-ari-harbour',
          ownerId: 'user-ari',
          title: 'Signal Quay',
          category: 'custom',
          topic: 'Meeting new people',
          objective: 'Make friends on campus through weekly clubs',
          publicSummary: 'Start conversations and build a weekly community routine',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 3,
        }),
      ],
    },
    {
      id: 'user-sora',
      handle: 'sora-takahashi',
      displayName: 'Sora Takahashi',
      email: 'sora.private@warwick.example',
      bio: 'Practising conversational Japanese and tactical chess endgames in the South-West waters.',
      interests: ['japanese', 'chess'],
      isSample: true,
      isPublic: true,
      followerCount: 19,
      followingCount: 11,
      islands: [
        buildFixtureIsland({
          id: 'island-kyoto-converse',
          ownerId: 'user-sora',
          title: 'Kyoto Converse',
          category: 'custom',
          topic: 'Japanese language',
          objective: 'Hold a natural travel conversation in Japanese',
          publicSummary: 'Everyday spoken Japanese dialogues and listening practice',
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 4,
          sharedMilestone: 'Completed a 10-minute unscripted exchange.',
        }),
        buildFixtureIsland({
          id: 'island-checkmate-atoll',
          ownerId: 'user-sora',
          title: 'Checkmate Atoll',
          category: 'custom',
          topic: 'Chess',
          objective: 'Play a full club chess game without blundering a piece',
          publicSummary: 'Tactical puzzles, opponent reply checks, and post-game review',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 3,
        }),
      ],
    },
    {
      id: 'user-elena',
      handle: 'elena-rostova',
      displayName: 'Elena Rostova',
      email: 'elena.private@warwick.example',
      bio: 'Debate coach and visual essayist charting public speaking and documentary series in the East.',
      interests: ['speaking', 'visual', 'photography'],
      isSample: true,
      isPublic: true,
      followerCount: 31,
      followingCount: 14,
      islands: [
        buildFixtureIsland({
          id: 'island-agora-peak',
          ownerId: 'user-elena',
          title: 'Agora Peak',
          category: 'custom',
          topic: 'Public speaking',
          objective: 'Deliver a clear five-minute talk to a live audience',
          publicSummary: 'Structured storytelling, deliberate pacing, and audience Q&A',
          isPublic: true,
          experience: 'advanced',
          minutes: 20,
          level: 5,
          sharedMilestone: 'Delivered a lightning talk at WarwickHack.',
        }),
        buildFixtureIsland({
          id: 'island-story-frame',
          ownerId: 'user-elena',
          title: 'Story Frame Cay',
          category: 'custom',
          topic: 'Visual storytelling',
          objective: 'Tell a five-image documentary story',
          publicSummary: 'Sequencing establishing shots, turning points, and closing frames',
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 3,
        }),
      ],
    },
    {
      id: 'user-mateo',
      handle: 'mateo-rivera',
      displayName: 'Mateo Rivera',
      email: 'mateo.private@warwick.example',
      bio: 'Learning Spanish for a rail journey across Spain while practising acoustic guitar rhythms.',
      interests: ['spanish', 'guitar'],
      isSample: true,
      isPublic: true,
      followerCount: 14,
      followingCount: 8,
      islands: [
        buildFixtureIsland({
          id: 'island-iberian-rails',
          ownerId: 'user-mateo',
          title: 'Iberian Rails',
          category: 'custom',
          topic: 'Spanish',
          objective: 'Order meals and navigate stations on a trip to Spain',
          publicSummary: 'Practical Spanish travel dialogues for stations, cafés, and check-ins',
          isPublic: true,
          experience: 'beginner',
          minutes: 20,
          level: 3,
          sharedMilestone: 'Completed three unscripted travel role-plays.',
        }),
        buildFixtureIsland({
          id: 'island-flamenco-pier',
          ownerId: 'user-mateo',
          title: 'Flamenco Pier',
          category: 'guitar',
          objective: 'Play rhythmic acoustic progressions with clean dynamics',
          publicSummary: 'Acoustic strumming patterns, percussive muting, and chord flow',
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 3,
        }),
      ],
    },
    {
      id: 'user-hana',
      handle: 'hana-sato',
      displayName: 'Hana Sato',
      email: 'hana.private@warwick.example',
      bio: 'Folding modular origami sculptures and practising conversational Japanese dialogues.',
      interests: ['origami', 'japanese'],
      isSample: true,
      isPublic: true,
      followerCount: 22,
      followingCount: 10,
      islands: [
        buildFixtureIsland({
          id: 'island-paper-crane-cay',
          ownerId: 'user-hana',
          title: 'Paper Crane Cay',
          category: 'custom',
          topic: 'Origami',
          objective: 'Fold complex paper cranes and modular polyhedra from diagrams',
          publicSummary: 'Crisp square bases, petal folds, and unaided diagram folding',
          isPublic: true,
          experience: 'intermediate',
          minutes: 15,
          level: 4,
          sharedMilestone: 'Folded a complete crane model from memory.',
        }),
        buildFixtureIsland({
          id: 'island-kana-harbor',
          ownerId: 'user-hana',
          title: 'Kana Harbor',
          category: 'custom',
          topic: 'Japanese language',
          objective: 'Hold everyday conversations in Japanese',
          publicSummary: 'Short spoken Japanese exchanges and active listening drills',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 2,
        }),
      ],
    },
    {
      id: 'user-liam',
      handle: 'liam-oconnor',
      displayName: 'Liam O’Connor',
      email: 'liam.private@warwick.example',
      bio: 'Indie songwriter working on stage presence, lyric hooks, and spoken introductions.',
      interests: ['songwriting', 'speaking'],
      isSample: true,
      isPublic: true,
      followerCount: 17,
      followingCount: 9,
      islands: [
        buildFixtureIsland({
          id: 'island-chorus-lighthouse',
          ownerId: 'user-liam',
          title: 'Chorus Lighthouse',
          category: 'songwriting',
          objective: 'Write a memorable chorus and arrangement for a band demo',
          publicSummary: 'Hook writing, verse-to-chorus contrast, and vocal phrasing',
          isPublic: true,
          experience: 'intermediate',
          minutes: 25,
          level: 3,
        }),
        buildFixtureIsland({
          id: 'island-open-mic-point',
          ownerId: 'user-liam',
          title: 'Open Mic Point',
          category: 'custom',
          topic: 'Public speaking',
          objective: 'Give engaging two-minute song introductions on stage',
          publicSummary: 'Concise stage banter, deliberate pauses, and audience connection',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 2,
        }),
      ],
    },
    {
      id: 'user-priya',
      handle: 'priya-nair',
      displayName: 'Priya Nair',
      email: 'priya.private@warwick.example',
      bio: 'Tournament chess player and society speaker charting tactical endgames and clear arguments.',
      interests: ['chess', 'speaking'],
      isSample: true,
      isPublic: true,
      followerCount: 27,
      followingCount: 12,
      islands: [
        buildFixtureIsland({
          id: 'island-endgame-reef',
          ownerId: 'user-priya',
          title: 'Endgame Reef',
          category: 'custom',
          topic: 'Chess',
          objective: 'Convert winning chess endgames under club time controls',
          publicSummary: 'Candidate move comparison, opponent reply checks, and post-game annotation',
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 4,
          sharedMilestone: 'Annotated five club games without a tactical blunder.',
        }),
        buildFixtureIsland({
          id: 'island-debate-strait',
          ownerId: 'user-priya',
          title: 'Debate Strait',
          category: 'custom',
          topic: 'Public speaking',
          objective: 'Deliver structured two-minute arguments with clear examples',
          publicSummary: 'One-sentence thesis framing, concrete examples, and Q&A',
          isPublic: true,
          experience: 'intermediate',
          minutes: 15,
          level: 3,
        }),
      ],
    },
    {
      id: 'user-zoe',
      handle: 'zoe-laurent',
      displayName: 'Zoe Laurent',
      email: 'zoe.private@warwick.example',
      bio: 'Street photographer and French learner documenting rainy evening reflections and café dialogues.',
      interests: ['photography', 'french'],
      isSample: true,
      isPublic: true,
      followerCount: 21,
      followingCount: 8,
      islands: [
        buildFixtureIsland({
          id: 'island-streetlight-atoll',
          ownerId: 'user-zoe',
          title: 'Streetlight Atoll',
          category: 'photography',
          objective: 'Make a street photography series around evening reflections',
          publicSummary: 'Framing architecture, hard light vs shade, and repeating visual motifs',
          isPublic: true,
          experience: 'intermediate',
          minutes: 20,
          level: 4,
          sharedMilestone: 'Sequenced a six-frame night reflection series.',
        }),
        buildFixtureIsland({
          id: 'island-parisian-cafe',
          ownerId: 'user-zoe',
          title: 'Parisian Café',
          category: 'custom',
          topic: 'French language',
          objective: 'Hold a natural conversation in French at a neighbourhood café',
          publicSummary: 'Everyday French conversation openings, clarification phrases, and listening',
          isPublic: true,
          experience: 'beginner',
          minutes: 15,
          level: 2,
        }),
      ],
    },
    {
      id: 'user-lin',
      handle: 'lin-zhou',
      displayName: 'Lin Zhou',
      email: 'lin.private@warwick.example',
      bio: 'New explorer charting private practice notes before publishing a first public island.',
      interests: ['origami', 'guitar'],
      isSample: true,
      isPublic: true,
      followerCount: 4,
      followingCount: 5,
      islands: [
        buildFixtureIsland({
          id: 'island-lin-private-draft',
          ownerId: 'user-lin',
          title: 'Private Fold Notebook',
          category: 'custom',
          topic: 'Origami',
          objective: 'Practise basic folds privately first',
          isPublic: false,
          experience: 'beginner',
          minutes: 15,
          level: 1,
        }),
      ],
    },
  ];
}

const DEFAULT_PERSONA_NETWORKS = {
  'user-local-explorer': {
    following: ['user-maya', 'user-noah'],
    followers: ['user-maya', 'user-ari', 'user-elena', 'user-lin'],
  },
  'user-maya': {
    following: ['user-noah', 'user-liam', 'user-mateo'],
    followers: ['user-noah', 'user-ari', 'user-liam', 'user-lin'],
  },
  'user-sora': {
    following: ['user-hana', 'user-priya', 'user-mateo'],
    followers: ['user-hana', 'user-priya', 'user-zoe'],
  },
  'user-elena': {
    following: ['user-ari', 'user-zoe', 'user-priya'],
    followers: ['user-liam', 'user-ari', 'user-noah'],
  },
  'user-ari': {
    following: ['user-zoe', 'user-elena', 'user-maya'],
    followers: ['user-zoe', 'user-elena', 'user-hana'],
  },
};

const SWITCHABLE_DUMMY_IDS = ['user-maya', 'user-sora', 'user-elena', 'user-ari'];

export function createFixtureSocialClient({
  viewerId: initialViewerId = 'user-local-explorer',
  initialProfiles = createDefaultFixtureRecords(),
  initialFollowingIds,
  initialFollowerIds,
  blockedIds = [],
  latencyMs = 0,
  failWithError = null,
} = {}) {
  const records = structuredClone(initialProfiles);
  let activeViewerId = initialViewerId;

  const networkByViewer = new Map();
  for (const [id, net] of Object.entries(DEFAULT_PERSONA_NETWORKS)) {
    networkByViewer.set(id, {
      following: new Set(net.following),
      followers: new Set(net.followers),
    });
  }
  if (!networkByViewer.has(activeViewerId)) {
    networkByViewer.set(activeViewerId, {
      following: new Set(initialFollowingIds ?? ['user-maya', 'user-noah']),
      followers: new Set(initialFollowerIds ?? ['user-maya', 'user-ari', 'user-elena', 'user-lin']),
    });
  } else {
    if (initialFollowingIds !== undefined) {
      networkByViewer.get(activeViewerId).following = new Set(initialFollowingIds);
    }
    if (initialFollowerIds !== undefined) {
      networkByViewer.get(activeViewerId).followers = new Set(initialFollowerIds);
    }
  }

  function currentFollowSets() {
    if (!networkByViewer.has(activeViewerId)) {
      networkByViewer.set(activeViewerId, { following: new Set(), followers: new Set() });
    }
    return networkByViewer.get(activeViewerId);
  }

  const blocked = new Set(blockedIds);
  let forcedError = failWithError;

  async function maybeDelayAndCheck() {
    if (latencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, latencyMs));
    }
    if (forcedError) {
      throw new Error(typeof forcedError === 'string' ? forcedError : 'Unable to reach the public atlas.');
    }
  }

  function projectAllVisibleProfiles() {
    const { following, followers } = currentFollowSets();
    return records
      .filter(record => record.id !== activeViewerId)
      .map(record => toPublicProfile(record, {
        viewerId: activeViewerId,
        followingIds: following,
        followerIds: followers,
        blockedIds: blocked,
      }))
      .filter(Boolean);
  }

  function projectProfilesWithIslands() {
    return projectAllVisibleProfiles().filter(profile => profile.publicIslands.length > 0);
  }

  return {
    mode: 'fixture',
    get viewerId() {
      return activeViewerId;
    },

    setLocalPublicIslands(shares) {
      const islands = shares.map(share => toPublicIsland({ ...share, isPublic: true })).filter(Boolean)
        .map(island => ({ ...island, isPublic: true, ownerId: LOCAL_VIEWER_ID }));
      const index = records.findIndex(record => record.id === LOCAL_VIEWER_ID);
      if (index >= 0) records.splice(index, 1);
      if (islands.length) records.push({
        id: LOCAL_VIEWER_ID, handle: 'you', displayName: 'You (My world)', isSample: true, islands,
      });
    },

    setForcedError(error) {
      forcedError = error;
    },

    getSnapshotProfiles() {
      return projectProfilesWithIslands();
    },

    listDummyPersonas() {
      const personas = [
        {
          id: 'user-local-explorer',
          displayName: 'You (My world)',
          handle: 'you',
          summary: 'Your local islands',
          isLocalViewer: true,
        },
      ];
      for (const id of SWITCHABLE_DUMMY_IDS) {
        const rec = records.find(r => r.id === id);
        if (!rec) continue;
        const publicIslands = (rec.islands ?? []).filter(i => i.isPublic);
        personas.push({
          id: rec.id,
          displayName: rec.displayName,
          handle: rec.handle,
          summary: publicIslands.map(i => i.topic || i.category).join(' & '),
          isLocalViewer: false,
          world: {
            islands: structuredClone(publicIslands),
          },
        });
      }
      return personas;
    },

    async switchViewer(nextViewerId) {
      await maybeDelayAndCheck();
      activeViewerId = nextViewerId || 'user-local-explorer';
      const rec = records.find(r => r.id === activeViewerId);
      if (!rec || activeViewerId === LOCAL_VIEWER_ID) {
        return {
          id: 'user-local-explorer',
          displayName: 'You (My world)',
          handle: 'you',
          isLocalViewer: true,
          world: null,
        };
      }
      const publicIslands = (rec.islands ?? []).filter(i => i.isPublic);
      return {
        id: rec.id,
        displayName: rec.displayName,
        handle: rec.handle,
        isLocalViewer: false,
        world: {
          islands: structuredClone(publicIslands),
        },
      };
    },

    async listPublicProfiles({ filter = 'all' } = {}) {
      await maybeDelayAndCheck();
      const all = projectProfilesWithIslands();
      if (filter === 'following') {
        return all.filter(profile => profile.isFollowing);
      }
      if (filter === 'followers') {
        return all.filter(profile => profile.followsViewer);
      }
      if (filter && filter !== 'all') {
        return all.filter(profile => (
          profile.interests.includes(filter) ||
          profile.publicIslands.some(island => island.category === filter || island.theme === filter)
        ));
      }
      return all;
    },

    async listNetworkProfiles() {
      await maybeDelayAndCheck();
      const visible = projectAllVisibleProfiles();
      return {
        following: visible.filter(profile => profile.isFollowing),
        followers: visible.filter(profile => profile.followsViewer),
      };
    },

    async rankNeighbors({ viewerWorld, limit = 8 } = {}) {
      await maybeDelayAndCheck();
      return rankNeighborsByGraph(viewerWorld, projectProfilesWithIslands(), {
        viewerId: activeViewerId,
        blockedIds: blocked,
        limit,
      });
    },

    async getPublicWorld(profileId) {
      await maybeDelayAndCheck();
      const { following, followers } = currentFollowSets();
      const raw = records.find(item => item.id === profileId || item.handle === profileId);
      const profile = toPublicProfile(raw, {
        viewerId: activeViewerId,
        followingIds: following,
        followerIds: followers,
        blockedIds: blocked,
      });
      if (!profile) {
        throw new Error('Public world not found or not shared.');
      }
      return {
        profile,
        islands: profile.publicIslands,
      };
    },

    async getPublicIsland(islandId) {
      await maybeDelayAndCheck();
      for (const record of records) {
        if (record.isPublic === false || blocked.has(record.id)) continue;
        const found = (record.islands ?? []).find(island => island.id === islandId);
        if (found) {
          return toPublicIsland(found, record);
        }
      }
      return null;
    },

    async followProfile(targetProfileId, { actorId = activeViewerId } = {}) {
      await maybeDelayAndCheck();
      if (actorId !== activeViewerId) {
        throw new Error('Forbidden: cannot modify follows on behalf of another user.');
      }
      if (!targetProfileId || targetProfileId === activeViewerId) {
        throw new Error('Cannot follow your own profile.');
      }
      const record = records.find(item => item.id === targetProfileId);
      if (!record || record.isPublic === false || blocked.has(targetProfileId)) {
        throw new Error('Profile is not available to follow.');
      }
      const { following } = currentFollowSets();
      if (!following.has(targetProfileId)) {
        following.add(targetProfileId);
        record.followerCount = (record.followerCount ?? 0) + 1;
      }
      return {
        profileId: targetProfileId,
        isFollowing: true,
        followerCount: record.followerCount,
      };
    },

    async unfollowProfile(targetProfileId, { actorId = activeViewerId } = {}) {
      await maybeDelayAndCheck();
      if (actorId !== activeViewerId) {
        throw new Error('Forbidden: cannot modify follows on behalf of another user.');
      }
      const record = records.find(item => item.id === targetProfileId);
      if (!record) {
        throw new Error('Profile not found.');
      }
      const { following } = currentFollowSets();
      if (following.has(targetProfileId)) {
        following.delete(targetProfileId);
        record.followerCount = Math.max(0, (record.followerCount ?? 1) - 1);
      }
      return {
        profileId: targetProfileId,
        isFollowing: false,
        followerCount: record.followerCount,
      };
    },

    async setIslandVisibility(islandId, { isPublic, shareObjective, publicSummary } = {}) {
      await maybeDelayAndCheck();
      for (const record of records) {
        const island = (record.islands ?? []).find(item => item.id === islandId);
        if (!island) continue;
        if (record.id !== activeViewerId && island.ownerId !== activeViewerId) {
          throw new Error('Forbidden: only the island owner can change island visibility.');
        }
        if (typeof isPublic === 'boolean') island.isPublic = isPublic;
        if (typeof shareObjective === 'boolean') island.shareObjective = shareObjective;
        if (typeof publicSummary === 'string') island.publicSummary = publicSummary.trim();
        return toPublicIsland(island, record);
      }
      throw new Error('Island not found.');
    },

    async updateProfile(profileId, updates = {}) {
      await maybeDelayAndCheck();
      if (profileId !== activeViewerId) {
        throw new Error('Forbidden: only the profile owner can update their profile.');
      }
      const record = records.find(item => item.id === profileId);
      if (!record) throw new Error('Profile not found.');
      if (typeof updates.displayName === 'string' && updates.displayName.trim()) {
        record.displayName = updates.displayName.trim();
      }
      if (typeof updates.bio === 'string') {
        record.bio = updates.bio.trim();
      }
      if (typeof updates.isPublic === 'boolean') {
        record.isPublic = updates.isPublic;
      }
      const { following, followers } = currentFollowSets();
      return toPublicProfile(record, {
        viewerId: activeViewerId,
        followingIds: following,
        followerIds: followers,
        blockedIds: blocked,
      });
    },

    async recommendPeople({ viewerWorld } = {}) {
      await maybeDelayAndCheck();
      return recommendExplorers(viewerWorld, projectProfilesWithIslands(), {
        viewerId: activeViewerId,
        blockedIds: blocked,
      });
    },
  };
}
