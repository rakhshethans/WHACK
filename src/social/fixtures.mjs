import { createIsland, createWorld } from '../world.mjs';
import { toPublicIsland, toPublicProfile } from './contracts.mjs';
import { recommendExplorers } from './recommendations.mjs';

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
  xp = 250,
  sharedMilestone,
}) {
  const created = createIsland(createWorld(), {
    title,
    category,
    topic,
    objective,
    experience,
    minutes,
  }).islands[0];

  return {
    ...created,
    id,
    ownerId,
    xp,
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
      bio: 'Acoustic guitarist building an open-mic set and fingerstyle arrangements.',
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
          xp: 500,
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
          xp: 100,
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
          xp: 100,
        }),
      ],
    },
    {
      id: 'user-noah',
      handle: 'noah-silva',
      displayName: 'Noah Silva',
      email: 'noah.silva.private@warwick.example',
      bio: 'Songwriter and lyricist exploring live arrangement and campus communities.',
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
          xp: 500,
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
          xp: 100,
        }),
      ],
    },
    {
      id: 'user-ari',
      handle: 'ari-patel',
      displayName: 'Ari Patel',
      email: 'ari.patel.private@warwick.example',
      bio: 'Landscape photographer and visual storyteller charting weekend trails.',
      interests: ['photography', 'visual', 'language'],
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
          xp: 250,
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
          xp: 250,
        }),
      ],
    },
  ];
}

export function createFixtureSocialClient({
  viewerId = 'user-local-explorer',
  initialProfiles = createDefaultFixtureRecords(),
  initialFollowingIds = [],
  blockedIds = [],
  latencyMs = 0,
  failWithError = null,
} = {}) {
  const records = structuredClone(initialProfiles);
  const following = new Set(initialFollowingIds);
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

  function projectProfiles() {
    return records
      .map(record => toPublicProfile(record, { viewerId, followingIds: following, blockedIds: blocked }))
      .filter(profile => profile && profile.publicIslands.length > 0);
  }

  return {
    mode: 'fixture',
    viewerId,

    setForcedError(error) {
      forcedError = error;
    },

    getSnapshotProfiles() {
      return projectProfiles();
    },

    async listPublicProfiles({ filter = 'all' } = {}) {
      await maybeDelayAndCheck();
      const all = projectProfiles();
      if (filter === 'following') {
        return all.filter(profile => profile.isFollowing);
      }
      if (filter && filter !== 'all') {
        return all.filter(profile => (
          profile.interests.includes(filter) ||
          profile.publicIslands.some(island => island.category === filter || island.theme === filter)
        ));
      }
      return all;
    },

    async getPublicWorld(profileId) {
      await maybeDelayAndCheck();
      const raw = records.find(item => item.id === profileId || item.handle === profileId);
      const profile = toPublicProfile(raw, { viewerId, followingIds: following, blockedIds: blocked });
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

    async followProfile(targetProfileId, { actorId = viewerId } = {}) {
      await maybeDelayAndCheck();
      if (actorId !== viewerId) {
        throw new Error('Forbidden: cannot modify follows on behalf of another user.');
      }
      if (!targetProfileId || targetProfileId === viewerId) {
        throw new Error('Cannot follow your own profile.');
      }
      const record = records.find(item => item.id === targetProfileId);
      if (!record || record.isPublic === false || blocked.has(targetProfileId)) {
        throw new Error('Profile is not available to follow.');
      }
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

    async unfollowProfile(targetProfileId, { actorId = viewerId } = {}) {
      await maybeDelayAndCheck();
      if (actorId !== viewerId) {
        throw new Error('Forbidden: cannot modify follows on behalf of another user.');
      }
      const record = records.find(item => item.id === targetProfileId);
      if (!record) {
        throw new Error('Profile not found.');
      }
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
        if (record.id !== viewerId && island.ownerId !== viewerId) {
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
      if (profileId !== viewerId) {
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
      return toPublicProfile(record, { viewerId, followingIds: following, blockedIds: blocked });
    },

    async recommendPeople({ viewerWorld } = {}) {
      await maybeDelayAndCheck();
      return recommendExplorers(viewerWorld, projectProfiles(), { viewerId, blockedIds: blocked });
    },
  };
}
