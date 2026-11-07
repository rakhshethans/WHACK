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
