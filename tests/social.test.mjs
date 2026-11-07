import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, createIsland, createWorld, getActiveGoal, getStage } from '../src/world.mjs';
import {
  toPublicProfile,
  toPublicIsland,
  toAdoptableRoadmap,
  validateAdoptableRoadmap,
  createFixtureSocialClient,
  recommendExplorers,
  mountSocialExplore,
} from '../src/social/index.mjs';

const rawOwnerRecord = {
  id: 'user-maya',
  handle: 'maya-chen',
  displayName: 'Maya Chen',
  email: 'maya.private@example.com',
  bio: 'Acoustic fingerstyle and open-mic regular.',
  interests: ['guitar', 'songwriting'],
  isSample: false,
  followerCount: 12,
  followingCount: 4,
  rawBrowserStorage: '{"worldhopper-world-v1":{"secret":"do-not-leak"}}',
  privateNotes: 'Preparing for Warwick band audition',
  islands: [
    {
      id: 'island-maya-guitar',
      ownerId: 'user-maya',
      title: 'The Chord Coast',
      category: 'guitar',
      experience: 'intermediate',
      objective: 'Secret private diary objective: overcome stage fright at Union bar',
      publicSummary: 'Build a three-song acoustic fingerstyle set',
      shareObjective: false,
      isPublic: true,
      sessionMinutes: 20,
      xp: 250,
      difficulty: 'support',
      roadmap: {
        focus: 'Fingerstyle arrangement',
        checkpoint: 'Record a complete fingerstyle arrangement.',
        next: 'Perform two songs live.',
        onDevice: true,
      },
      goals: [
        {
          id: 'goal-1',
          title: 'Balance bass and melody',
          description: 'Choose four bars with an alternating bass and melody. Record them slowly.',
          finish: 'Keep the bass even while the melody stays clearly audible.',
          minutes: 10,
          xp: 40,
          prerequisites: [],
          completed: true,
          completedAt: '2026-11-01T10:00:00Z',
          practiceAdjustment: 'Try thumb-only bars first.',
        },
        {
          id: 'goal-2',
          title: 'Keep an alternating bass',
          description: 'Practise a repeating thumb pattern over two chords with a metronome.',
          finish: 'Play eight bars at 55 bpm without speeding up at the chord change.',
          minutes: 15,
          xp: 60,
          prerequisites: ['goal-1'],
          completed: true,
        },
        {
          id: 'goal-3',
          title: 'Put a melody over the bass',
          description: 'Add one melody note at a time to the thumb pattern.',
          finish: 'Record four bars with a steady bass and each melody note clearly audible.',
          minutes: 20,
          xp: 65,
          prerequisites: ['goal-2'],
          completed: false,
        },
        {
          id: 'goal-9',
          title: 'Arrange a new melody · Practice round 1',
          description: 'Choose an unfamiliar melody.',
          finish: 'Play an eight-bar passage.',
          minutes: 20,
          xp: 150,
          prerequisites: ['goal-8'],
          completed: false,
          continuation: true,
        },
      ],
    },
    {
      id: 'island-maya-private',
      ownerId: 'user-maya',
      title: 'Private Confidence Journal',
      category: 'custom',
      topic: 'Meeting new people',
      theme: 'people',
      experience: 'beginner',
      objective: 'Private therapy homework',
      isPublic: false,
      sessionMinutes: 15,
      xp: 100,
      goals: [
        {
          id: 'goal-1',
          title: 'Find a low-pressure place to meet people',
          description: 'Choose one recurring setting.',
          finish: 'Pick one specific session.',
          minutes: 10,
          xp: 40,
          prerequisites: [],
          completed: true,
        },
      ],
    },
  ],
};

