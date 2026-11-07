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
  let panArea = scene.parentElement;
  if (panArea === viewport) {
    panArea = document.createElement('div');
    panArea.className = 'map-pan-area';
    scene.replaceWith(panArea);
    panArea.append(scene);
  }
  const frame = viewport.closest('.map-frame');
  const mouseHelp = matchMedia('(any-pointer: fine)').matches;
  let insetX = 0;
  let insetY = 0;
  const overviewZoom = () => fitMapZoom(viewport.offsetWidth - 12, Math.max(1, viewport.offsetHeight - 116),
    scene.offsetWidth, scene.offsetHeight);
  const apply = () => {
    const minimum = overviewZoom();
    if (camera.overview) {
      Object.assign(camera, { overview: true, zoom: minimum, left: 0, top: 0 });
    } else {
      camera.zoom = Math.max(camera.zoom, minimum);
    }
    insetX = camera.overview ? 0 : Math.round(viewport.clientWidth * 0.6);
    insetY = camera.overview ? 0 : Math.round(viewport.clientHeight * 0.6);
    panArea.style.padding = `${insetY}px ${insetX}px`;
    viewport.classList.toggle('is-overview', camera.overview);
    scene.style.zoom = camera.zoom;
    viewport.scrollTo(camera.left + insetX, camera.top + insetY);
    frame.querySelector('.map-pan-hint').textContent = mouseHelp ? 'Scroll to zoom · Drag to pan'
      : camera.overview ? 'Zoom in to explore' : 'Drag to pan';
    frame.querySelector('[data-zoom="in"]').disabled = camera.zoom >= 1.8;
    frame.querySelector('[data-zoom="out"]').disabled = camera.overview;
  };
  function readPosition() {
    if (camera.overview) {
      const viewBounds = viewport.getBoundingClientRect();
      const sceneBounds = scene.getBoundingClientRect();
      return { left: viewBounds.left - sceneBounds.left, top: viewBounds.top - sceneBounds.top };
    }
    return { left: viewport.scrollLeft - insetX, top: viewport.scrollTop - insetY };
  }

  function changeZoom(multiplier, anchor) {
    const minimum = overviewZoom();
    const current = { zoom: camera.zoom, ...readPosition() };
    const next = zoomAround(current, camera.zoom * multiplier,
      viewport.clientWidth, viewport.clientHeight, minimum, anchor);
    Object.assign(camera, next, { overview: next.zoom <= minimum });
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
  function savePosition() {
    if (!camera.overview) Object.assign(camera, readPosition());
  }
  viewport.addEventListener('scroll', savePosition);
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
      if (camera.overview) {
        Object.assign(camera, readPosition(), { overview: false });
        apply();
        drag.left = viewport.scrollLeft;
        drag.top = viewport.scrollTop;
      }
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

  const resize = new ResizeObserver(apply);
  resize.observe(viewport);
  resize.observe(scene);
  return () => {
    savePosition();
    resize.disconnect();
    viewport.removeEventListener('wheel', onWheel);
    viewport.removeEventListener('scroll', savePosition);
  };
}
