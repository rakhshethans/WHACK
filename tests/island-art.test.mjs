import assert from 'node:assert/strict';
import test from 'node:test';
import { knownLandmark } from '../src/island-art.mjs';
import { renderIsland } from '../src/scene.mjs';

test('the expanded themes match common skills and draw a distinct symbol for each theme', () => {
  const examples = {
    football: 'Futsal', basketball: 'Free throws', racket: 'Learn pickleball', golf: 'Golf swing',
    'bat-sports': 'Baseball', volleyball: 'Beach volleyball', cycling: 'Mountain biking', climbing: 'Bouldering',
    outdoors: 'Orienteering', 'snow-sports': 'Snowboarding', 'water-sports': 'Kayaking', 'martial-arts': 'Jiu-jitsu',
    skating: 'Skateboarding', mobility: 'Pilates', audio: 'Music production', baking: 'Sourdough',
    coffee: 'Latte art', calligraphy: 'Hand lettering', repair: 'Welding', electronics: 'Arduino',
    design: 'Learn Figma', maths: 'Algebra', science: 'Chemistry', astronomy: 'Stargazing',
    finance: 'Personal budgeting', business: 'Leadership', organisation: 'Time management',
    travel: 'Travel planning', animals: 'Dog training', beauty: 'Nail art', magic: 'Sleight of hand',
  };
  const symbols = new Set();
  for (const [landmark, topic] of Object.entries(examples)) {
    const art = renderIsland({ id: 'test', category: 'custom', topic, landmark: 'compass' }, 1);
    assert.equal(knownLandmark({ topic }), landmark);
    assert.ok(art.includes(`data-landmark="${landmark}"`));
    const symbol = art.match(/stroke-linejoin="round">\s+([\s\S]+?)\s+<\/g>/)?.[1];
    assert.match(symbol ?? '', /<(?:path|circle|ellipse|rect)\b/);
    assert.ok(!symbols.has(symbol), `${landmark} should have its own drawing`);
    symbols.add(symbol);
  }
});

test('related skills share a theme and specific topics take precedence over the objective', () => {
  assert.equal(knownLandmark({ topic: 'Play badminton' }), knownLandmark({ topic: 'Learn tennis' }));
  assert.equal(knownLandmark({ topic: 'Learn piano', objective: 'Record a podcast' }), 'piano');
  assert.equal(knownLandmark({ topic: 'Spanish guitar' }), 'guitar');
  assert.equal(knownLandmark({ topic: 'Polish my chess opening' }), 'chess');
  assert.equal(knownLandmark({ topic: 'Learn Polish' }), 'language');
});

test('unmatched skills use initials even when a saved island has an older landmark', () => {
  const island = { id: 'island-1', category: 'custom', topic: 'Getting better at bookbinding', landmark: 'book' };
  const art = renderIsland(island, 1);
  assert.match(art, /data-landmark="compass"/);
  assert.match(art, /class="topic-seal"/);
  assert.match(art, />BO<\/text>/);
  assert.equal(renderIsland(JSON.parse(JSON.stringify(island)), 1), art);
  assert.match(renderIsland({ ...island, landmark: undefined, theme: 'guitar' }, 1), /class="topic-seal"/);
});
