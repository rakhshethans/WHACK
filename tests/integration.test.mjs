import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adoptIsland,
  completeGoal,
  createIsland,
  createWorld,
  getActiveGoal,
  getStage,
  needsRoadmapRevision,
  setDifficulty,
} from '../src/world.mjs';
import { generateStarterRoadmap } from '../src/local-planner.mjs';
import {
  createFixtureSocialClient,
  mountSocialExplore,
  rankNeighborsByGraph,
  recommendExplorers,
  toAdoptableRoadmap,
  toPublicIsland,
  toPublicProfile,
  validateAdoptableRoadmap,
} from '../src/social/index.mjs';

function createMockContainer() {
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

test('integration: adopting a social island into the personal world resets XP/progress, preserves attribution, and progresses through 10-level learning engine', async () => {
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const hanaWorld = await client.getPublicWorld('user-hana');
  const sourceOrigami = hanaWorld.islands.find(i => i.id === 'island-paper-crane-cay');
  assert.ok(sourceOrigami);
  assert.equal(sourceOrigami.xp, 2200);
  assert.equal(sourceOrigami.level, 4);

  const template = toAdoptableRoadmap(sourceOrigami, hanaWorld.profile);
  assert.equal(validateAdoptableRoadmap(template).valid, true);
  assert.equal(template.xp, 0);
  assert.equal(template.attribution, 'Hana Sato');

  let personalWorld = createWorld();
  personalWorld = adoptIsland(personalWorld, template);
  const [adopted] = personalWorld.islands;

  assert.equal(adopted.title, 'Paper Crane Cay');
  assert.equal(adopted.attribution, 'Hana Sato');
  assert.equal(adopted.xp, 0);
  assert.equal(getStage(adopted.xp).level, 1);
  assert.equal(getStage(adopted.xp).name, 'Settlement');
  assert.ok(adopted.goals.every(goal => goal.completed === false));

  // Verify compatibility with the 10-level learning & difficulty engine
  const firstGoal = getActiveGoal(adopted);
  assert.equal(firstGoal.id, 'goal-1');
  assert.equal(firstGoal.practiceLevel, 1);
  assert.ok(firstGoal.levelPractice.length > 10);

  personalWorld = setDifficulty(personalWorld, adopted.id, firstGoal.id, 'support');
  personalWorld = completeGoal(personalWorld, adopted.id, firstGoal.id);
  const [progressed] = personalWorld.islands;
  assert.equal(progressed.xp, 40);
  assert.equal(progressed.goals[0].completed, true);

  const secondGoal = getActiveGoal(progressed);
  assert.equal(secondGoal.id, 'goal-2');
  assert.equal(secondGoal.adapted, 'support');

  // Verify saving and reloading adopted island from JSON storage
  const serialized = JSON.stringify(personalWorld);
  const reloadedWorld = JSON.parse(serialized);
  const [reloadedIsland] = reloadedWorld.islands;
  assert.equal(reloadedIsland.attribution, 'Hana Sato');
  assert.equal(reloadedIsland.xp, 40);
  assert.deepEqual(getActiveGoal(reloadedIsland), secondGoal);
});

test('integration: changing user islands and adopting new islands dynamically updates graph neighbours and social recommendations', () => {
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const candidates = client.getSnapshotProfiles();

  // 1. Empty world -> 0 neighbours recommended (strict shared-interest filter)
  const emptyWorld = createWorld();
  assert.equal(rankNeighborsByGraph(emptyWorld, candidates).length, 0);

  // 2. Add a Guitar island -> Guitar explorers (Maya, Noah, Mateo) appear; Japanese/Origami explorers (Sora, Hana) do not
  let world = createIsland(emptyWorld, {
    title: 'Acoustic Bay',
    category: 'guitar',
    objective: 'Play fingerstyle songs',
    experience: 'beginner',
    minutes: 20,
  });
  const guitarNeighbors = rankNeighborsByGraph(world, candidates);
  assert.ok(guitarNeighbors.some(e => e.profile.id === 'user-maya'));
  assert.ok(guitarNeighbors.some(e => e.profile.id === 'user-noah'));
  assert.equal(guitarNeighbors.some(e => e.profile.id === 'user-hana'), false);
  assert.equal(guitarNeighbors.some(e => e.profile.id === 'user-sora'), false);

  // Maya is Lv 4 in Guitar while viewer is Lv 1 -> Mentor match
  const mayaMatch = guitarNeighbors.find(e => e.profile.id === 'user-maya');
  assert.equal(mayaMatch.matchType, 'mentor');
  assert.match(mayaMatch.reasonLabel, /Mentor · Guitar Lv 4 \(you Lv 1\)/);

  // 3. Adopt Hana's Origami island into the personal world -> Hana now appears as an Origami mentor!
  const hanaProfile = candidates.find(p => p.id === 'user-hana');
  const origamiTemplate = toAdoptableRoadmap(hanaProfile.publicIslands[0], hanaProfile);
  world = adoptIsland(world, origamiTemplate);

  const updatedNeighbors = rankNeighborsByGraph(world, candidates);
  assert.ok(updatedNeighbors.some(e => e.profile.id === 'user-hana'));
  const matches = recommendExplorers(world, candidates);
  assert.ok(matches.some(m => m.profile.id === 'user-hana'));
});

test('integration: switching between personal world and social Explore preserves state and updates recommendations after adoption', async () => {
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const container = createMockContainer();

  let personalWorld = createIsland(createWorld(), {
    title: 'My Spanish Island',
    category: 'custom',
    topic: 'Learn Spanish for travel',
    objective: 'Order a meal in Spanish',
    experience: 'beginner',
    minutes: 20,
  });

  let adoptedIntoPersonal = null;
  let controller = mountSocialExplore(container, {
    client,
    viewerWorld: personalWorld,
    onAdopt(template) {
      personalWorld = adoptIsland(personalWorld, template);
      adoptedIntoPersonal = personalWorld.islands.at(-1);
      // Simulate app switching back to personal world and destroying Explore controller
      controller.destroy();
    },
  });
  await controller.ready;

  // With only Spanish in personalWorld, Mateo Rivera (Spanish + Guitar) is the recommended neighbour
  const initialNeighbors = controller.getState().neighborEntries;
  assert.equal(initialNeighbors.length, 1);
  assert.equal(initialNeighbors[0].profile.id, 'user-mateo');

  // Adopt Mateo's second island (Flamenco Pier - Guitar) from Explore
  await container.clickButton({ socialAction: 'open-profile', profileId: 'user-mateo' });
  await container.clickButton({
    socialAction: 'adopt',
    profileId: 'user-mateo',
    islandId: 'island-flamenco-pier',
  });

  assert.ok(adoptedIntoPersonal);
  assert.equal(adoptedIntoPersonal.title, 'Flamenco Pier');
  assert.equal(adoptedIntoPersonal.attribution, 'Mateo Rivera');
  assert.equal(adoptedIntoPersonal.xp, 0);
  assert.equal(personalWorld.islands.length, 2);

  // Re-mount Explore with the updated personalWorld (now Spanish + Guitar)
  controller = mountSocialExplore(container, {
    client,
    viewerWorld: personalWorld,
  });
  await controller.ready;

  const afterAdoptNeighbors = controller.getState().neighborEntries;
  assert.ok(afterAdoptNeighbors.length > initialNeighbors.length, 'adding Guitar unlocks Guitar neighbours');
  assert.ok(afterAdoptNeighbors.some(e => e.profile.id === 'user-maya'));
  assert.ok(afterAdoptNeighbors.some(e => e.profile.id === 'user-noah'));
  controller.destroy();
});

test('integration: AI unavailability falls back cleanly to non-boilerplate guided roadmaps for both recognised and arbitrary skills', async () => {
  // 1. Confirm generateStarterRoadmap reports unavailable when LanguageModel is absent
  const planInput = {
    topic: 'Bake a sourdough loaf',
    objective: 'Bake a crusty country loaf on Saturday',
    experience: 'beginner',
    minutes: 20,
  };
  const aiResult = await generateStarterRoadmap(planInput, { model: null });
  assert.equal(aiResult.status, 'unavailable');

  // 2. Fallback via createIsland produces a valid, non-boilerplate 8-goal progression
  let world = createIsland(createWorld(), { ...planInput, category: 'custom' });
  assert.equal(world.islands.length, 1);
  const [sourdough] = world.islands;
  assert.equal(sourdough.title, 'Bake a sourdough loaf');
  assert.equal(sourdough.goals.length, 8);
  assert.equal(needsRoadmapRevision(sourdough), false, 'fallback roadmap must not trigger boilerplate revision lock');

  const firstGoal = getActiveGoal(sourdough);
  assert.ok(firstGoal);
  assert.match(firstGoal.title, /Bake a sourdough loaf/);
  assert.ok(firstGoal.finish.length > 10);

  // Completing goals and continuing beyond goal 8 works seamlessly
  for (const goal of sourdough.goals) {
    world = completeGoal(world, sourdough.id, goal.id);
  }
  assert.equal(world.islands[0].xp, 900);
  const continuation = getActiveGoal(world.islands[0]);
  assert.ok(continuation);
  assert.equal(continuation.continuation, true);
});

test('integration: opt-in visibility and privacy strip private islands and unshared objectives across social boundaries', async () => {
  const client = createFixtureSocialClient({ viewerId: 'user-viewer' });
  const mayaWorld = await client.getPublicWorld('user-maya');
  assert.equal(mayaWorld.islands.some(i => i.id === 'island-private-hidden'), false);
  assert.equal(await client.getPublicIsland('island-private-hidden'), null);

  // Creating a personal island is private by default until explicitly published
  const personalWorld = createIsland(createWorld(), {
    title: 'Private Study Notes',
    category: 'custom',
    topic: 'Chess',
    objective: 'Win my first tournament game',
    experience: 'beginner',
    minutes: 15,
  });
  const [privateIsland] = personalWorld.islands;
  assert.equal(toPublicIsland(privateIsland, { displayName: 'Me', handle: 'me' }), null);

  const optedIn = toPublicIsland(
    { ...privateIsland, isPublic: true, shareObjective: false, publicSummary: 'Endgame tactics' },
    { displayName: 'Me', handle: 'me' },
  );
  assert.ok(optedIn);
  assert.equal(optedIn.publicSummary, 'Endgame tactics');
  assert.equal('objective' in optedIn, false);
  assert.equal(JSON.stringify(optedIn).includes('Win my first tournament game'), false);
  assert.ok(toPublicProfile({ id: 'u1', handle: 'me', displayName: 'Me', islands: [privateIsland] }).publicIslands.length === 0);
});