test('public projection strips email, private objectives, detailed progress, private islands, and raw storage', () => {
  const profile = toPublicProfile(rawOwnerRecord, { viewerId: 'user-viewer', followingIds: new Set(['user-maya']) });

  assert.equal(profile.id, 'user-maya');
  assert.equal(profile.displayName, 'Maya Chen');
  assert.equal(profile.handle, 'maya-chen');
  assert.equal(profile.isFollowing, true);
  assert.equal(profile.publicIslandCount, 1);
  assert.equal(profile.publicIslands.length, 1);

  // Sensitive profile fields must be absent
  assert.equal('email' in profile, false);
  assert.equal('rawBrowserStorage' in profile, false);
  assert.equal('privateNotes' in profile, false);
  assert.equal(JSON.stringify(profile).includes('maya.private@example.com'), false);
  assert.equal(JSON.stringify(profile).includes('worldhopper-world-v1'), false);
  assert.equal(JSON.stringify(profile).includes('Private Confidence Journal'), false);
  assert.equal(JSON.stringify(profile).includes('overcome stage fright'), false);

  const [publicIsland] = profile.publicIslands;
  assert.equal(publicIsland.id, 'island-maya-guitar');
  assert.equal(publicIsland.level, 3);
  assert.equal(publicIsland.stageName, 'Town');
  assert.equal(publicIsland.publicSummary, 'Build a three-song acoustic fingerstyle set');
  assert.equal('objective' in publicIsland, false);
  assert.equal('difficulty' in publicIsland, false);
  assert.equal('onDevice' in publicIsland.roadmap, false);

  // Continuation goals and detailed completion progress must be excluded
  assert.equal(publicIsland.goals.length, 3);
  for (const goal of publicIsland.goals) {
    assert.equal('completed' in goal, false);
    assert.equal('completedAt' in goal, false);
    assert.equal('practiceAdjustment' in goal, false);
    assert.equal('xp' in goal, false);
    assert.ok(goal.title.length > 0);
    assert.ok(goal.description.length > 0);
    assert.ok(goal.practice.length > 0);
    assert.ok(goal.finish.length > 0);
    assert.ok(Array.isArray(goal.prerequisites));
  }

  // Opt-out island returns null when projected directly
  assert.equal(toPublicIsland(rawOwnerRecord.islands[1], rawOwnerRecord), null);
});

test('toAdoptableRoadmap produces a valid starter template that resets XP and completion for adoptIsland', () => {
  const publicIsland = toPublicIsland(rawOwnerRecord.islands[0], rawOwnerRecord);
  const template = toAdoptableRoadmap(publicIsland);
  const validation = validateAdoptableRoadmap(template);

  assert.equal(validation.valid, true);
  assert.equal(template.attribution, 'Maya Chen');
  assert.equal(template.creator.displayName, 'Maya Chen');
  assert.equal(template.creator.handle, 'maya-chen');
  assert.equal(template.xp, 0);
  assert.equal(template.goals.length, 3);
  assert.deepEqual(template.goals[0].prerequisites, []);
  assert.deepEqual(template.goals[1].prerequisites, ['goal-1']);
  assert.deepEqual(template.goals[2].prerequisites, ['goal-2']);
  assert.ok(template.goals.every(goal => goal.completed === false));
  assert.ok(template.goals.every(goal => goal.title && goal.description && goal.practice && goal.finish));
  assert.ok(template.goals.every(goal => typeof goal.xp === 'number' && goal.xp > 0));

  // Verify seamless integration with the learning agent's adoptIsland() in src/world.mjs
  const world = adoptIsland(createWorld(), template);
  const [adopted] = world.islands;
  assert.equal(adopted.xp, 0);
  assert.equal(getStage(adopted.xp).level, 1);
  assert.equal(adopted.attribution, 'Maya Chen');
  assert.ok(adopted.goals.every(goal => goal.completed === false));
  assert.equal(getActiveGoal(adopted).id, 'goal-1');
  assert.equal(getActiveGoal(adopted).title, 'Balance bass and melody');

  // Validation rejects malformed templates (missing finish, forward prerequisite, missing custom topic)
  assert.equal(validateAdoptableRoadmap({ ...template, category: 'custom', topic: '' }).valid, false);
  assert.equal(
    validateAdoptableRoadmap({
      ...template,
      goals: [{ ...template.goals[0], prerequisites: ['goal-2'] }, template.goals[1]],
    }).valid,
    false,
  );
  assert.equal(
    validateAdoptableRoadmap({
      ...template,
      goals: [{ ...template.goals[0], finish: '   ' }],
    }).valid,
    false,
  );
});

