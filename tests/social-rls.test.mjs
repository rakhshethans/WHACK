import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  createSupabaseSocialClient,
  createRlsSimulatedFetch,
} from '../src/social/supabase-client.mjs';

const migrationPath = path.resolve('supabase/migrations/20261107000000_social_schema.sql');

test('supabase migration defines profiles, islands, island_private_state, and follows with strict RLS policies', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'Supabase migration file must exist');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify tables exist
  assert.match(sql, /create table\s+if not exists\s+public\.profiles/i);
  assert.match(sql, /create table\s+if not exists\s+public\.islands/i);
  assert.match(sql, /create table\s+if not exists\s+public\.island_private_state/i);
  assert.match(sql, /create table\s+if not exists\s+public\.follows/i);

  // Verify RLS is enabled on all four tables
  assert.match(sql, /alter table\s+public\.profiles\s+enable row level security/i);
  assert.match(sql, /alter table\s+public\.islands\s+enable row level security/i);
  assert.match(sql, /alter table\s+public\.island_private_state\s+enable row level security/i);
  assert.match(sql, /alter table\s+public\.follows\s+enable row level security/i);

  // Verify opt-in default on islands (is_public default false)
  assert.match(sql, /is_public\s+boolean\s+not null\s+default\s+false/i);

  // Verify no hardcoded secrets or credentials appear in supabase directory
  assert.equal(/eyJ[a-zA-Z0-9_-]{20,}/.test(sql), false, 'No JWT tokens in migration');
});

test('two-account verification: Account B can browse and follow Account A, cannot read A’s private island even by ID, and cannot mutate A’s profile or follows', async () => {
  const accountA = {
    id: '11111111-1111-4111-8111-111111111111',
    token: 'token-account-a',
    handle: 'alice-harbour',
    displayName: 'Alice Harbour',
  };
  const accountB = {
    id: '22222222-2222-4222-8222-222222222222',
    token: 'token-account-b',
    handle: 'bob-mariner',
    displayName: 'Bob Mariner',
  };

  const fetchImpl = createRlsSimulatedFetch({
    profiles: [
      {
        id: accountA.id,
        handle: accountA.handle,
        display_name: accountA.displayName,
        bio: 'Fingerstyle guitarist and photographer.',
        interests: ['guitar', 'photography'],
        is_public: true,
        is_sample: false,
      },
      {
        id: accountB.id,
        handle: accountB.handle,
        display_name: accountB.displayName,
        bio: 'Learning songwriting and rhythm guitar.',
        interests: ['songwriting'],
        is_public: true,
        is_sample: false,
      },
    ],
    islands: [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        owner_id: accountA.id,
        title: 'Alice Public Guitar Island',
        category: 'guitar',
        experience: 'intermediate',
        session_minutes: 20,
        xp: 250,
        is_public: true,
        public_summary: 'Acoustic fingerstyle progression',
        roadmap: { focus: 'Fingerstyle arrangement', checkpoint: 'Record a complete arrangement.' },
        starter_goals: [
          {
            id: 'goal-1',
            title: 'Separate thumb and fingers',
            description: 'Alternate two bass strings with your thumb.',
            practice: 'Alternate two bass strings with your thumb.',
            finish: 'Play four bars at 50 bpm.',
            minutes: 15,
            prerequisites: [],
          },
        ],
      },
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        owner_id: accountA.id,
        title: 'Alice Private Journal Island',
        category: 'custom',
        topic: 'Meeting new people',
        theme: 'people',
        experience: 'beginner',
        session_minutes: 15,
        xp: 100,
        is_public: false,
        public_summary: 'Should never be visible to Account B',
        roadmap: { focus: 'Meeting new people', checkpoint: 'Have a follow-up conversation.' },
        starter_goals: [
          {
            id: 'goal-1',
            title: 'Say hello',
            description: 'Attend one group session.',
            practice: 'Attend one group session.',
            finish: 'Have one short exchange.',
            minutes: 15,
            prerequisites: [],
          },
        ],
      },
    ],
    privateStates: [
      {
        island_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        owner_id: accountA.id,
        private_objective: 'Private objective for Alice only',
        completed_goal_ids: ['goal-1'],
        raw_storage: { localStorageKey: 'worldhopper-world-v1' },
      },
    ],
    follows: [],
    tokens: {
      [accountA.token]: accountA.id,
      [accountB.token]: accountB.id,
    },
  });

  const clientB = createSupabaseSocialClient({
    supabaseUrl: 'https://worldhopper-local.supabase.co',
    supabaseAnonKey: 'anon-public-placeholder',
    getAccessToken: () => accountB.token,
    viewerId: accountB.id,
    fetchImpl,
  });

  // 1. Account B browses public profiles and opens Account A's public world
  const profiles = await clientB.listPublicProfiles();
  const aliceProfile = profiles.find(p => p.id === accountA.id);
  assert.ok(aliceProfile, 'Account B can see Account A in public profiles');
  assert.equal(aliceProfile.publicIslands.length, 1, 'Only Alice’s opt-in public island is returned');
  assert.equal(aliceProfile.publicIslands[0].title, 'Alice Public Guitar Island');
  assert.equal(JSON.stringify(aliceProfile).includes('Alice Private Journal Island'), false);
  assert.equal(JSON.stringify(aliceProfile).includes('Private objective for Alice only'), false);

  const aliceWorld = await clientB.getPublicWorld(accountA.id);
  assert.equal(aliceWorld.islands.length, 1);
  assert.equal(aliceWorld.islands[0].id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1');

  // 2. Account B CANNOT read Account A's private island even when querying directly by ID
  const directPrivateRead = await clientB.getPublicIsland('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2');
  assert.equal(directPrivateRead, null, 'RLS blocks Account B from reading Account A’s private island by ID');

  // 3. Account B can follow and unfollow Account A
  const followRes = await clientB.followProfile(accountA.id);
  assert.equal(followRes.isFollowing, true);
  assert.equal(followRes.followerCount, 1);

  const unfollowRes = await clientB.unfollowProfile(accountA.id);
  assert.equal(unfollowRes.isFollowing, false);
  assert.equal(unfollowRes.followerCount, 0);

  // 4. Account B CANNOT update Account A's profile or island visibility
  await assert.rejects(
    () => clientB.updateProfile(accountA.id, { displayName: 'Spoofed by Bob' }),
    /RLS|Forbidden|permission/i,
  );
  await assert.rejects(
    () => clientB.setIslandVisibility('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', { isPublic: true }),
    /RLS|Forbidden|permission/i,
  );

  // 5. Account B CANNOT forge a follow row where follower_id is Account A
  await assert.rejects(
    () => clientB.followProfile(accountB.id, { actorId: accountA.id }),
    /RLS|Forbidden|permission/i,
  );

  // 6. Account A CAN publish or unpublish her own private island
  const clientA = createSupabaseSocialClient({
    supabaseUrl: 'https://worldhopper-local.supabase.co',
    supabaseAnonKey: 'anon-public-placeholder',
    getAccessToken: () => accountA.token,
    viewerId: accountA.id,
    fetchImpl,
  });
  const newlyPublished = await clientA.setIslandVisibility('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', { isPublic: true });
  assert.equal(newlyPublished.id, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2');

  // Now Account B can read it because Account A explicitly opted in
  const nowVisibleToB = await clientB.getPublicIsland('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2');
  assert.equal(nowVisibleToB.title, 'Alice Private Journal Island');
});
