import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptIsland, completeGoal, createIsland, createWorld, getActiveGoal, getStage, setDifficulty, getAdaptationRequest } from '../src/world.mjs';
import { generateCustomRoadmap, generateAdaptiveGoal } from '../src/local-planner.mjs';
import { renderIsland } from '../src/scene.mjs';
import { relatedSkill } from '../src/skill-connections.mjs';

const guitar = { title: 'Learn guitar', category: 'guitar', experience: 'intermediate', minutes: 8, objective: 'play at an open mic' };

test('the roadmap respects skill level, practice time and the objective', () => {
  const [island] = createIsland(createWorld(), guitar).islands;
  assert.equal(island.goals[0].title, 'Measure your chord changes');
  assert.ok(island.goals.every(goal => goal.minutes <= 8));
  assert.equal(island.objective, guitar.objective);
  assert.equal(island.roadmap.focus, 'Acoustic singer-songwriter');
  assert.ok(island.goals.every(goal => goal.finish.length > 0));
});

test('only unlocked goals earn XP, and each goal can earn it once', () => {
  const world = createIsland(createWorld(), guitar);
  const [island] = world.islands;
  const [first, second] = island.goals;
  assert.equal(completeGoal(world, island.id, second.id), world);
  const updated = completeGoal(world, island.id, first.id);
  assert.equal(updated.islands[0].xp, 40);
  assert.equal(getStage(updated.islands[0].xp).level, 1);
  assert.equal(getStage(updated.islands[0].xp).nextThreshold, 350);
  assert.equal(getActiveGoal(updated.islands[0]).id, second.id);
  const secondCompletion = completeGoal(updated, island.id, second.id);
  assert.equal(secondCompletion.islands[0].xp, 100);
  assert.equal(getStage(secondCompletion.islands[0].xp).level, 1);
  assert.equal(world.islands[0].xp, 0);
  assert.equal(completeGoal(updated, island.id, first.id), updated);
  const completed = island.goals.slice(1).reduce((state, goal) => completeGoal(state, island.id, goal.id), updated);
  assert.deepEqual(getStage(completed.islands[0].xp), { level: 2, name: 'Hamlet', threshold: 350, nextThreshold: 950 });
});

test('adoption starts a separate island at level one and preserves credit', () => {
  const world = createIsland(createWorld(), guitar);
  const [island] = world.islands;
  const progressed = completeGoal(world, island.id, island.goals[0].id);
  const [source] = progressed.islands;
  const [original, adopted] = adoptIsland(progressed, { ...source, owner: 'Demo explorer' }).islands;
  assert.equal(original.goals[0].completed, true);
  assert.notEqual(adopted.id, original.id);
  assert.equal(adopted.xp, 0);
  assert.equal(adopted.attribution, 'Demo explorer');
  assert.ok(adopted.goals.every(goal => !goal.completed));
  assert.deepEqual(adopted.goals[1].prerequisites, original.goals[1].prerequisites);
});

test('an Ed Sheeran ambition builds towards a first solo set with distinct skill milestones', () => {
  const [island] = createIsland(createWorld(), { ...guitar, experience: 'beginner', objective: 'I want to be better than Ed Sheeran' }).islands;
  assert.equal(island.roadmap.focus, 'Acoustic singer-songwriter');
  assert.match(island.roadmap.checkpoint, /three-song solo set/);
  assert.match(island.roadmap.next, /perform regularly/);
  assert.ok(island.goals.some(goal => /live loop/.test(goal.title)));
  assert.ok(island.goals.some(goal => /Sing over/.test(goal.title)));
  assert.ok(island.goals.some(goal => /original song/.test(goal.title)));
  assert.ok(island.goals.every(goal => goal.minutes <= guitar.minutes));
  const [ordinary] = createIsland(createWorld(), { ...guitar, objective: 'Play one song for friends' }).islands;
  assert.equal(ordinary.roadmap.focus, 'Song accompaniment');
  assert.ok(!ordinary.goals.some(goal => /live loop/.test(goal.title)));
});