test('fixture client supports profile browsing, public world inspection, opt-in publishing, and follow/unfollow', async () => {
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });

  const profiles = await client.listPublicProfiles();
  assert.ok(profiles.length >= 3);
  // All returned profiles only expose public islands
  for (const profile of profiles) {
    assert.equal('email' in profile, false);
    assert.ok(profile.publicIslands.every(island => island.id && island.title));
  }

  const target = profiles[0];
  assert.equal(target.isFollowing, false);
  const initialFollowers = target.followerCount;

  const followed = await client.followProfile(target.id);
  assert.equal(followed.isFollowing, true);
  assert.equal(followed.followerCount, initialFollowers + 1);

  const worldView = await client.getPublicWorld(target.id);
  assert.equal(worldView.profile.isFollowing, true);
  assert.ok(worldView.islands.length >= 1);

  const unfollowed = await client.unfollowProfile(target.id);
  assert.equal(unfollowed.isFollowing, false);
  assert.equal(unfollowed.followerCount, initialFollowers);

  // Private island cannot be fetched even by ID
  const privateLookup = await client.getPublicIsland('island-private-hidden');
  assert.equal(privateLookup, null);

  // Non-owner cannot change another user's island visibility or profile
  await assert.rejects(
    () => client.setIslandVisibility(worldView.islands[0].id, { isPublic: false }),
    /permission|owner|forbidden/i,
  );
});

test('recommendExplorers categorises matches into Similar Explorers, Mentor Matches, and Discovery Matches with explanations', () => {
  const viewerWorld = createIsland(createWorld(), {
    title: 'Guitar Island',
    category: 'guitar',
    experience: 'beginner',
    minutes: 20,
    objective: 'Play acoustic songs',
  });
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const profiles = client.getSnapshotProfiles();

  const matches = recommendExplorers(viewerWorld, profiles);
  assert.ok(matches.length >= 3);

  const categories = new Set(matches.map(match => match.category));
  assert.ok(categories.has('Similar Explorers'));
  assert.ok(categories.has('Mentor Matches'));
  assert.ok(categories.has('Discovery Matches'));

  for (const match of matches) {
    assert.ok(match.reason.length > 15, 'every recommendation includes a transparent explanation');
    assert.ok(typeof match.score === 'number');
  }
});

function createTestContainer() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    innerHTML: '',
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) listeners.delete(type);
    },
    async clickButton(selectorAttrs) {
      const handler = listeners.get('click');
      assert.ok(handler, 'click listener must be registered on container');
      // Verify the button with matching data attributes exists in rendered innerHTML
      for (const [key, expected] of Object.entries(selectorAttrs)) {
        const attrName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        const snippet = `data-${attrName}="${expected}"`;
        assert.ok(
          this.innerHTML.includes(snippet),
          `Expected rendered HTML to include button attribute ${snippet}`,
        );
      }
      const button = {
        dataset: { ...selectorAttrs },
        closest(query) {
          return query === 'button[data-social-action]' ? this : null;
        },
      };
      await handler({ target: button });
    },
  };
}

test('mountSocialExplore exercises loading, ready, empty, and error states with retry recovery', async () => {
  const container = createTestContainer();
  const client = createFixtureSocialClient({ latencyMs: 15, failWithError: 'Supabase network timeout' });

  const controller = mountSocialExplore(container, { client });
  // Immediately after mount, container is in loading state
  assert.equal(container.getAttribute('aria-busy'), 'true');
  assert.match(container.innerHTML, /data-social-state="loading"/);

  await controller.ready;
  // Error state is rendered when client fails
  assert.equal(container.getAttribute('aria-busy'), 'false');
  assert.match(container.innerHTML, /data-social-state="error"/);
  assert.match(container.innerHTML, /Supabase network timeout/);

  // Clear error and click retry
  client.setForcedError(null);
  await container.clickButton({ socialAction: 'retry' });
  assert.equal(controller.getState().status, 'ready');
  assert.match(container.innerHTML, /data-social-state="ready"/);

  // Filter by "following" when following nobody -> empty state
  await container.clickButton({ socialAction: 'filter', filter: 'following' });
  assert.equal(controller.getState().status, 'empty');
  assert.match(container.innerHTML, /data-social-state="empty"/);
  assert.match(container.innerHTML, /not following any explorers yet/);

  // Reset filter to all worlds from empty state
  await container.clickButton({ socialAction: 'filter', filter: 'all' });
  assert.equal(controller.getState().status, 'ready');
  controller.destroy();
});

