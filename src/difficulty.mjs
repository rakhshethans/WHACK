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
  const track = island.category === 'custom' ? island.theme : island.category;
  const guitarMatch = track === 'guitar'
    && GUITAR_COACHING.find(item => item.match.test(goal.title + ' ' + goal.description));
  const coaching = guitarMatch || (Object.hasOwn(COACHING, track) ? COACHING[track] : DEFAULT_COACHING);
  return { ...goal, practiceAdjustment: coaching[island.difficulty] };
}

const SOCIAL_NEXT = [
  {
    match: /opening|introduc/i,
    support: ['Prepare one opener', 'Think of one person you could greet in a familiar setting. Practise one short opening about the activity.', 'Say your opening naturally twice without reading it.'],
    stretch: ['Try two kinds of opener', 'Practise an opening about the activity and another that asks an open question.', 'Say both aloud and choose one to use at your next visit.'],
  },
  {
    match: /say hello|follow.up question|short exchange/i,
    support: ['Have one brief exchange in a familiar setting', 'Choose a setting you already know and greet one person. Ask a simple question about the shared activity, such as how long they have been coming.', 'Have one brief exchange. Note a question you could ask next time.'],
    stretch: ['Ask a follow-up that fits the conversation', 'Greet someone in a shared setting. Listen for one detail and ask a natural follow-up about it.', 'Have one exchange where your second question builds on what they said.'],
  },
  {
    match: /return|routine|visit/i,
    support: ['Make one familiar return visit', 'Choose the same activity and one time you can go back. If you recognise someone, start with a brief hello.', 'Return once and note one thing that made the visit easier.'],
    stretch: ['Reconnect and meet someone else', 'Return to the same activity, greet someone you recognise and have a brief exchange with a different person if the opportunity comes up.', 'Have one familiar and one new exchange, with space for either person to leave.'],
  },
  {
    match: /suggest|follow.up|review|invitation/i,
    support: ['Follow up about one shared interest', 'Choose a detail you both discussed. When it feels welcome, bring it up in a short conversation next time you meet.', 'Make one low-pressure follow-up attempt and respect their response.'],
    stretch: ['Offer a specific low-pressure invitation', 'If the conversation feels mutual, suggest a concrete activity you both mentioned. Leave an easy way to decline.', 'Make one clear invitation and note how you could phrase it more naturally next time.'],
  },
];

const NEXT_PRACTICE = {
  language: {
    support: ['Rehearse one line of the exchange', 'Pick the hardest line from this goal. Listen to an example, repeat it slowly, then say it in response to one likely prompt.', 'Say the line from memory and recognise one likely reply.'],
    stretch: ['Try an unscripted variation', 'Use this goal in a short exchange with a changed time, place, person or request. Rehearse once without writing down the full reply.', 'Respond to one changed detail without reading a script.'],
  },
  board: {
    support: ['Practise one board position', 'Choose a simpler position that isolates the decision in this goal. Name what could happen after two possible moves.', 'Explain the stronger move and its likely reply before playing it.'],
    stretch: ['Compare two unfamiliar positions', 'Apply the decision from this goal to two new positions. Predict your opponent’s response before checking.', 'Explain one decision in each position and identify what changed between them.'],
  },
  speaking: {
    support: ['Rehearse one short part of your talk', 'Choose the opening or one main point from this goal. Say it into a recorder before adding another part.', 'Give a clear 30-second version with one point a listener could remember.'],
    stretch: ['Adapt your talk for a different listener', 'Try this goal twice. On the second take, change one explanation for a listener who is new to your topic.', 'Compare the recordings and identify one change that made the point clearer.'],
  },
  visual: {
    support: ['Work with two frames first', 'Take the part of the story this goal focuses on. Use two existing frames or make two new ones with a single difference.', 'Put the two frames in order and explain what the second adds.'],
    stretch: ['Make a second edit of the sequence', 'Apply this goal, then try a second framing or ordering choice and compare how it changes the story.', 'Choose one version and explain what a viewer learns from it.'],
  },
};

export function guidedNextGoal({ topic, theme, feedback, plannedGoal }) {
  const social = theme === 'people' && SOCIAL_NEXT.find(item => item.match.test(plannedGoal.title));
  const track = social || (Object.hasOwn(NEXT_PRACTICE, theme) && NEXT_PRACTICE[theme]);
  const variant = track && track[feedback];
  if (variant) {
    const [title, description, finish] = variant;
    return { title, description: plannedGoal.title === title ? description : description + ' This builds toward “' + plannedGoal.title + '”.', finish };
  }

  if (feedback === 'support') {
    return {
      title: 'Practise a smaller part of ' + topic,
      description: 'For “' + plannedGoal.title + '”, choose just the first action and try it with a simpler example or fewer materials. ' + plannedGoal.description,
      finish: 'Show or record one attempt at that action and name the next small step toward this goal.',
    };
  }
  return {
    title: 'Try ' + topic + ' in a new situation',
    description: 'Take “' + plannedGoal.title + '” into a fresh example with one changed constraint, such as a new topic, tool or setting. ' + plannedGoal.description,
    finish: 'Complete the original goal in the new example and name one adjustment you made to make it work.',
  };
}
