import { toPublicIsland, toPublicProfile } from './contracts.mjs';
import { recommendExplorers } from './recommendations.mjs';

const PUBLIC_PROFILE_COLUMNS = 'id,handle,display_name,bio,interests,is_public,is_sample';
const PUBLIC_ISLAND_COLUMNS = 'id,owner_id,title,category,topic,theme,experience,session_minutes,xp,is_public,public_summary,shared_milestone,roadmap,starter_goals';

function mapDbIslandToRaw(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    category: row.category,
    topic: row.topic ?? undefined,
    theme: row.theme ?? undefined,
    experience: row.experience,
    sessionMinutes: row.session_minutes,
    xp: row.xp,
    isPublic: Boolean(row.is_public),
    publicSummary: row.public_summary ?? '',
    sharedMilestone: row.shared_milestone ?? undefined,
    roadmap: row.roadmap ?? {},
    goals: Array.isArray(row.starter_goals) ? row.starter_goals : [],
  };
}

function mapDbProfileToRaw(row, islands = [], follows = []) {
  if (!row) return null;
  const followerCount = follows.filter(f => f.following_id === row.id).length;
  const followingCount = follows.filter(f => f.follower_id === row.id).length;
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio ?? '',
    interests: Array.isArray(row.interests) ? row.interests : [],
    isPublic: Boolean(row.is_public),
    isSample: Boolean(row.is_sample),
    followerCount,
    followingCount,
    islands: islands.filter(i => i.owner_id === row.id).map(mapDbIslandToRaw),
  };
}

/**
 * Creates a Supabase PostgREST client implementing the WorldHopper SocialClient contract.
 * Keeps credentials outside the repository: pass `supabaseUrl` and `supabaseAnonKey` at runtime.
 */
