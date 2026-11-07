const STAGES = [
  [0, 'Settlement'], [100, 'Village'], [250, 'Town'],
  [500, 'City'], [900, 'Metropolis'],
];

const GUITAR = {
  beginner: [
    ['Find your first chords', 'Tune the guitar and play clean G, C and D chords.'],
    ['Switch on the beat', 'Alternate G and C at a steady pace. Count four beats between each change.'],
    ['Play a complete verse', 'Choose a three-chord song and play one verse without stopping.'],
    ['Record your first song', 'Record one take and pick a specific transition to improve.'],
  ],
  intermediate: [
    ['Measure your chord changes', 'Play a four-chord loop to a metronome and note the least reliable transition.'],
    ['Build a new rhythm', 'Keep the same chord loop while switching between straight and syncopated strumming.'],
    ['Arrange a full song', 'Play a verse and chorus with a clear change in dynamics between them.'],
    ['Record an arrangement', 'Record one take and note a timing or dynamics improvement for your next session.'],
  ],
  advanced: [
    ['Set a performance baseline', 'Record a challenging passage and identify the hardest two bars.'],
    ['Isolate the weak bars', 'Loop the two bars at three tempos while keeping dynamics even.'],
    ['Vary the interpretation', 'Try two arrangements of the passage and compare their phrasing.'],
    ['Record a performance take', 'Record the whole piece or section and compare it with your baseline.'],
  ],
};

const GENERAL = [
  ['Establish a baseline', 'Try a simple activity and record what feels familiar and what needs practice.'],
  ['Practise one technique', 'Pick the weakest part of your first session and repeat it with one measurable target.'],
  ['Try a complete exercise', 'Apply the technique to one complete example and record how it went.'],
  ['Review your progress', 'Compare your latest attempt with your baseline and choose the next improvement.'],
];

const XP_AWARDS = [100, 150, 250, 400];

export function createWorld() {
  return { islands: [] };
}

export function getStage(xp) {
  const levelIndex = Math.max(0, STAGES.findLastIndex(([threshold]) => xp >= threshold));
  const [threshold, name] = STAGES[levelIndex];
  return { level: levelIndex + 1, name, threshold, nextThreshold: STAGES[levelIndex + 1]?.[0] ?? null };
}

function addIsland(world, island) {
  return { ...world, islands: [...world.islands, { ...island, id: 'island-' + (world.islands.length + 1), xp: 0 }] };
}

export function createIsland(world, { title, experience, minutes, objective, category }) {
  const name = title.trim();
  if (!name) return world;
  const isGuitar = String(category).toLowerCase() === 'guitar' || /\bguitar\b/i.test(name);
  const level = String(experience).toLowerCase();
  const templates = isGuitar && Object.hasOwn(GUITAR, level) ? GUITAR[level] : isGuitar ? GUITAR.beginner : GENERAL;
  const sessionMinutes = Math.min(120, Math.max(1, Math.round(Number(minutes)) || 15));
  const target = String(objective ?? '').trim();
  const goals = templates.map(([goalTitle, detail], index) => ({
    id: 'goal-' + (index + 1),
    title: goalTitle,
    description: index === templates.length - 1 && target ? detail + ' Your objective is “' + target + '”. Compare the result with that objective.' : detail,
    minutes: Math.min(sessionMinutes, 10 + index * 5),
    xp: XP_AWARDS[index],
    prerequisites: index ? ['goal-' + index] : [],
    completed: false,
  }));
  return addIsland(world, { title: name, category: isGuitar ? 'guitar' : category || 'general', goals });
}

export function completeGoal(world, islandId, goalId) {
  const island = world.islands.find(({ id }) => id === islandId);
  const goal = island?.goals.find(({ id }) => id === goalId);
  if (!goal || goal.completed || !goal.prerequisites.every(id => island.goals.some(other => other.id === id && other.completed))) {
    return world;
  }
  const updatedIsland = {
    ...island,
    xp: island.xp + goal.xp,
    goals: island.goals.map(other => other.id === goalId ? { ...other, completed: true } : other),
  };
  return { ...world, islands: world.islands.map(other => other.id === islandId ? updatedIsland : other) };
}

export function adoptIsland(world, source) {
  return addIsland(world, {
    title: source.title,
    category: source.category,
    attribution: source.attribution ?? source.owner ?? source.title,
    goals: source.goals.map(goal => ({ ...goal, prerequisites: [...goal.prerequisites], completed: false })),
  });
}
