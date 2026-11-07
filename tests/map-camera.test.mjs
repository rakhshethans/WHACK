import assert from 'node:assert/strict';
import test from 'node:test';

test('map zoom keeps the point under the centre of the viewport and limits magnification', async () => {
  const { zoomAround } = await import('../src/map-camera.mjs');
  assert.deepEqual(zoomAround({ zoom: 1, left: 100, top: 50 }, 1.5, 400, 300),
    { zoom: 1.5, left: 250, top: 150 });
  assert.equal(zoomAround({ zoom: 1, left: 0, top: 0 }, 5, 400, 300).zoom, 1.8);
  assert.equal(zoomAround({ zoom: 1, left: 0, top: 0 }, 0.1, 400, 300).zoom, 0.7);
});
