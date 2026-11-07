export const DIFFICULTIES = [
  { value: 'support', label: 'Too hard' },
  { value: 'standard', label: 'About right' },
  { value: 'stretch', label: 'Too easy' },
];

const GUITAR_COACHING = [
  {
    match: /\b(sing|singing|vocals?|humming)\b/i,
    support: 'Play just one chord change. Hum over it first, then try one line while keeping the strumming hand moving.',
    stretch: 'Record the section twice. On the second take, vary the vocal dynamics without disturbing the guitar pulse.',
  },
  {
    match: /\b(live loop|loop pedal|overdub|layers?)\b/i,
    support: 'Rehearse starting and stopping a single four-bar layer before adding anything over it.',
    stretch: 'Practise dropping one layer and bringing it back in on beat one without stopping the underlying loop.',
  },
  {
    match: /\b(chord changes?|chord transitions?|weakest change|clean chords)\b/i,
    support: 'Isolate one change, such as G to C if those are your chords. Start at 45 bpm and make the switch every four beats.',
    stretch: 'Alternate the same chords every two beats at your clean tempo, then return to the original exercise and record a take.',
  },
  {
    match: /\b(verse|chorus|bars?|riff|phrase|passage)\b/i,
    support: 'Take the hardest two bars and play them slowly twice without stopping. Add the bars immediately before and after once the join is clean.',
    stretch: 'Play the section twice with different dynamics while keeping the same pulse, then compare your recordings.',
  },
];

const COACHING = {
  guitar: {
    support: 'Practise the shortest section that gives you trouble at a tempo where you can stay relaxed. Connect it to the surrounding part afterwards.',
    stretch: 'Record a take with a second tempo or feel, then return to the original and see what improved.',
  },
  songwriting: {
    support: 'Limit the draft to one musical idea and four lines. Save a rough version before polishing or adding another section.',
    stretch: 'Write a second version with a different rhythm or point of view, then choose the one that communicates the idea more clearly.',
  },
  photography: {
    support: 'Keep the subject and location fixed. Change only one factor, such as angle or distance, and compare two frames.',
    stretch: 'Make a second frame with a deliberately contrasting light or composition. Explain which one serves your intention better.',
  },
  people: {
    support: 'Rehearse one short opening first. If the goal involves a conversation, start in a familiar setting and keep the first exchange brief.',
    stretch: 'Ask one genuine follow-up based on what the other person said. Let them decide whether to continue the conversation.',
  },
  speaking: {
    support: 'Rehearse only your opening and one point. Use a short recording to get comfortable before trying the full version.',
    stretch: 'Deliver a second take with a different opening, then compare which version makes the main point easier to follow.',
  },
  language: {
    support: 'Practise one phrase aloud and rehearse one likely reply. Add the rest of the exchange once both are familiar.',
    stretch: 'Try the exchange with a changed detail and respond without reading the first version.',
  },
  board: {
    support: 'Use one practice position with fewer pieces. Name the possible replies before choosing a move.',
    stretch: 'Compare two candidate moves without moving the pieces. State the likely reply to each before checking.',
  },
};

const DEFAULT_COACHING = {
  support: 'Choose the smallest concrete part of this task. Practise it on a simpler example, then try the full task when you are ready.',
  stretch: 'Try the same task in a second situation with one changed constraint. Compare the results before moving on.',
};

export function coachGoal(goal, island) {
  if (!goal || (island.difficulty !== 'support' && island.difficulty !== 'stretch')) return goal;
  const guitarMatch = island.category === 'guitar'
    && GUITAR_COACHING.find(item => item.match.test(goal.title + ' ' + goal.description));
  const track = island.category === 'custom' ? island.theme : island.category;
  const coaching = guitarMatch || (Object.hasOwn(COACHING, track) ? COACHING[track] : DEFAULT_COACHING);
  return { ...goal, practiceAdjustment: coaching[island.difficulty] };
}