test('the selected skill and ambition change the practice goals', () => {
  const world = createIsland(createWorld(), { ...guitar, category: 'photography', objective: 'Make a landscape portfolio' });
  const [landscape, portrait, writing] = createIsland(
    createIsland(world, { ...guitar, category: 'photography', objective: 'Take portraits of my friends' }),
    { ...guitar, category: 'songwriting', objective: 'Write better lyrics' },
  ).islands;
  assert.equal(landscape.goals[0].title, 'Build foreground and depth');
  assert.equal(portrait.goals[0].title, 'Find flattering light');
  assert.equal(writing.goals[0].title, 'Write a lyrical hook');
  const [fingerstyle] = createIsland(createWorld(), { ...guitar, objective: 'Play a fingerstyle arrangement' }).islands;
  assert.equal(fingerstyle.roadmap.focus, 'Fingerstyle arrangement');
});

test('a saved island without roadmap metadata can still earn XP and be adopted', () => {
  const legacyIsland = {
    id: 'island-1', title: 'Old Island', category: 'guitar', xp: 100,
    goals: [{ id: 'goal-1', xp: 100, prerequisites: [], completed: true },
      { id: 'goal-2', xp: 150, prerequisites: ['goal-1'], completed: false }],
  };
  const progressed = completeGoal({ islands: [legacyIsland] }, legacyIsland.id, 'goal-2');
  assert.equal(progressed.islands[0].xp, 250);
  const [original, adopted] = adoptIsland(progressed, progressed.islands[0]).islands;
  assert.equal(original.xp, 250);
  assert.equal(adopted.xp, 0);
  assert.ok(adopted.goals.every(goal => !goal.completed));
});

test('one goal remains available across many practice rounds and higher levels', () => {
  let world = createIsland(createWorld(), { ...guitar, objective: 'Better than Ed Sheeran' });
  const starterCount = world.islands[0].goals.length;
  const seen = new Set();
  for (let index = 0; index < starterCount + 20; index += 1) {
    const [island] = world.islands;
    const goal = getActiveGoal(island);
    assert.ok(!seen.has(goal.id), 'each goal receives a fresh ID');
    assert.ok(goal.minutes <= guitar.minutes);
    if (index === starterCount) {
      assert.equal(island.xp, 900);
      assert.match(goal.title, /Expand your live set/);
      assert.equal(getStage(island.xp).level, 2);
    }
    if (index === starterCount + 3) {
      assert.equal(island.xp, 1400);
      assert.equal(getStage(island.xp).level, 3);
    }
    seen.add(goal.id);
    world = completeGoal(world, island.id, goal.id);
    assert.equal(world.islands[0].xp, island.xp + goal.xp);
    assert.equal(completeGoal(world, island.id, goal.id), world);
  }
  const [source] = world.islands;
  const saved = JSON.parse(JSON.stringify(source));
  assert.deepEqual(getActiveGoal(saved), getActiveGoal(source));
  const adopted = adoptIsland(createWorld(), source).islands[0];
  assert.equal(adopted.goals.length, starterCount);
  assert.equal(getActiveGoal(adopted).id, 'goal-1');
});

test('a legacy island with all goals complete receives a continuation', () => {
  const island = {
    id: 'island-1', title: 'Old Guitar Island', category: 'guitar', xp: 900,
    goals: [{ id: 'goal-1', xp: 900, minutes: 20, prerequisites: [], completed: true }],
  };
  const goal = getActiveGoal(island);
  assert.equal(goal.id, 'goal-2');
  assert.equal(goal.minutes, 20);
  assert.equal(goal.continuation, true);
  const progressed = completeGoal({ islands: [island] }, island.id, goal.id);
  assert.equal(progressed.islands[0].xp, 1050);
  assert.notEqual(getActiveGoal(progressed.islands[0]).id, goal.id);
});

