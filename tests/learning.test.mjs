import assert from 'node:assert/strict';
import test from 'node:test';
import { createIsland, createWorld, completeGoal, getActiveGoal } from '../src/world.mjs';

test('free-text creation defaults to an adaptive custom island with an automatic name', () => {
  const initial = createWorld();
  assert.equal(createIsland(initial, { topic: '   ' }), initial);
  assert.equal(createIsland(initial, { category: 'custom', title: 'No topic' }), initial);
  const world = createIsland(initial, { topic: '  Learning guitar  ', minutes: 10, experience: 'beginner' });
  const [island] = world.islands;
  assert.equal(island.category, 'custom');
  assert.equal(island.title, 'Learning guitar');
  assert.equal(island.objective, 'Learning guitar');
  assert.equal(island.theme, 'guitar');
  const [, renamed] = createIsland(world, {
    topic: 'Guitar', title: '  Chord Cove  ', objective: 'Fingerpick a song for my sister', minutes: 20,
  }).islands;
  assert.equal(renamed.title, 'Chord Cove');
  assert.equal(renamed.objective, 'Fingerpick a song for my sister');
  assert.match(getActiveGoal(renamed).description, /thumb/);
});

test('guided roadmaps teach different concrete skills and keep a relevant continuation', () => {
  const cases = [
    ['Learning guitar', /G, C and D/i, /contrasting song/i],
    ['Meeting new people', /recurring setting/i, /conversation in a new setting/i],
    ['Learning Spanish for travel', /estación/i, /Spanish.*travel/i],
    ['Origami', /diagonal crease/i, /fold/i],
    ['Photography', /frame one subject/i, /photo study/i],
    ['Public speaking', /listener to remember/i, /different audience/i],
  ];
  const titles = new Set();
  for (const [topic, start, continuation] of cases) {
    let world = createIsland(createWorld(), { topic, title: topic, category: 'custom', experience: 'beginner', minutes: 10 });
    const [island] = world.islands;
    assert.equal(island.roadmap.focus, topic);
    assert.match(island.goals[0].description, start, topic);
    for (const goal of island.goals) {
      assert.ok(goal.description && goal.finish, topic);
      assert.ok(goal.minutes <= 10, topic);
      titles.add(goal.title);
      world = completeGoal(world, island.id, goal.id);
    }
    assert.match(getActiveGoal(world.islands[0]).title, continuation, topic);
  }
  assert.equal(titles.size, 48);
});

test('origami starts at the learner’s experience and advances toward their chosen model', () => {
  const input = { topic: 'Origami', category: 'custom', title: 'Paper Harbour', objective: 'Fold a paper crane', minutes: 10 };
  const beginner = createIsland(createWorld(), { ...input, experience: 'beginner' }).islands[0];
  const advanced = createIsland(createWorld(), { ...input, experience: 'advanced' }).islands[0];
  assert.match(advanced.goals[0].description, /reverse fold/i);
  assert.notEqual(advanced.goals[0].title, beginner.goals[0].title);
  assert.match(beginner.goals[4].description, /make a bird base/i);
  assert.match(beginner.goals[6].description, /Fold a paper crane/);
});

test('a Spanish travel roadmap starts with the requested meal at the chosen experience level', () => {
  const input = { topic: 'Learning Spanish for travel', objective: 'Order a meal in Spanish', minutes: 20 };
  const beginner = createIsland(createWorld(), { ...input, experience: 'beginner' }).islands[0].goals[0];
  const advanced = createIsland(createWorld(), { ...input, experience: 'advanced' }).islands[0].goals[0];
  assert.match(beginner.title, /main dish/i);
  assert.match(advanced.description, /Podría cambiar/i);
  assert.notEqual(beginner.finish, advanced.finish);
  assert.equal(advanced.minutes, 20);
});

test('free-text classification recognises common phrasing and prioritises the stated skill', () => {
  for (const [topic, theme] of [
    ['Learn to take better photos', 'photography'],
    ['Meet more people', 'people'],
    ['Get better at speaking in public', 'speaking'],
    ['Fold paper cranes', 'origami'],
    ['Public speaking about guitar', 'speaking'],
  ]) {
    const [island] = createIsland(createWorld(), { topic }).islands;
    assert.equal(island.theme, theme, topic);
  }
});

test('map placement is scattered, stable and collision-free at desktop and mobile widths', async () => {
  const { layoutIslands } = await import('../src/map-layout.mjs');
  const ids = Array.from({ length: 24 }, (_, index) => 'island-' + (index + 1));
  for (const width of [288, 350, 560, 890]) {
    const layout = layoutIslands(ids, width);
    assert.deepEqual(layoutIslands(JSON.parse(JSON.stringify(ids)), width), layout);
    assert.deepEqual(layoutIslands(ids.slice(0, 6), width).positions, layout.positions.slice(0, 6));
    const { positions, height } = layout;
    assert.ok(Math.abs(positions[0].top - positions[1].top) >= 35);
    assert.ok(Math.abs(positions[0].left - positions[1].left) >= 50);
    assert.ok(new Set(positions.slice(0, 6).map(rect => rect.width)).size >= 3);
    assert.ok(new Set(positions.slice(0, 6).map(rect => rect.top)).size >= 5);
    for (const [index, a] of positions.entries()) {
      assert.ok(a.left >= 8 && a.left + a.width <= width - 8);
      assert.ok(a.top >= 8 && a.top + a.height <= height - 8);
      for (const b of positions.slice(index + 1)) {
        assert.ok(a.left + a.width <= b.left || b.left + b.width <= a.left ||
          a.top + a.height <= b.top || b.top + b.height <= a.top);
      }
    }
  }
});

test('sea routes avoid unrelated islands and limit the lines touching each island', async () => {
  const { layoutSeaRoutes } = await import('../src/map-layout.mjs');
  const positions = [
    { left: 10, top: 10, width: 40, height: 60 },
    { left: 100, top: 10, width: 40, height: 60 },
    { left: 10, top: 90, width: 40, height: 60 },
    { left: 100, top: 90, width: 40, height: 60 },
    { left: 180, top: 10, width: 40, height: 60 },
  ];
  const pairs = [[0, 4], [0, 1], [0, 2], [0, 3]];
  const routes = layoutSeaRoutes(pairs, positions, 230, 160);
  assert.deepEqual(routes.map(({ from, to }) => [from, to]), [[0, 2], [0, 1]]);
  const blocked = positions.map((position, index) => index === 1 ? { ...position, top: 0, height: 160 } : position);
  assert.deepEqual(layoutSeaRoutes([[0, 4]], blocked, 230, 160), []);
});
