import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, createIsland, createWorld, getActiveGoal, getStage } from '../src/world.mjs';
import {
  toPublicProfile,
  toPublicIsland,
  toAdoptableRoadmap,
  validateAdoptableRoadmap,
  createFixtureSocialClient,
  normalizeIslandSkill,
  rankNeighborsByGraph,
  recommendExplorers,
  mountSocialExplore,
  HOME_CLUSTER_POS,
  NEIGHBOR_SECTORS,
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
  const profile = toPublicProfile(rawOwnerRecord, {
    viewerId: 'user-viewer',
    followingIds: new Set(['user-maya']),
    followerIds: new Set(['user-maya']),
  });

  assert.equal(profile.id, 'user-maya');
  assert.equal(profile.displayName, 'Maya Chen');
  assert.equal(profile.handle, 'maya-chen');
  assert.equal(profile.isFollowing, true);
  assert.equal(profile.followsViewer, true);
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
  const client = createFixtureSocialClient({
    viewerId: 'user-viewer',
    initialFollowingIds: [],
    initialFollowerIds: ['user-lin'],
  });

  const profiles = await client.listPublicProfiles();
  assert.ok(profiles.length >= 8);
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

  // Follower with 0 public islands is still accessible in network list and getPublicWorld
  const network = await client.listNetworkProfiles();
  assert.equal(network.followers.some(p => p.id === 'user-lin' && p.publicIslandCount === 0), true);
  const linWorld = await client.getPublicWorld('user-lin');
  assert.equal(linWorld.profile.displayName, 'Lin Zhou');
  assert.equal(linWorld.islands.length, 0);

  // Private island cannot be fetched even by ID
  const privateLookup = await client.getPublicIsland('island-private-hidden');
  assert.equal(privateLookup, null);

  // Non-owner cannot change another user's island visibility or profile
  await assert.rejects(
    () => client.setIslandVisibility(worldView.islands[0].id, { isPublic: false }),
    /permission|owner|forbidden/i,
  );
});

