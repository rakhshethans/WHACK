import assert from 'node:assert/strict';
import test from 'node:test';
import { iconCandidates, iconForTopic, renderGeneratedIcon, storeGeneratedIcon } from '../src/generated-icons.mjs';
import { generateIslandIcon } from '../src/local-planner.mjs';
import { renderIsland } from '../src/scene.mjs';

const drawing = {
  reuse: -1, family: 'Bookbinding', aliases: ['Journal making'],
  paths: [
    { d: 'M 12 8 L 53 8 L 53 56 L 12 56 Z', colour: 'teal' },
    { d: 'M21,9 L21,55', colour: 'line' },
    { d: 'M 29 25 L 44 25 L 44 36 L 29 36 Z', colour: 'cream' },
  ],
};

test('generated icons survive reload and share artwork across aliases and model-selected reuse', () => {
  const library = JSON.parse(JSON.stringify(storeGeneratedIcon([], 'Learn bookbinding', drawing, [])));
  const original = iconForTopic(library, 'Learn bookbinding');
  assert.equal(iconForTopic(library, 'I want to learn journal making'), original);
  assert.equal(iconForTopic(library, 'Metalworking'), undefined);
  const reused = storeGeneratedIcon(library, 'Handbound notebooks', { reuse: 0 }, iconCandidates(library));
  assert.equal(reused.length, 1);
  assert.deepEqual(iconForTopic(reused, 'Handbound notebooks').paths, original.paths);
  const island = { id: 'island-1', category: 'custom', landmark: 'compass', topic: 'Learn bookbinding' };
  const first = renderIsland(island, 1);
  const finished = renderIsland(island, 1, original);
  assert.match(first, /class="topic-seal"/);
  assert.match(finished, /class="generated-landmark"/);
  assert.equal(finished.match(/data-landform="[^"]+"/)[0], first.match(/data-landform="[^"]+"/)[0]);
  assert.doesNotMatch(renderIsland({ ...island, topic: 'Photography', landmark: 'camera' }, 1, original), /generated-landmark/);
});

test('unsafe or oversized drawings and unknown reuse references are ignored', () => {
  const library = [];
  for (const path of [
    { d: 'M 0 0 L 64 64" onload="alert(1)', colour: 'cream' },
    { d: 'M 0 0 L 65 64', colour: 'cream' },
    { d: 'M 0 0 L 64 64', colour: 'url(https://example.com)' },
  ]) {
    const suggestion = { ...drawing, paths: [path] };
    assert.equal(storeGeneratedIcon(library, 'Bookbinding', suggestion, []), library);
    assert.equal(renderGeneratedIcon(suggestion), '');
  }
  assert.equal(storeGeneratedIcon(library, 'Bookbinding', { reuse: 4 }, []), library);
});

test('icon generation describes the topic and available icons without starting a model download', async () => {
  const library = storeGeneratedIcon([], 'Bookbinding', drawing, []);
  const island = { topic: 'Handbound notebooks', objective: 'Make a thread-bound planner' };
  let requests = 0;
  const model = {
    availability: async () => 'available',
    create: async () => ({
      async prompt(prompt, { responseConstraint }) {
        requests++;
        const { topic, existing } = JSON.parse(prompt.split('\n').at(-1));
        assert.equal(topic, island.topic);
        assert.equal(existing[0].family, 'Bookbinding');
        assert.ok(responseConstraint.properties.paths);
        return JSON.stringify({ reuse: 0, family: '', aliases: [], paths: [] });
      },
      destroy() {},
    }),
  };
  assert.equal((await generateIslandIcon(island, library, { model })).reuse, 0);
  assert.equal(requests, 1);
  assert.equal(await generateIslandIcon(island, [], {
    model: { availability: async () => 'downloadable', create: async () => { requests++; } },
  }), undefined);
  assert.equal(requests, 1);
});
