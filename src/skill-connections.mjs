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

export function relatedSkill(island, islands) {
  if (island.xp < 100) return null;
  const from = island.category === 'custom' ? island.theme : island.category;
  if (!Object.hasOwn(ROUTES, from)) return null;
  const route = ROUTES[from];
  const destination = route.theme ?? route.category;
  const existing = islands.find(other => other.id !== island.id
    && (other.category === 'custom' ? other.theme : other.category) === destination);
  return { ...route, islandId: existing?.id };
}