test('normalizeIslandSkill keeps exact skills distinct from broad themes and rankNeighborsByGraph re-ranks neighbours by skill graph', () => {
  const japaneseIsland = { category: 'custom', topic: 'Japanese language', theme: 'language', title: 'Kyoto Converse' };
  const spanishIsland = { category: 'custom', topic: 'Spanish', theme: 'language', title: 'Iberian Rails' };
  const potteryIsland = { category: 'custom', topic: 'Wheel pottery', theme: 'compass', title: 'Clay Harbor' };
  const bakingIsland = { category: 'custom', topic: 'Sourdough baking', theme: 'compass', title: 'Crust Cove' };

  const jpNorm = normalizeIslandSkill(japaneseIsland);
  const esNorm = normalizeIslandSkill(spanishIsland);
  assert.equal(jpNorm.skillKey, 'japanese');
  assert.equal(esNorm.skillKey, 'spanish');
  assert.notEqual(jpNorm.skillKey, esNorm.skillKey, 'Japanese and Spanish must have distinct exact skill keys');
  assert.equal(jpNorm.themeKey, 'language');
  assert.equal(esNorm.themeKey, 'language');

  // Unrelated custom skills with fallback 'compass' artwork theme must not share a themeKey
  const potNorm = normalizeIslandSkill(potteryIsland);
  const bakeNorm = normalizeIslandSkill(bakingIsland);
  assert.notEqual(potNorm.skillKey, bakeNorm.skillKey);
  assert.equal(potNorm.themeKey, null);
  assert.equal(bakeNorm.themeKey, null);

  const client = createFixtureSocialClient({
    viewerId: 'user-viewer',
    initialFollowingIds: [],
    initialFollowerIds: [],
  });
  const candidates = client.getSnapshotProfiles();

  // Case 1: Viewer learning Japanese & Origami -> only explorers who share one of those skills are recommended
  let jpWorld = createIsland(createWorld(), {
    title: 'Tokyo Phrases',
    category: 'custom',
    topic: 'Japanese',
    objective: 'Converse in Tokyo',
  });
  jpWorld = createIsland(jpWorld, {
    title: 'Paper Cranes',
    category: 'custom',
    topic: 'Origami',
    objective: 'Fold a paper crane',
  });

  const jpRanked = rankNeighborsByGraph(jpWorld, candidates, { limit: 8 });
  assert.deepEqual(jpRanked.map(e => e.profile.id).sort(), ['user-hana', 'user-sora']);
  assert.equal(jpRanked[0].profile.id, 'user-hana', 'Hana shares both Origami and Japanese');
  assert.equal(jpRanked[0].matchType, 'mentor');
  assert.match(jpRanked[0].reasonLabel, /^Mentor · Origami Lv 4 \(you Lv 1\)$/);
  assert.equal(jpRanked.some(e => e.profile.id === 'user-mateo'), false, 'Spanish is not a shared interest with Japanese');
  for (const entry of jpRanked) {
    assert.ok(entry.sharedSkills.length > 0, 'every recommendation shares an interest');
    assert.equal(/%/.test(entry.reasonLabel), false, 'labels are evidence-based, not uncalibrated percentages');
  }

  // Case 2: Viewer learning Guitar & Songwriting -> Maya Chen and Noah Silva rank at the top
  let musicWorld = createIsland(createWorld(), {
    title: 'Campfire Chords',
    category: 'guitar',
    objective: 'Play acoustic songs',
  });
  musicWorld = createIsland(musicWorld, {
    title: 'First Chorus',
    category: 'songwriting',
    objective: 'Write a song',
  });

  const musicRanked = rankNeighborsByGraph(musicWorld, candidates, { limit: 8 });
  assert.ok(musicRanked.length >= 1 && musicRanked.length <= 8);
  const topTwoIds = new Set([musicRanked[0].profile.id, musicRanked[1].profile.id]);
  assert.equal(topTwoIds.has('user-maya'), true);
  assert.equal(topTwoIds.has('user-noah'), true);
  assert.equal(musicRanked.some(e => e.profile.id === 'user-sora'), false, 'no shared interest -> not recommended');

  // Case 3: An empty viewer world shares no interests, so nobody is recommended (no quota filling)
  assert.deepEqual(rankNeighborsByGraph(createWorld(), candidates, { limit: 8 }), []);
});

test('rankNeighborsByGraph prioritises complementary (mentor-style) skill levels over near-equal levels', () => {
  const guitarIsland = (id, ownerId, level) => ({
    id, ownerId, title: `Guitar Lv ${level}`, category: 'guitar', level, stageName: 'City',
    publicSummary: 'Guitar practice', roadmap: { focus: 'Guitar' }, goals: [],
  });
  const profile = (id, islands, interests = []) => ({
    id, handle: id, displayName: id, interests, followerCount: 0, isFollowing: false, followsViewer: false,
    publicIslands: islands, publicIslandCount: islands.length,
  });
  const candidates = [
    profile('user-close-37', [guitarIsland('g37', 'user-close-37', 37)]),
    profile('user-beginner-1', [guitarIsland('g1', 'user-beginner-1', 1)]),
    profile('user-photographer', [{ ...guitarIsland('p5', 'user-photographer', 5), category: 'photography', title: 'Lens' }]),
  ];

  // A level 50 guitarist is matched with a level 1 guitarist ahead of a level 37 guitarist
  const viewerAt50 = { islands: [{ id: 'mine', category: 'guitar', title: 'My Guitar', level: 50 }] };
  const ranked = rankNeighborsByGraph(viewerAt50, candidates, { limit: 8 });
  assert.deepEqual(ranked.map(e => e.profile.id), ['user-beginner-1', 'user-close-37']);
  assert.equal(ranked[0].matchType, 'mentee');
  assert.match(ranked[0].reasonLabel, /You could mentor · Guitar Lv 1 \(you Lv 50\)/);
  assert.ok(ranked[0].complementarity > ranked[1].complementarity);

  // And a level 1 beginner gets the level 50 expert as a mentor ahead of a level 2 peer
  const viewerAt1 = { islands: [{ id: 'mine', category: 'guitar', title: 'My Guitar', level: 1 }] };
  const beginnerRanked = rankNeighborsByGraph(viewerAt1, [
    profile('user-peer-2', [guitarIsland('g2', 'user-peer-2', 2)]),
    profile('user-expert-50', [guitarIsland('g50', 'user-expert-50', 50)]),
  ]);
  assert.equal(beginnerRanked[0].profile.id, 'user-expert-50');
  assert.equal(beginnerRanked[0].matchType, 'mentor');
});