test('meeting new people creates a custom social progression without a second objective', () => {
  const input = { title: 'Meeting new people', topic: 'Meeting new people', category: 'custom', experience: 'beginner', minutes: 10 };
  let world = createIsland(createWorld(), input);
  const [island] = world.islands;
  assert.equal(island.category, 'custom');
  assert.equal(island.objective, input.topic);
  assert.equal(island.theme, 'people');
  assert.equal(getActiveGoal(island).title, 'Find a low-pressure place to meet people');
  assert.ok(island.goals.some(goal => goal.title === 'Say hello to one new person'));
  const campus = createIsland(createWorld(), { ...input, objective: 'Make friends on campus' }).islands[0];
  assert.match(getActiveGoal(campus).description, /on campus/);
  for (const goal of island.goals) world = completeGoal(world, island.id, goal.id);
  const [progressed] = world.islands;
  assert.equal(progressed.xp, 900);
  assert.match(getActiveGoal(progressed).title, /conversation in a new setting/);
  assert.equal(getActiveGoal(progressed).minutes, 10);
});

test('custom islands keep their own skill, outcome and appearance', () => {
  const input = { title: 'Paper Harbour', topic: 'Origami', category: 'custom', objective: 'Fold a paper crane', experience: 'beginner', minutes: 20 };
  const [origami, chess] = createIsland(createIsland(createWorld(), input), {
    ...input, title: 'Chess Island', topic: 'Chess', objective: 'Beat my friends at chess',
  }).islands;
  assert.match(getActiveGoal(origami).title, /Origami/);
  assert.ok(origami.goals.some(goal => goal.description.includes('Fold a paper crane')));
  assert.equal(chess.theme, 'board');
  assert.notEqual(renderIsland(origami, 1), renderIsland(chess, 1));
  const [copy] = adoptIsland(createWorld(), origami).islands;
  assert.equal(copy.topic, 'Origami');
  assert.equal(copy.theme, origami.theme);
  assert.equal(copy.xp, 0);
  assert.equal(renderIsland(JSON.parse(JSON.stringify(origami)), 1), renderIsland(origami, 1));
  assert.equal(createIsland(createWorld(), { ...input, topic: '   ' }).islands.length, 0);
});

test('island scenery varies deterministically while retaining each skill landmark', () => {
  const base = { category: 'custom', theme: 'compass', topic: 'Urban gardening', objective: 'Grow tomatoes', xp: 0 };
  const variants = ['river-delta', 'pine-cove', 'sunstone-bay', 'twin-lagoon'].map(id =>
    renderIsland({ ...base, id }, 1),
  );
  assert.equal(new Set(variants).size, variants.length, 'different island identities get distinct scenery');
  assert.equal(renderIsland({ ...base, id: 'river-delta' }, 1), variants[0], 'the scenery is stable after reload');
  assert.match(variants[0], /data-biome="[a-z-]+"/);
  assert.match(variants[0], /data-coast="\d+"/);

  const [photo] = createIsland(createWorld(), { ...guitar, category: 'photography', id: 'photo-test' }).islands;
  const photoArt = renderIsland(photo, 2);
  assert.match(photoArt, /photography-terrain/);
  assert.match(photoArt, /biome-shoreline/);
  assert.notEqual(photoArt, renderIsland(photo, 1), 'island development continues to update the art');
});

test('terrain colours vary independently of shape and stay put across refresh and level changes', () => {
  const photo = { category: 'custom', landmark: 'camera', topic: 'Photography' };
  const islands = Array.from({ length: 12 }, (_, index) => ({ ...photo, id: 'island-' + (index + 1) }));
  const appearance = art => art.match(/data-(?:palette|landform|landmark)="[^"]+"/g);
  const variants = islands.map(island => appearance(renderIsland(island, 1)));
  assert.ok(new Set(variants.map(([palette]) => palette)).size >= 5);
  assert.equal(new Set(variants.map(([, shape]) => shape)).size, 2);
  assert.ok(new Set(variants.filter(([, shape]) => shape === variants[0][1]).map(([palette]) => palette)).size > 1);
  assert.deepEqual(islands.map(island => appearance(renderIsland(JSON.parse(JSON.stringify(island)), 10))), variants);
});