export function createSupabaseSocialClient({
  supabaseUrl = globalThis.__WORLDHOPPER_SUPABASE__?.url ?? globalThis.process?.env?.SUPABASE_URL,
  supabaseAnonKey = globalThis.__WORLDHOPPER_SUPABASE__?.anonKey ?? globalThis.process?.env?.SUPABASE_ANON_KEY,
  getAccessToken = () => null,
  viewerId = null,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key must be provided outside the repository.');
  }
  const baseUrl = String(supabaseUrl).replace(/\/+$/, '');

  async function rest(pathname, { method = 'GET', query = {}, body, prefer } = {}) {
    const url = new URL(`${baseUrl}/rest/v1/${pathname}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
    const token = await getAccessToken();
    const headers = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token || supabaseAnonKey}`,
      Accept: 'application/json',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (prefer) {
      headers.Prefer = prefer;
    }
    const response = await fetchImpl(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = data?.message || data?.error || `Supabase request failed (${response.status})`;
      throw new Error(message);
    }
    return data;
  }

  async function fetchHydratedProfiles() {
    const [profilesRows, islandsRows, followsRows] = await Promise.all([
      rest('profiles', { query: { select: PUBLIC_PROFILE_COLUMNS, is_public: 'eq.true' } }),
      rest('islands', { query: { select: PUBLIC_ISLAND_COLUMNS, is_public: 'eq.true' } }),
      rest('follows', { query: { select: 'follower_id,following_id' } }),
    ]);

    const followingIds = new Set(
      (followsRows ?? [])
        .filter(row => row.follower_id === viewerId)
        .map(row => row.following_id),
    );

    return (profilesRows ?? [])
      .map(row => {
        const raw = mapDbProfileToRaw(row, islandsRows ?? [], followsRows ?? []);
        return toPublicProfile(raw, { viewerId, followingIds });
      })
      .filter(profile => profile && profile.publicIslands.length > 0);
  }

  return {
    mode: 'supabase',
    viewerId,

    async listPublicProfiles({ filter = 'all' } = {}) {
      const profiles = await fetchHydratedProfiles();
      if (filter === 'following') {
        return profiles.filter(p => p.isFollowing);
      }
      if (filter && filter !== 'all') {
        return profiles.filter(p => (
          p.interests.includes(filter) ||
          p.publicIslands.some(i => i.category === filter || i.theme === filter)
        ));
      }
      return profiles;
    },

    async getPublicWorld(profileId) {
      const [profilesRows, islandsRows, followsRows] = await Promise.all([
        rest('profiles', { query: { select: PUBLIC_PROFILE_COLUMNS, id: `eq.${profileId}`, is_public: 'eq.true' } }),
        rest('islands', { query: { select: PUBLIC_ISLAND_COLUMNS, owner_id: `eq.${profileId}`, is_public: 'eq.true' } }),
        rest('follows', { query: { select: 'follower_id,following_id' } }),
      ]);

      const row = profilesRows?.[0];
      if (!row) {
        throw new Error('Public world not found or not shared.');
      }
      const followingIds = new Set(
        (followsRows ?? []).filter(f => f.follower_id === viewerId).map(f => f.following_id),
      );
      const raw = mapDbProfileToRaw(row, islandsRows ?? [], followsRows ?? []);
      const profile = toPublicProfile(raw, { viewerId, followingIds });
      if (!profile) {
        throw new Error('Public world not found or not shared.');
      }
      return {
        profile,
        islands: profile.publicIslands,
      };
    },

    async getPublicIsland(islandId) {
      const islandsRows = await rest('islands', {
        query: { select: PUBLIC_ISLAND_COLUMNS, id: `eq.${islandId}`, is_public: 'eq.true' },
      });
      const islandRow = islandsRows?.[0];
      if (!islandRow) return null;

      const profilesRows = await rest('profiles', {
        query: { select: PUBLIC_PROFILE_COLUMNS, id: `eq.${islandRow.owner_id}`, is_public: 'eq.true' },
      });
      const ownerRow = profilesRows?.[0];
      if (!ownerRow) return null;

      return toPublicIsland(mapDbIslandToRaw(islandRow), {
        id: ownerRow.id,
        handle: ownerRow.handle,
        displayName: ownerRow.display_name,
        isSample: ownerRow.is_sample,
      });
    },

    async followProfile(targetProfileId, { actorId = viewerId } = {}) {
      if (!actorId) {
        throw new Error('Authentication required to follow an explorer.');
      }
      await rest('follows', {
        method: 'POST',
        body: { follower_id: actorId, following_id: targetProfileId },
        prefer: 'return=representation',
      });
      const followsRows = await rest('follows', {
        query: { select: 'follower_id,following_id', following_id: `eq.${targetProfileId}` },
      });
      return {
        profileId: targetProfileId,
        isFollowing: true,
        followerCount: (followsRows ?? []).length,
      };
    },

    async unfollowProfile(targetProfileId, { actorId = viewerId } = {}) {
      if (!actorId) {
        throw new Error('Authentication required to unfollow an explorer.');
      }
      await rest('follows', {
        method: 'DELETE',
        query: {
          follower_id: `eq.${actorId}`,
          following_id: `eq.${targetProfileId}`,
        },
        prefer: 'return=representation',
      });
      const followsRows = await rest('follows', {
        query: { select: 'follower_id,following_id', following_id: `eq.${targetProfileId}` },
      });
      return {
        profileId: targetProfileId,
        isFollowing: false,
        followerCount: (followsRows ?? []).length,
      };
    },

    async setIslandVisibility(islandId, { isPublic, publicSummary } = {}) {
      const patch = {};
      if (typeof isPublic === 'boolean') patch.is_public = isPublic;
      if (typeof publicSummary === 'string') patch.public_summary = publicSummary.trim();

      const updatedRows = await rest('islands', {
        method: 'PATCH',
        query: { id: `eq.${islandId}`, select: PUBLIC_ISLAND_COLUMNS },
        body: patch,
        prefer: 'return=representation',
      });
      const updated = updatedRows?.[0];
      if (!updated) {
        throw new Error('RLS policy violation: only the island owner can update island visibility.');
      }
      return toPublicIsland({ ...mapDbIslandToRaw(updated), isPublic: true }, { id: updated.owner_id });
    },

    async updateProfile(profileId, { displayName, bio, isPublic } = {}) {
      const patch = {};
      if (typeof displayName === 'string') patch.display_name = displayName.trim();
      if (typeof bio === 'string') patch.bio = bio.trim();
      if (typeof isPublic === 'boolean') patch.is_public = isPublic;

      const updatedRows = await rest('profiles', {
        method: 'PATCH',
        query: { id: `eq.${profileId}`, select: PUBLIC_PROFILE_COLUMNS },
        body: patch,
        prefer: 'return=representation',
      });
      if (!updatedRows?.length) {
        throw new Error('RLS policy violation: only the profile owner can update their profile.');
      }
      return updatedRows[0];
    },

    async recommendPeople({ viewerWorld } = {}) {
      const profiles = await fetchHydratedProfiles();
      return recommendExplorers(viewerWorld, profiles, { viewerId });
    },
  };
}

/**
 * Faithful PostgREST + Postgres Row-Level Security simulator for deterministic two-account tests
 * when a live Supabase network connection is unavailable.
 */
export function createRlsSimulatedFetch({
  profiles = [],
  islands = [],
  privateStates = [],
  follows = [],
  tokens = {},
} = {}) {
  const db = {
    profiles: structuredClone(profiles),
    islands: structuredClone(islands),
    island_private_state: structuredClone(privateStates),
    follows: structuredClone(follows),
  };

  function getAuthUid(headers = {}) {
    const authHeader = headers.Authorization || headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return tokens[token] ?? null;
  }

  function matchesEqFilter(row, searchParams) {
    for (const [key, rawVal] of searchParams.entries()) {
      if (key === 'select') continue;
      if (rawVal.startsWith('eq.')) {
        const expected = rawVal.slice(3);
        const actual = row[key];
        if (String(actual) !== expected) return false;
      }
    }
    return true;
  }

  function pickColumns(row, selectParam) {
    if (!selectParam || selectParam === '*') return { ...row };
    const cols = selectParam.split(',').map(c => c.trim()).filter(Boolean);
    const picked = {};
    for (const col of cols) {
      if (col in row) picked[col] = row[col];
    }
    return picked;
  }

  function jsonResponse(status, payload) {
    return {
      ok: status >= 200 && status < 300,
      status,
      async text() {
        return JSON.stringify(payload);
      },
    };
  }

  return async function simulatedFetch(urlString, options = {}) {
    const url = new URL(urlString);
    const table = url.pathname.replace(/^.*\/rest\/v1\//, '');
    const method = (options.method || 'GET').toUpperCase();
    const uid = getAuthUid(options.headers);
    const body = options.body ? JSON.parse(options.body) : null;
    const selectParam = url.searchParams.get('select');

    // TABLE: profiles
    if (table === 'profiles') {
      if (method === 'GET') {
        const rows = db.profiles
          .filter(p => p.is_public === true || p.id === uid)
          .filter(p => matchesEqFilter(p, url.searchParams))
          .map(p => pickColumns(p, selectParam));
        return jsonResponse(200, rows);
      }
      if (method === 'PATCH') {
        const target = db.profiles.find(p => matchesEqFilter(p, url.searchParams));
        if (!target || target.id !== uid) {
          return jsonResponse(403, { message: 'RLS policy violation on table "profiles": auth.uid() = id required' });
        }
        Object.assign(target, body);
        return jsonResponse(200, [pickColumns(target, selectParam)]);
      }
    }

    // TABLE: islands
    if (table === 'islands') {
      if (method === 'GET') {
        const rows = db.islands
          .filter(island => {
            const ownerPublic = db.profiles.some(p => p.id === island.owner_id && p.is_public === true);
            return (island.is_public === true && ownerPublic) || island.owner_id === uid;
          })
          .filter(island => matchesEqFilter(island, url.searchParams))
          .map(island => pickColumns(island, selectParam));
        return jsonResponse(200, rows);
      }
      if (method === 'PATCH') {
        const target = db.islands.find(island => matchesEqFilter(island, url.searchParams));
        if (!target || target.owner_id !== uid) {
          return jsonResponse(403, { message: 'RLS policy violation on table "islands": auth.uid() = owner_id required' });
        }
        Object.assign(target, body);
        return jsonResponse(200, [pickColumns(target, selectParam)]);
      }
    }

    // TABLE: island_private_state
    if (table === 'island_private_state') {
      if (method === 'GET') {
        const rows = db.island_private_state
          .filter(state => state.owner_id === uid)
          .filter(state => matchesEqFilter(state, url.searchParams))
          .map(state => pickColumns(state, selectParam));
        return jsonResponse(200, rows);
      }
    }

    // TABLE: follows
    if (table === 'follows') {
      if (method === 'GET') {
        const rows = db.follows
          .filter(f => matchesEqFilter(f, url.searchParams))
          .map(f => pickColumns(f, selectParam));
        return jsonResponse(200, rows);
      }
      if (method === 'POST') {
        const { follower_id: followerId, following_id: followingId } = body || {};
        const targetPublic = db.profiles.some(p => p.id === followingId && p.is_public === true);
        if (!uid || followerId !== uid || followerId === followingId || !targetPublic) {
          return jsonResponse(403, { message: 'RLS policy violation on table "follows": auth.uid() = follower_id required' });
        }
        const exists = db.follows.some(f => f.follower_id === followerId && f.following_id === followingId);
        if (!exists) {
          db.follows.push({ follower_id: followerId, following_id: followingId, created_at: new Date().toISOString() });
        }
        return jsonResponse(201, [{ follower_id: followerId, following_id: followingId }]);
      }
      if (method === 'DELETE') {
        const candidates = db.follows.filter(f => matchesEqFilter(f, url.searchParams));
        if (candidates.some(f => f.follower_id !== uid)) {
          return jsonResponse(403, { message: 'RLS policy violation on table "follows": cannot delete another user follow' });
        }
        db.follows = db.follows.filter(f => !(matchesEqFilter(f, url.searchParams) && f.follower_id === uid));
        return jsonResponse(200, candidates);
      }
    }

    return jsonResponse(404, { message: `Unknown table or method: ${method} ${table}` });
  };
}
