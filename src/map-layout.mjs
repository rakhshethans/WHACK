const EDGE = 10;
const GAP = 10;

function randomFor(id) {
  let seed = 2166136261;
  for (const character of id) seed = Math.imul(seed ^ character.codePointAt(0), 16777619);
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}

function separated(a, b) {
  return a.left + a.width + GAP <= b.left || b.left + b.width + GAP <= a.left
    || a.top + a.height + GAP <= b.top || b.top + b.height + GAP <= a.top;
}

export function layoutIslands(ids, width) {
  let height = width < 540 ? 280 : 374;
  const positions = [];
  const baseWidth = Math.min(230, width * (width < 540 ? 0.43 : 0.29));
  for (const [index, id] of ids.entries()) {
    const random = randomFor(id);
    const cardWidth = Math.floor(baseWidth * (0.9 + random() * 0.17));
    // Reserve the SVG aspect ratio, a two-line title and the level line.
    const cardHeight = Math.ceil(cardWidth * 296 / 525) + 62;
    const place = (x, y) => ({
      left: EDGE + Math.round(x * (width - 2 * EDGE - cardWidth)),
      top: Math.round(y),
      width: cardWidth,
      height: cardHeight,
    });
    const free = rect => positions.every(other => separated(rect, other));
    let rect;
    if (index < 2) {
      const x = index === 0 ? 0.08 + random() * 0.1 : 0.88 - random() * 0.1;
      rect = place(x, (index === 0 ? 0.15 : 0.65) * (height - cardHeight));
    }
    if (!rect || !free(rect)) {
      for (let attempt = 0; attempt < 120; attempt += 1) {
        // Look for an opening in the existing water before extending the map.
        const extraWater = attempt < 60 ? 0 : cardHeight;
        const candidate = place(random(), EDGE + random() * (height + extraWater - cardHeight - 2 * EDGE));
        if (free(candidate)) {
          rect = candidate;
          break;
        }
      }
      if (!rect || !free(rect)) rect = place(random(), height + GAP + random() * 18);
    }
    positions.push(rect);
    height = Math.max(height, rect.top + rect.height + EDGE);
  }
  return { height, positions };
}

export function layoutSeaRoutes(pairs, positions, width, height) {
  const anchors = positions.map(({ left, top, width }) => ({ x: left + width / 2, y: top + width * 0.41 }));
  const candidates = pairs.map(([from, to]) => {
    const start = anchors[from];
    const end = anchors[to];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return { from, to, start, end, dx, dy, distance: Math.hypot(dx, dy) };
  }).sort((a, b) => a.distance - b.distance);
  const counts = positions.map(() => 0);
  const routes = [];
  for (const { from, to, start, end, dx, dy, distance } of candidates) {
    if (counts[from] >= 2 || counts[to] >= 2) continue;
    const bend = Math.min(72, distance * 0.22);
    const obstacles = positions.filter((_, index) => index !== from && index !== to);
    // Try gentle curves first, then a wider arc if another island is in the way.
    for (const offset of [bend, -bend, distance * 0.6, -distance * 0.6]) {
      const control = (point, along) => ({
        x: Math.min(width, Math.max(0, point.x + dx * along - dy / distance * offset)),
        y: Math.min(height, Math.max(0, point.y + dy * along + dx / distance * offset)),
      });
      const a = control(start, 0.18);
      const b = control(end, -0.18);
      const intersects = obstacles.some(rect => {
        for (let step = 1; step < 24; step += 1) {
          const t = step / 24;
          const u = 1 - t;
          const px = u ** 3 * start.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t ** 3 * end.x;
          const py = u ** 3 * start.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t ** 3 * end.y;
          if (px > rect.left && px < rect.left + rect.width && py > rect.top && py < rect.top + rect.height) return true;
        }
        return false;
      });
      if (intersects) continue;
      routes.push({ from, to, path: `M${start.x} ${start.y} C${a.x.toFixed(1)} ${a.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)} ${end.x} ${end.y}` });
      counts[from] += 1;
      counts[to] += 1;
      break;
    }
  }
  return routes;
}