test('all 8 surrounding neighbour sectors and Home Waters are collision-free on the shared ocean canvas', () => {
  const boxes = [
    { id: 'home', ...HOME_CLUSTER_POS },
    ...NEIGHBOR_SECTORS.map(s => ({ id: `sector-${s.index}`, ...s })),
  ];

  assert.equal(NEIGHBOR_SECTORS.length, 8);
  for (let i = 0; i < boxes.length; i += 1) {
    const a = boxes[i];
    for (let j = i + 1; j < boxes.length; j += 1) {
      const b = boxes[j];
      const overlapsX = a.left < b.left + b.width && a.left + a.width > b.left;
      const overlapsY = a.top < b.top + b.height && a.top + a.height > b.top;
      assert.equal(
        overlapsX && overlapsY,
        false,
        `Bounding boxes ${a.id} and ${b.id} must not overlap`,
      );
    }
  }
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
  const client = createFixtureSocialClient({
    latencyMs: 15,
    initialFollowingIds: [],
    failWithError: 'Supabase network timeout',
  });

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
  assert.match(container.innerHTML, /not following any explorers with public islands yet/);

  // Reset filter to all worlds from empty state
  await container.clickButton({ socialAction: 'filter', filter: 'all' });
  assert.equal(controller.getState().status, 'ready');
  controller.destroy();
});