test('related skills get different landmarks and unlisted topics get safe personal seals', () => {
  const topics = ['Photography', 'Filmmaking', 'Piano', 'Drums', 'Violin', 'Learn to breakdance', 'Ballet', 'Pottery', 'Whittling',
    'Getting better at Valorant', 'Competitive gaming in Counter-Strike 2', 'Mario Kart', 'Minecraft', 'Video games'];
  const art = topic => renderIsland({ id: 'island-1', category: 'custom', landmark: 'compass', topic }, 1);
  const landmarks = topics.map(topic => art(topic).match(/data-landmark="([^"]+)"/)[1]);
  assert.deepEqual(landmarks, ['camera', 'film', 'piano', 'drums', 'violin', 'breakdance', 'dance', 'pottery', 'woodwork',
    'shooter', 'shooter', 'racing', 'building-game', 'controller']);
  const seals = ['Learn bookbinding', 'Learn birdwatching', '<img src=x onerror=alert(1)>'].map(topic =>
    art(topic).match(/<g class="topic-seal">[\s\S]*?<\/text>/)[0],
  );
  assert.equal(new Set(seals).size, 3);
  assert.doesNotMatch(seals[2], /<img|onerror=/);
});

test('the local planner accepts structured goals and rejects unavailable or duplicate output', async () => {
  const input = { topic: 'Pottery', objective: 'Make a cup', experience: 'beginner', minutes: 10 };
  let created = 0;
  let destroyed = 0;
  const goals = Array.from({ length: 8 }, (_, index) => ({
    title: 'Shape practice piece ' + (index + 1),
    practice: 'Shape the clay using motion ' + (index + 1) + ' from your cup reference.',
    finish: 'Compare the rim on attempt ' + (index + 1) + ' with the reference.',
  }));
  const model = {
    availability: async () => 'available',
    create: async () => {
      created += 1;
      return {
        prompt: async (prompt, options) => {
          assert.match(prompt, /"topic":"Pottery"/);
          assert.equal(options.responseConstraint.properties.goals.maxItems, 8);
          return JSON.stringify({ decision: 'ready', checkpoint: 'Finish a small practice cup.', goals });
        },
        destroy: () => { destroyed += 1; },
      };
    },
  };
  assert.deepEqual(await generateCustomRoadmap(input, { model: { ...model, availability: async () => 'downloadable' } }), { status: 'unavailable' });
  assert.equal(created, 0);
  const { plan: generated } = await generateCustomRoadmap(input, { model });
  assert.equal(generated.steps.length, 8);
  const [island] = createIsland(createWorld(), { ...input, title: 'Pottery', category: 'custom', localRoadmap: generated }).islands;
  assert.equal(island.roadmap.onDevice, true);
  assert.equal(getActiveGoal(island).title, goals[0].title);
  goals[1].practice = goals[0].practice;
  assert.deepEqual(await generateCustomRoadmap(input, { model }), { status: 'retry' });
  assert.equal(destroyed, 2);
});

test('difficulty feedback adds tailored practice without awarding XP or changing the milestone', () => {
  const world = createIsland(createWorld(), { ...guitar, experience: 'beginner' });
  const [original] = world.islands;
  const first = getActiveGoal(original);
  const supported = setDifficulty(world, original.id, first.id, 'support');
  const [island] = supported.islands;
  const adjusted = getActiveGoal(island);
  assert.match(adjusted.practiceAdjustment, /G to C/);
  assert.equal(adjusted.finish, first.finish);
  assert.equal(adjusted.xp, first.xp);
  assert.equal(island.xp, 0);
  assert.equal(setDifficulty(supported, island.id, 'goal-2', 'stretch'), supported);
  assert.equal(setDifficulty(supported, island.id, first.id, 'invalid'), supported);

  const completed = completeGoal(supported, island.id, first.id);
  const [progressed] = completed.islands;
  assert.equal(progressed.xp, 40);
  assert.equal(progressed.goals[0].practiceAdjustment, undefined);
  assert.notEqual(getActiveGoal(progressed).practiceAdjustment, adjusted.practiceAdjustment);
  assert.ok(getActiveGoal(JSON.parse(JSON.stringify(progressed))).practiceAdjustment);
  const next = getActiveGoal(progressed);
  const stretched = setDifficulty(completed, island.id, next.id, 'stretch');
  assert.match(getActiveGoal(stretched.islands[0]).practiceAdjustment, /dynamics/);
  const standard = setDifficulty(stretched, island.id, next.id, 'standard');
  assert.equal(getActiveGoal(standard.islands[0]).practiceAdjustment, undefined);
  assert.equal(adoptIsland(createWorld(), progressed).islands[0].difficulty, undefined);
});

