const ROUTES = {
  guitar: {
    category: 'songwriting',
    name: 'Songwriting',
    objective: 'Write an original verse and chorus over a guitar progression',
    reason: 'Use chord changes and rhythm you already practise to build an original verse and chorus.',
  },
  songwriting: {
    category: 'guitar',
    name: 'Guitar',
    objective: 'Accompany one of my own songs on guitar',
    reason: 'Turn a song you have written into something you can accompany and perform.',
  },
  photography: {
    category: 'custom',
    topic: 'Visual storytelling',
    theme: 'visual',
    name: 'Visual storytelling',
    objective: 'Tell a short story with a sequence of photographs',
    reason: 'Build on framing and composition by giving each photograph a role in a sequence.',
  },
  people: {
    category: 'custom',
    topic: 'Public speaking',
    theme: 'speaking',
    name: 'Public speaking',
    objective: 'Give a short talk about an interest of mine to a small group',
    reason: 'Build on starting conversations by sharing a short, prepared story with a small group.',
  },
  language: {
    category: 'custom',
    topic: 'Meeting new people',
    theme: 'people',
    name: 'Meeting new people',
    objective: 'Meet people through a language exchange',
    reason: 'Use the short exchanges you practise to start a conversation at a language exchange.',
  },
  speaking: {
    category: 'custom',
    topic: 'Meeting new people',
    theme: 'people',
    name: 'Meeting new people',
    objective: 'Start a conversation after a talk or group activity',
    reason: 'Use the confidence you build speaking to a group to start individual conversations afterwards.',
  },
  visual: {
    category: 'photography',
    name: 'Photography',
    objective: 'Make a themed photo series with a clear narrative',
    reason: 'Use the story structure you practise to decide what to shoot, keep and sequence.',
  },
};

function skillKey(island) {
  return island.category === 'custom' ? island.theme : island.category;
}

function routeFor(key) {
  return Object.hasOwn(ROUTES, key) ? ROUTES[key] : undefined;
}

function destinationFor(route) {
  return route?.theme ?? route?.category;
}

export function relatedSkill(island, islands) {
  const route = routeFor(skillKey(island));
  if (island.xp < 100 || !route) return null;
  const existing = islands.find(other => other.id !== island.id && skillKey(other) === destinationFor(route));
  return { ...route, islandId: existing?.id };
}

export function relatedIslandPairs(islands) {
  const skills = islands.map(skillKey);
  const destinations = skills.map(key => destinationFor(routeFor(key)));
  const pairs = [];
  for (let from = 0; from < skills.length; from += 1) {
    for (let to = from + 1; to < skills.length; to += 1) {
      if ((destinations[from] && destinations[from] === skills[to])
          || (destinations[to] && destinations[to] === skills[from])) pairs.push([from, to]);
    }
  }
  return pairs;
}
