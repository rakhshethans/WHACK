export function fitMapZoom(width, height, sceneWidth, sceneHeight) {
  return Math.min(1, width / sceneWidth, height / sceneHeight);
}

export function zoomAround(camera, requested, width, height, minimum = 0.7, anchor = { x: width / 2, y: height / 2 }) {
  const zoom = Math.min(1.8, Math.max(minimum, requested));
  const ratio = zoom / camera.zoom;
  return {
    zoom,
    left: (camera.left + anchor.x) * ratio - anchor.x,
    top: (camera.top + anchor.y) * ratio - anchor.y,
  };
}

export function connectMap(viewport, camera) {
  const scene = viewport.querySelector('.map-scene');
  const frame = viewport.closest('.map-frame');
  const mouseHelp = matchMedia('(any-pointer: fine)').matches;
  const overviewZoom = () => fitMapZoom(viewport.offsetWidth - 12, Math.max(1, viewport.offsetHeight - 116),
    scene.offsetWidth, scene.offsetHeight);
  const apply = () => {
    const minimum = overviewZoom();
    if (camera.overview || camera.zoom <= minimum) {
      Object.assign(camera, { overview: true, zoom: minimum, left: 0, top: 0 });
    }
    viewport.classList.toggle('is-overview', camera.overview);
    scene.style.zoom = camera.zoom;
    viewport.scrollTo(camera.left, camera.top);
    frame.querySelector('.map-pan-hint').textContent = mouseHelp ? 'Scroll to zoom · Drag to pan'
      : camera.overview ? 'Zoom in to explore' : 'Drag to pan';
    frame.querySelector('[data-zoom="in"]').disabled = camera.zoom >= 1.8;
    frame.querySelector('[data-zoom="out"]').disabled = camera.overview;
  };
  function changeZoom(multiplier, anchor) {
    const current = { zoom: camera.zoom, left: viewport.scrollLeft, top: viewport.scrollTop };
    if (camera.overview) {
      const viewBounds = viewport.getBoundingClientRect();
      const sceneBounds = scene.getBoundingClientRect();
      current.left = viewBounds.left - sceneBounds.left;
      current.top = viewBounds.top - sceneBounds.top;
    }
    Object.assign(camera, zoomAround(current, camera.zoom * multiplier,
      viewport.clientWidth, viewport.clientHeight, overviewZoom(), anchor), { overview: false });
    apply();
  }

  function onWheel(event) {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    if (!event.deltaY) return;
    const bounds = viewport.getBoundingClientRect();
    changeZoom(Math.exp(-event.deltaY * unit * 0.002), {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  apply();
  viewport.addEventListener('wheel', onWheel, { passive: false });
  viewport.addEventListener('scroll', () => {
    camera.left = viewport.scrollLeft;
    camera.top = viewport.scrollTop;
  });
  for (const button of frame.querySelectorAll('[data-zoom]')) {
    button.addEventListener('click', () => {
      const action = button.dataset.zoom;
      if (action === 'reset') {
        camera.overview = true;
        apply();
      } else {
        changeZoom(action === 'in' ? 1.25 : 0.8);
      }
    });
  }

  let drag;
  let dragged = false;
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    dragged = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop };
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    if (!dragged && Math.hypot(x, y) < 6) return;
    if (!dragged) {
      dragged = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-panning');
    }
    viewport.scrollTo(drag.left - x, drag.top - y);
  });
  function endDrag() {
    drag = undefined;
    viewport.classList.remove('is-panning');
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', () => { if (!dragged) endDrag(); });
  viewport.addEventListener('click', event => {
    if (dragged && event.detail) {
      dragged = false;
      event.stopPropagation();
    }
  }, true);

  const resize = new ResizeObserver(() => { if (camera.overview) apply(); });
  resize.observe(viewport);
  resize.observe(scene);
  return () => {
    resize.disconnect();
    viewport.removeEventListener('wheel', onWheel);
  };
}