test('a related skill becomes available at 100 XP and points to an existing island when possible', () => {
  let world = createIsland(createWorld(), { ...guitar, title: 'Guitar Island' });
  const [guitarIsland] = world.islands;
  assert.equal(relatedSkill(guitarIsland, world.islands), null);
  world = guitarIsland.goals.slice(0, 2).reduce((current, goal) => completeGoal(current, guitarIsland.id, goal.id), world);
  const [progressed] = world.islands;
  const suggested = relatedSkill(progressed, world.islands);
  assert.equal(suggested.category, 'songwriting');
  assert.match(suggested.reason, /chord changes/);
  assert.equal(suggested.islandId, undefined);
  world = createIsland(world, { ...guitar, ...suggested, title: 'Songwriting Island' });
  assert.equal(relatedSkill(progressed, world.islands).islandId, world.islands[1].id);
});

test('related custom skills start with relevant practice goals', () => {
  for (const [source, title, first] of [
    [{ category: 'custom', theme: 'people' }, 'Public speaking', 'Choose one point to share'],
    [{ category: 'custom', theme: 'language' }, 'Meeting new people', 'Find a low-pressure place to meet people'],
    [{ category: 'photography' }, 'Visual storytelling', 'Define the story in one sentence'],
  ]) {
    const suggestion = relatedSkill({ ...source, id: 'island-1', xp: 100 }, []);
    assert.equal(suggestion.name, title);
    const [island] = createIsland(createWorld(), { ...guitar, ...suggestion, title, experience: 'beginner' }).islands;
    assert.equal(getActiveGoal(island).title, first);
  }
});

const socialInput = {
  title: 'Meeting new people', topic: 'Meeting new people', category: 'custom',
  objective: 'Make friends through a campus society', experience: 'beginner', minutes: 10,
};

function completeActive(world, rating) {
  const [island] = world.islands;
  const goal = getActiveGoal(island);
  const updated = rating ? setDifficulty(world, island.id, goal.id, rating) : world;
  return completeGoal(updated, island.id, goal.id);
}

test('social feedback changes the next activity while preserving the goal sequence', () => {
  const first = createIsland(createWorld(), socialInput);
  const atGreeting = completeActive(completeActive(first));
  const original = atGreeting.islands[0];
  assert.equal(getActiveGoal(original).title, 'Say hello to one new person');
  const supported = completeActive(atGreeting, 'support');
  const stretched = completeActive(atGreeting, 'stretch');
  const standard = completeActive(atGreeting, 'standard');
  const easierGoal = getActiveGoal(supported.islands[0]);
  const harderGoal = getActiveGoal(stretched.islands[0]);
  const planned = getActiveGoal(standard.islands[0]);

  assert.equal(planned.title, 'Ask a follow-up question');
  assert.equal(easierGoal.title, 'Have one brief exchange in a familiar setting');
  assert.equal(harderGoal.title, 'Ask a follow-up that fits the conversation');
  assert.match(easierGoal.description, /greet one person/);
  assert.match(harderGoal.finish, /second question builds on what they said/);
  for (const next of [easierGoal, harderGoal]) {
    assert.equal(next.id, planned.id);
    assert.equal(next.xp, planned.xp);
    assert.equal(next.minutes, planned.minutes);
    assert.deepEqual(next.prerequisites, planned.prerequisites);
  }
  assert.equal(supported.islands[0].xp, standard.islands[0].xp);
  assert.equal(completeGoal(supported, original.id, 'goal-3'), supported);
  assert.deepEqual(getActiveGoal(JSON.parse(JSON.stringify(supported.islands[0]))), easierGoal);
  assert.equal(adoptIsland(createWorld(), supported.islands[0]).islands[0].nextGoalAdjustment, undefined);
});