test('mountSocialExplore renders user islands at the map centre and nearby user island clusters on the pannable ocean without top profile cards', async () => {
  const container = createTestContainer();
  const viewerWorld = createIsland(createWorld(), {
    title: 'My Home Guitar Island',
    category: 'guitar',
    experience: 'beginner',
    minutes: 20,
    objective: 'Play songs around the campfire',
  });
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const adoptedTemplates = [];
  const announcements = [];

  const controller = mountSocialExplore(container, {
    client,
    viewerWorld,
    onAdopt(template, context) {
      adoptedTemplates.push({ template, context });
    },
    onAnnounce(msg) {
      announcements.push(msg);
    },
  });
  await controller.ready;

  // 1. No top profile-card directory strip; all clusters live inside the map canvas
  assert.equal(container.innerHTML.includes('class="social-directory"'), false);
  assert.match(container.innerHTML, /My Home Guitar Island/);
  assert.match(container.innerHTML, /archipelago-cluster/);
  assert.ok(controller.getState().profiles.length >= 5, 'at least 5 hardcoded nearby users');

  // Default view starts focused on current user's islands with inspector drawer closed
  assert.equal(controller.getState().logOpen, false);
  assert.equal(controller.getState().activeCluster, 'home');

  // 2. Clicking a nearby user's island group reveals info about that user and their islands
  await container.clickButton({ socialAction: 'open-profile', profileId: 'user-noah' });
  assert.equal(controller.getState().selectedProfileId, 'user-noah');
  assert.equal(controller.getState().activeCluster, 'user-noah');
  assert.equal(controller.getState().logOpen, true);
  assert.match(container.innerHTML, /Noah Silva/);
  assert.match(container.innerHTML, /Verse Dunes/);
  assert.match(container.innerHTML, /Rhythm Reef/);

  // 3. Clicking another island in Noah's cluster switches the active island in the drawer
  await container.clickButton({ socialAction: 'select-island', islandId: 'island-noah-guitar' });
  assert.equal(controller.getState().selectedIslandId, 'island-noah-guitar');
  assert.match(container.innerHTML, /Rhythm Reef/);

  // 4. Follow and unfollow Noah from the revealed cluster info panel
  await container.clickButton({ socialAction: 'follow', profileId: 'user-noah' });
  assert.ok(announcements.some(msg => /Now following Noah Silva/.test(msg)));
  await container.clickButton({ socialAction: 'unfollow', profileId: 'user-noah' });
  assert.ok(announcements.some(msg => /Unfollowed Noah Silva/.test(msg)));

  // 5. Adopt Noah's island roadmap
  await container.clickButton({
    socialAction: 'adopt',
    islandId: 'island-noah-guitar',
    profileId: 'user-noah',
  });

  assert.equal(adoptedTemplates.length, 1);
  const { template } = adoptedTemplates[0];
  assert.equal(template.title, 'Rhythm Reef');
  assert.equal(template.attribution, 'Noah Silva');
  assert.equal(template.xp, 0);
  assert.ok(template.goals.length >= 4);

  const nextWorld = adoptIsland(createWorld(), template);
  assert.equal(nextWorld.islands.length, 1);
  assert.equal(nextWorld.islands[0].xp, 0);
  assert.equal(nextWorld.islands[0].attribution, 'Noah Silva');
  assert.equal(getStage(nextWorld.islands[0].xp).level, 1);
  controller.destroy();
});

test('mountSocialExplore escapes untrusted HTML in profile and roadmap strings', async () => {
  const container = createTestContainer();
  const maliciousClient = createFixtureSocialClient({
    initialProfiles: [
      {
        id: 'user-xss',
        handle: 'xss"><script>alert(1)</script>',
        displayName: '<img src=x onerror=alert(1)>',
        bio: '<b>Untrusted bio</b>',
        isPublic: true,
        isSample: true,
        islands: [
          {
            id: 'island-xss',
            ownerId: 'user-xss',
            title: '<script>evil()</script>',
            category: 'guitar',
            isPublic: true,
            publicSummary: '<svg onload=alert(2)>',
            xp: 100,
            roadmap: { focus: '<i>Focus</i>', checkpoint: '<u>Checkpoint</u>' },
            goals: [
              {
                id: 'goal-1',
                title: '<a href="javascript:evil()">Goal</a>',
                description: '<script>badPractice()</script>',
                finish: '<iframe src="evil"></iframe>',
                minutes: 15,
                prerequisites: [],
              },
            ],
          },
        ],
      },
    ],
  });

  const controller = mountSocialExplore(container, { client: maliciousClient });
  await controller.ready;

  assert.equal(container.innerHTML.includes('<script>'), false);
  assert.equal(container.innerHTML.includes('<img src=x'), false);
  assert.equal(container.innerHTML.includes('<iframe'), false);
  assert.match(container.innerHTML, /&lt;script&gt;evil\(\)&lt;\/script&gt;/);
  controller.destroy();
});