test('mountSocialExplore renders graph-ranked neighbour clusters, Following & Followers lists, and switches to Solo Archipelago View', async () => {
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

  // 1. No top profile-card directory strip; only shared-interest neighbours (1-8) surround Home Waters
  assert.equal(container.innerHTML.includes('class="social-directory"'), false);
  assert.match(container.innerHTML, /My Home Guitar Island/);
  assert.match(container.innerHTML, /data-map-mode="neighborhood"/);
  const initialNeighbours = controller.getState().neighborEntries;
  assert.ok(initialNeighbours.length >= 1 && initialNeighbours.length <= 8);
  assert.ok(initialNeighbours.every(e => e.sharedSkills.includes('Guitar')), 'every neighbour shares Guitar');
  assert.equal(initialNeighbours.some(e => e.profile.id === 'user-sora'), false);
  assert.equal((container.innerHTML.match(/class="archipelago-cluster neighbor-cluster/g) ?? []).length, initialNeighbours.length);
  assert.equal(controller.getState().logOpen, false);
  assert.equal(controller.getState().activeCluster, 'home');

  // Record initial sector assignments to verify sector stability after follow/unfollow
  const initialSectorForNoah = controller.getState().neighborEntries.find(e => e.profile.id === 'user-noah')?.sector.index;
  assert.equal(typeof initialSectorForNoah, 'number');

  // 2. Open the Following & Followers network panel
  await container.clickButton({ socialAction: 'open-network', networkTab: 'following' });
  assert.equal(controller.getState().logOpen, true);
  assert.equal(controller.getState().network.following.length, 2);
  assert.equal(controller.getState().network.followers.length, 4);

  // Switch to Followers tab -> includes Lin Zhou (who has 0 public islands) and Elena Rostova
  await container.clickButton({ socialAction: 'network-tab', networkTab: 'followers' });
  assert.match(container.innerHTML, /Lin Zhou/);
  assert.match(container.innerHTML, /No public islands yet/);

  // 3. Click "View archipelago" on a follower with 0 public islands -> opens Solo Archipelago Mode cleanly
  await container.clickButton({ socialAction: 'view-solo-archipelago', profileId: 'user-lin' });
  assert.equal(controller.getState().mapMode, 'solo');
  assert.equal(controller.getState().soloWorld.profile.id, 'user-lin');
  assert.equal(controller.getState().soloWorld.islands.length, 0);
  assert.match(container.innerHTML, /data-map-mode="solo"/);
  assert.match(container.innerHTML, /hasn’t published any public islands yet/);

  // Return to neighbourhood map
  await container.clickButton({ socialAction: 'exit-solo' });
  assert.equal(controller.getState().mapMode, 'neighborhood');
  assert.match(container.innerHTML, /data-map-mode="neighborhood"/);

  // 4. Click a profile in Following/Followers with public islands -> opens Solo Archipelago Mode with their islands
  await container.clickButton({ socialAction: 'open-network', networkTab: 'following' });
  await container.clickButton({ socialAction: 'view-solo-archipelago', profileId: 'user-noah' });
  assert.equal(controller.getState().mapMode, 'solo');
  assert.equal(controller.getState().soloWorld.profile.id, 'user-noah');
  assert.equal(controller.getState().soloWorld.islands.length, 2);
  assert.match(container.innerHTML, /Verse Dunes/);
  assert.match(container.innerHTML, /Rhythm Reef/);

  // Select second island on Noah's solo archipelago map and adopt it
  await container.clickButton({ socialAction: 'select-island', islandId: 'island-noah-guitar' });
  assert.equal(controller.getState().selectedIslandId, 'island-noah-guitar');

  await container.clickButton({
    socialAction: 'adopt',
    islandId: 'island-noah-guitar',
    profileId: 'user-noah',
  });
  assert.equal(adoptedTemplates.length, 1);
  assert.equal(adoptedTemplates[0].template.title, 'Rhythm Reef');
  assert.equal(adoptedTemplates[0].template.attribution, 'Noah Silva');

  // Unfollow and re-follow Noah and verify his neighbourhood sector index stayed stable
  await container.clickButton({ socialAction: 'exit-solo' });
  await container.clickButton({ socialAction: 'open-profile', profileId: 'user-noah' });
  await container.clickButton({ socialAction: 'unfollow', profileId: 'user-noah' });
  const sectorAfterUnfollow = controller.getState().neighborEntries.find(e => e.profile.id === 'user-noah')?.sector.index;
  assert.equal(sectorAfterUnfollow, initialSectorForNoah, 'neighbour stays in the same sector after follow/unfollow');

  // 5. Switch between dummy accounts to show different users receive different graph neighbours & recommendations
  const topNeighborBeforeSwitch = controller.getState().neighborEntries[0].profile.id;
  await container.clickButton({ socialAction: 'switch-viewer', viewerId: 'user-sora' });
  assert.equal(controller.getState().activeViewerId, 'user-sora');
  assert.match(container.innerHTML, /SORA TAKAHASHI’S ARCHIPELAGO · HOME WATERS/);
  assert.match(container.innerHTML, /Kyoto Converse/);
  assert.match(container.innerHTML, /Checkmate Atoll/);

  // Sora (Japanese + Chess) gets Hana Sato (Origami + Japanese) and Priya Nair (Chess + Speaking) at the top instead of Guitar neighbours
  const soraTopTwo = new Set([
    controller.getState().neighborEntries[0].profile.id,
    controller.getState().neighborEntries[1].profile.id,
  ]);
  assert.equal(soraTopTwo.has('user-hana'), true);
  assert.equal(soraTopTwo.has('user-priya'), true);
  assert.notEqual(controller.getState().neighborEntries[0].profile.id, topNeighborBeforeSwitch);

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

  const controller = mountSocialExplore(container, {
    client: maliciousClient,
    viewerWorld: { islands: [{ id: 'mine', category: 'guitar', title: 'Mine', xp: 0 }] },
  });
  await controller.ready;

  assert.equal(container.innerHTML.includes('<script>'), false);
  assert.equal(container.innerHTML.includes('<img src=x'), false);
  assert.equal(container.innerHTML.includes('<iframe'), false);
  assert.match(container.innerHTML, /&lt;script&gt;evil\(\)&lt;\/script&gt;/);
  controller.destroy();
});