test('guided adaptations work across 24 topic, time-budget and difficulty combinations', () => {
  const topics = [
    ['Meeting new people', 'Make friends on campus', 'one opener'],
    ['Spanish', 'Order a meal in Spanish', 'exchange'],
    ['Chess', 'Beat a friend at chess', 'position'],
    ['Public speaking', 'Give a two-minute talk', 'talk'],
    ['Visual storytelling', 'Make a photo essay', 'frames'],
    ['Origami', 'Fold a paper crane', 'Origami'],
  ];
  for (const [topic, objective, expected] of topics) {
    for (const [minutes, experience] of [[10, 'beginner'], [30, 'intermediate']]) {
      for (const rating of ['support', 'stretch']) {
        const world = createIsland(createWorld(), { ...socialInput, topic, objective, minutes, experience });
        const updated = completeActive(world, rating);
        const goal = getActiveGoal(updated.islands[0]);
        assert.equal(goal.adapted, rating);
        assert.equal(goal.id, 'goal-2');
        assert.ok(goal.minutes > 0 && goal.minutes <= minutes);
        assert.equal(goal.xp, 60);
        assert.equal(updated.islands[0].xp, 40);
        assert.notEqual(goal.title, world.islands[0].goals[1].title);
        assert.ok(goal.finish.length > 10);
        if (rating === 'support') assert.ok((goal.title + ' ' + goal.description).includes(expected));
      }
    }
  }
});

test('repeated feedback can adapt a new goal and continue beyond the starter roadmap', () => {
  let world = createIsland(createWorld(), socialInput);
  for (let step = 0; step < 9; step += 1) world = completeActive(world, 'support');
  const [island] = world.islands;
  const goal = getActiveGoal(island);
  assert.equal(goal.id, 'goal-10');
  assert.equal(goal.adapted, 'support');
  assert.equal(island.xp, 1050);
  world = completeActive(world);
  assert.equal(getActiveGoal(world.islands[0]).adapted, undefined);
});

test('local next-goal drafting accepts a distinct response and rejects copies and unavailable models', async () => {
  const atGreeting = completeActive(completeActive(createIsland(createWorld(), socialInput)));
  const [island] = setDifficulty(atGreeting, 'island-1', 'goal-3', 'support').islands;
  const request = getAdaptationRequest(island, 'goal-3');
  assert.equal(request.feedback, 'support');
  assert.equal(request.plannedGoal.title, 'Ask a follow-up question');
  let response = { title: 'Greet someone at your regular group', practice: 'Say hello and ask one question about the activity.', finish: 'Have a short exchange and write down one follow-up idea.' };
  const model = {
    availability: async () => 'available',
    create: async () => ({
      prompt: async (prompt, { responseConstraint }) => {
        assert.match(prompt, /campus society/);
        assert.match(prompt, /too hard/);
        assert.match(prompt, /"minutes":10/);
        assert.deepEqual(responseConstraint.required, ['title', 'practice', 'finish']);
        return JSON.stringify(response);
      },
      destroy() {},
    }),
  };
  const replacement = await generateAdaptiveGoal(request, { model });
  const next = completeGoal({ islands: [island] }, island.id, 'goal-3', replacement);
  assert.equal(getActiveGoal(next.islands[0]).title, response.title);
  assert.equal(getActiveGoal(next.islands[0]).xp, request.plannedGoal.xp);
  response = { ...response, title: request.plannedGoal.title };
  assert.equal(await generateAdaptiveGoal(request, { model }), null);
  assert.equal(await generateAdaptiveGoal(request, { model: { ...model, availability: async () => 'unavailable' } }), null);
});
