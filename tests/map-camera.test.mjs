import assert from 'node:assert/strict';
import test from 'node:test';

test('the overview fits the whole scene on a phone and a short desktop', async () => {
  const { fitMapZoom, zoomAround } = await import('../src/map-camera.mjs');
  assert.equal(fitMapZoom(360, 600, 720, 800), 0.5);
  assert.equal(fitMapZoom(1200, 480, 1380, 800), 0.6);
  assert.equal(fitMapZoom(1200, 900, 720, 800), 1);
  assert.equal(zoomAround({ zoom: 0.6, left: 0, top: 0 }, 0.3, 360, 600, 0.5).zoom, 0.5);
});

test('map zoom keeps the point under the centre of the viewport and limits magnification', async () => {
  const { zoomAround } = await import('../src/map-camera.mjs');
  assert.deepEqual(zoomAround({ zoom: 1, left: 100, top: 50 }, 1.5, 400, 300),
    { zoom: 1.5, left: 250, top: 150 });
  assert.equal(zoomAround({ zoom: 1, left: 0, top: 0 }, 5, 400, 300).zoom, 1.8);
  assert.equal(zoomAround({ zoom: 1, left: 0, top: 0 }, 0.1, 400, 300).zoom, 0.7);
});
