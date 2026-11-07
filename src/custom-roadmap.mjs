import { buildRoadmap, nextPractice } from './roadmaps.mjs';

const AUTHORED_TRACKS = [
  { theme: 'guitar', matches: /\bguitar(?:ist)?\b/i, authored: true },
  { theme: 'songwriting', matches: /\b(songwriting|write (?:an? |my own )?(?:original )?songs?)\b/i, authored: true },
  { theme: 'photography', matches: /\b(photograph(?:y|er|s)?|photos?|portraits?|headshots?)\b/i, authored: true },
];

const ORIGAMI = {
  theme: 'origami',
  matches: /\b(origami|paper folding|fold(?:ing)? (?:a )?paper (?:cranes?|models?))\b/i,
  checkpoint: 'Fold a complete paper model with aligned edges and repeat its trickiest fold from memory.',
  steps: [
    ['Fold an accurate Origami base', 'Make a diagonal crease on a square sheet, then fold both edges to meet it in a kite base.', 'The two corners meet and the kite lies flat without an overlapping edge.'],
    ['Collapse a square base', 'Precrease both diagonals and both midlines. Bring the corners together to collapse the sheet.', 'Make one flat square base with four even flaps.'],
    ['Raise a flap with a petal fold', 'On one face of your square base, crease the sides toward the centre. Open the flap and lift its tip along those creases.', 'The lifted flap lies flat in a narrow diamond with its edges on the centreline.'],
    ['Turn a point with a reverse fold', 'Use a scrap paper flap to practise reversing a crease so the tip tucks neatly inside.', 'Turn the tip twice without tearing the paper or leaving it twisted.'],
    ['Fold a crane’s head and tail', 'Make a bird base using two petal folds. Practise reversing the two narrow points upward, then tip one over to form the head.', 'The head and tail point in opposite directions and the base stays closed.'],
    ['Fix one uneven fold', 'Put your model next to the diagram. Unfold to the first crease that caused the sides to drift and make it again.', 'The corrected edges line up more closely than in your first model.'],
    ['Fold a model from the diagram', 'Choose the paper model you want to make. Mark the base and the hardest fold in the diagram before working through it.', 'Finish the model and point out the crease that needed most care.'],
    ['Repeat the trickiest part unaided', 'Take a fresh sheet and fold up to the hardest step in your model without watching a video. Check the diagram afterwards.', 'The result matches the diagram up to that step and lies flat where it should.'],
  ],
  experiencedStart: {
    intermediate: ['Check your square base', 'Collapse a square base from memory. Compare the layers with a diagram and redo the first crease that drifted.', 'All four flaps line up without having to force the base flat.'],
    advanced: ['Sharpen an inside reverse fold', 'On two narrow flaps, make the same inside reverse fold at different angles. Check where the paper starts to buckle.', 'Both tips hold their angle with a clean point and flat layers.'],
  },
  practice: ['Fold a model with a new crease', 'Choose a model with one unfamiliar fold. Practise that fold on scrap paper before attempting the full model.', 'Finish the model and recreate the unfamiliar fold on a second sheet.'],
};

const SPANISH_TRAVEL = {
  theme: 'language',
  matches: /\bspanish\b/i,
  checkpoint: 'Handle a short travel exchange in Spanish, including one follow-up question or clarification.',
  steps: [
    ['Ask for a station in Spanish', 'Use a map to practise “¿Dónde está la estación?”. Learn to recognise “a la izquierda” and “a la derecha”.', 'Ask from memory and point left or right correctly for two shuffled replies.'],
    ['Buy a ticket for a chosen time', 'Use a real or sample timetable. Say “Un billete a …, por favor” and ask “¿A qué hora sale?”.', 'Say the destination and pick the correct departure after hearing a time.'],
    ['Order a drink and ask the price', 'Pick a drink from a Spanish menu. Say “Quisiera …” and ask “¿Cuánto cuesta?”.', 'Make the request without reading it and match one spoken price to the menu.'],
    ['Ask for a room at check-in', 'Practise “Tengo una reserva a nombre de …” and ask “¿A qué hora es la salida?”.', 'Give the reservation name and write down the checkout time you hear.'],
    ['Recover when someone speaks quickly', 'Record or find a short direction or price. Ask “¿Puede repetirlo más despacio?” and replay it once.', 'Use the repair phrase from memory and identify the missed detail on replay.'],
    ['Handle a changed train platform', 'Shuffle two platform numbers and two times. Say “¿De qué andén sale?” and use a random reply.', 'Identify the correct platform and time in two short rehearsals.'],
    ['Rehearse the exchange your trip needs', 'Pick a stop on your itinerary. Rehearse its opening request, a likely reply and one follow-up in Spanish.', 'Complete three turns using keywords only and identify the information you needed.'],
    ['Run a short travel role-play', 'Shuffle a ticket desk, café and check-in prompt. Give your opening and react to one changed detail.', 'Finish two exchanges in Spanish and use a clarification phrase when needed.'],
  ],
  experiencedStart: {
    intermediate: ['Follow Spanish directions on a map', 'Rehearse “¿Cómo llego a la estación?” and listen for “siga recto” and one turn.', 'Trace the route on the map without reading the directions.'],
    advanced: ['Ask about a missed connection', 'Use a timetable to explain “He perdido el tren”. Ask about the next departure and whether the same ticket is valid.', 'Summarise both answers aloud in Spanish after one unscripted rehearsal.'],
  },
  practice: ['Handle a new Spanish travel situation', 'Try a changed reservation, a menu substitution or a delayed bus. Ask one precise follow-up about the change.', 'Complete the exchange and identify the new time, price or option you were offered.'],
};

const SPANISH_MEAL_START = {
  beginner: ['Order one main dish in Spanish', 'Pick a dish from a Spanish menu. Practise “Quisiera …, por favor” and answer “¿Para beber?” with a drink choice.', 'Name your dish and drink from memory using a polite request.'],
  intermediate: ['Ask what comes with your meal', 'Use a Spanish menu to order one dish and ask “¿Con qué viene?”. Rehearse two possible replies about the sides.', 'Order the dish and correctly identify the side in both replies.'],
  advanced: ['Ask for a substitution in Spanish', 'Pick a main dish and ask “¿Podría cambiar … por …?”. Rehearse an unavailable option and offer a second choice without switching languages.', 'Complete the order and repeat back the dish and the agreed side in Spanish.'],
};

const PROFILES = [
  ORIGAMI,
  {
    theme: 'people', matches: /\b(meet(?:ing)? (?:(?:new|more) )?people|friends?|friendships?|sociali[sz]\w*|networking|social confidence|connections)\b/i,
    checkpoint: 'Have a follow-up conversation with someone you met through a setting you can return to.',
    steps: [
      ['Find a low-pressure place to meet people', 'Choose one recurring setting built around something you already enjoy, such as a class, hobby group or volunteering session.', 'Pick one specific session and save when and where it happens.'],
      ['Prepare a natural opening', 'Write two questions about the activity itself and practise a short introduction you would actually say.', 'Say the introduction and both questions aloud without reading them.'],
      ['Say hello to one new person', 'Attend the setting you chose. Say hello or ask someone a question about what brought them there.', 'Have one short exchange and remember one detail about what they said.'],
      ['Ask a follow-up question', 'Start a conversation about the shared activity and use one detail from the reply to ask a follow-up.', 'Have one exchange that goes beyond the first question.'],
      ['Return to the same setting', 'Go back to the group or activity. If you recognise someone, greet them and mention something you talked about.', 'Have one second conversation with a person you met there.'],
      ['Suggest a small next step', 'If the conversation feels mutual, suggest joining the same activity again or continuing a topic you both enjoyed.', 'Make one low-pressure invitation, then respect their answer.'],
      ['Build a regular social routine', 'Put a second or third visit in your calendar. Try a different conversation opener when you go.', 'Attend again and start one conversation without relying on a prepared script.'],
      ['Follow up and review', 'When it feels welcome, follow up about the shared activity. Think about which setting made conversation easiest.', 'Have one follow-up exchange and choose a setting you would like to keep returning to.'],
    ],
    practice: ['Start a conversation in a new setting', 'Choose a different recurring activity connected to one of your interests. Ask one person an open question about the activity.', 'Have one exchange with a follow-up question.'],
    experiencedStart: {
      intermediate: ['Reconnect through a shared interest', 'Choose a group you can revisit and one detail to bring up with someone you already greeted.', 'Attend once and start a follow-up on that detail if the opportunity comes up.'],
      advanced: ['Make a group introduction', 'At a recurring activity, look for two willing people with a shared interest and introduce them using that detail.', 'Make one introduction or rehearse it aloud using two plausible interests.'],
    },
  },
  {
    theme: 'board', matches: /\b(chess|checkers|shogi)\b/i,
    checkpoint: 'Play a full practice game and explain one decision you would change.',
    steps: [
      ['Review the rules of your game', 'Set up the board. Play a short practice position and check each move against the rules.', 'Play or explain five legal moves and how the game ends.'],
      ['Practise a basic tactic', 'Choose one short puzzle for your game. Name the threat before moving a piece.', 'Solve three positions and explain your best move in each.'],
      ['Check your opponent’s reply', 'Before each move in a practice position, name what your opponent could do next.', 'Make five choices and state the strongest reply you can see.'],
      ['Play a practice game', 'Play a short game against a friend or a practice opponent. Save the moves or note the turning points.', 'Finish the game and pick one position worth revisiting.'],
      ['Rework a turning point', 'Return to the position you noted and compare two candidate moves.', 'Explain one concrete improvement and the likely reply.'],
      ['Drill the mistake you found', 'Find three positions with the same decision pattern and work through them separately.', 'Solve two without repeating the mistake.'],
      ['Apply the drill in a second game', 'Play again with your revised decision process in mind.', 'Identify one move where your review changed what you played.'],
      ['Compare your two games', 'Compare the decision you improved with a remaining weakness.', 'Record one improvement and choose the next tactic or game situation to practise.'],
    ],
    practice: ['Play and annotate a fresh game', 'Pick one theme to watch for before starting. Save a turning point and compare two legal replies afterwards.', 'Explain one better move and its likely consequence.'],
  },
  {
    theme: 'language', matches: /\b(language|spanish|french|tamil|japanese|mandarin|german|italian|korean|portuguese|arabic|hindi)\b/i,
    checkpoint: 'Complete a short conversation in a situation connected to your objective.',
    steps: [
      ['Choose one real conversation', 'Pick a specific situation relevant to your objective. Look up three phrases you would use in it and listen to their pronunciation.', 'Say the three phrases from memory and explain when you would use each one.'],
      ['Practise a likely reply', 'Find two likely replies to one of your phrases. Listen to a spoken example and say each reply back.', 'Recognise both replies and respond appropriately to one.'],
      ['Build a short dialogue', 'Write or record an opening, a question and a closing for your chosen situation.', 'Say the full dialogue at a steady pace using only keywords as prompts.'],
      ['Vary the details', 'Repeat the dialogue with a different place, person, time or request.', 'Swap the details without reverting to a word-for-word script.'],
      ['Practise asking for clarification', 'Learn how to ask someone to repeat or explain something. Use the phrase during a rehearsal.', 'Recover from one unfamiliar response without ending the conversation.'],
      ['Try an unscripted exchange', 'Ask a partner to vary their reply, or rehearse with shuffled reply prompts.', 'Understand the gist and answer three turns without a full script.'],
      ['Review what stopped you', 'Listen back or write down where you hesitated. Look up one missing phrase and practise it in context.', 'Use the phrase correctly in two new sentences.'],
      ['Repeat with a fresh prompt', 'Have another short exchange in the same situation with a new prompt.', 'Complete the exchange and describe one improvement you can hear.'],
    ],
    practice: ['Handle a new conversation scenario', 'Choose a different scenario relevant to your objective and rehearse a likely misunderstanding and recovery.', 'Complete a short exchange using at least one phrase you had not used before.'],
    experiencedStart: {
      intermediate: ['Rehearse a realistic reply', 'Pick a situation you expect to face. Record your opening request and two different replies in your target language.', 'Answer both replies with an appropriate follow-up without reading a script.'],
      advanced: ['Recover from an unexpected reply', 'Listen to a short authentic exchange about your objective. Pause before the last reply and record your own answer.', 'Listen to the original reply and explain what your answer handled or missed.'],
    },
  },
  {
    theme: 'speaking', matches: /\b(public speaking|speak(?:ing)? in public|give a (short )?(talk|speech|presentation)|present to a group)\b/i,
    checkpoint: 'Deliver a clear two-minute talk with one main point to a listener or in a recording.',
    steps: [
      ['Choose one point to share', 'Pick a topic you know and write one sentence you want the listener to remember.', 'Say your main point aloud in one sentence.'],
      ['Outline a short talk', 'Write an opening, a concrete example and a closing line that returns to your point.', 'Describe the talk using those three prompts without reading a script.'],
      ['Record a one-minute version', 'Talk through your prompts into a recorder. Listen for the clearest sentence and the fastest section.', 'Keep one complete take and mark a place where a pause would help.'],
      ['Practise a deliberate pause', 'Repeat your talk and pause immediately before your main point.', 'Record a take where the pause makes the point easier to hear.'],
      ['Improve your example', 'Replace a vague part of the talk with a concrete detail or short story.', 'Say the revised section aloud and explain what the detail clarifies.'],
      ['Give a short talk to a listener', 'Ask a willing listener to hear the talk, or make a complete recording for review.', 'Deliver a complete take and check which point the listener or recording makes clearest.'],
      ['Answer one likely question', 'Write one question a listener might ask. Practise answering it in two or three sentences.', 'Give the answer clearly without repeating the entire talk.'],
      ['Deliver the revised talk', 'Use the feedback to improve one part and deliver the full talk again.', 'Compare the two versions and identify a concrete improvement.'],
    ],
    practice: ['Talk to a different audience', 'Choose a listener who knows less or more about the topic and adapt your example for them.', 'Deliver a short talk that keeps the same main point with a different explanation.'],
    experiencedStart: {
      intermediate: ['Test two openings for your talk', 'Record the first 30 seconds twice. Open with a specific example in one take and a question in the other.', 'Choose the take that sets up your main point most clearly.'],
      advanced: ['Trim a talk for a shorter slot', 'Record a two-minute talk for your intended audience. Cut one tangent while keeping the example that supports your point.', 'Deliver the revised version in 90 seconds with a clear opening, example and closing.'],
    },
  },
  {
    theme: 'visual', matches: /\b(visual storytelling|photo story|photo essay|sequence of photographs)\b/i,
    checkpoint: 'Build a five-image story whose opening, development and ending are easy to follow.',
    steps: [
      ['Define the story in one sentence', 'Choose a small scene, change or action and write what you want a viewer to notice.', 'Save one sentence that describes a visible change or event.'],
      ['Plan five roles for the images', 'Sketch a list with an opening, two developments, a turning point and a closing image.', 'Explain the job of each planned frame in a few words.'],
      ['Make an establishing image', 'Choose a frame that shows the setting or subject clearly without showing every detail.', 'Select one image that gives a viewer enough context to begin.'],
      ['Capture a useful detail', 'Make a close frame that gives the viewer information missing from the opening.', 'Explain what the detail adds in one sentence.'],
      ['Find the turning-point image', 'Look for the moment where the scene, action or viewer’s understanding changes.', 'Choose one frame that marks the change clearly.'],
      ['Arrange the five images', 'Put your images in order and try swapping two adjacent frames.', 'Choose the sequence where each image helps explain the next one.'],
      ['Test the sequence with a viewer', 'Show the images without a caption first. Ask what the viewer thinks happened.', 'Write down one point where their reading differed from yours.'],
      ['Revise the story', 'Replace, reorder or reshoot one frame to address that gap.', 'Show the five-image sequence and explain what is clearer after the revision.'],
    ],
    practice: ['Make another five-image story', 'Pick a subject that changes over time or moves through a place. Sketch the five image roles before shooting.', 'Produce a sequence with a recognisable beginning, change and ending.'],
  },
];

function fallbackProfile(topic = 'this skill', objective = topic, experience = 'beginner') {
  const cleanTopic = String(topic || 'this skill').trim();
  const cleanObjective = String(objective || cleanTopic).trim();
  const startStep = experience === 'advanced'
    ? [
      `Benchmark a full run of ${cleanTopic}`,
      `Complete one timed session working toward “${cleanObjective}” and note the exact moment where precision drops.`,
      'Finish one complete run and write down the single transition or technique that needs sharpening.',
    ]
    : experience === 'intermediate'
      ? [
        `Check your core technique in ${cleanTopic}`,
        `Run through a familiar exercise for “${cleanObjective}” at a steady pace and mark the first step that feels uneven.`,
        'Complete two clean repetitions and note the detail you adjusted between them.',
      ]
      : [
        `Set up your first ${cleanTopic} workspace`,
        `Prepare the essential tools or reference example for “${cleanObjective}” and complete one short introductory drill.`,
        'Finish two unhurried repetitions and check that your setup stays comfortable.',
      ];

  return {
    theme: 'compass',
    checkpoint: `Complete a self-checked milestone in ${cleanTopic} toward “${cleanObjective}”.`,
    steps: [
      startStep,
      [
        `Drill a single technique for ${cleanTopic}`,
        `Focus on one specific movement, phrase, or operation needed for “${cleanObjective}” at a slow, deliberate pace.`,
        'Complete three controlled repetitions in a row without rushing the transition.',
      ],
      [
        `Combine two steps in ${cleanTopic}`,
        `Link your opening drill with the next step required for “${cleanObjective}” in a short sequence.`,
        'Run the two-step sequence twice from start to finish without pausing in the middle.',
      ],
      [
        `Compare your ${cleanTopic} attempt against a reference`,
        `Place your work or recording next to a clear reference example for “${cleanObjective}” and spot one specific difference.`,
        'Name one concrete adjustment to test in your next session.',
      ],
      [
        `Apply that adjustment in ${cleanTopic}`,
        `Repeat the sequence for “${cleanObjective}” while focusing on the single improvement you identified.`,
        'Complete two takes where the corrected detail is clearly visible or audible.',
      ],
      [
        `Practise ${cleanTopic} under a time or material constraint`,
        `Run a short session toward “${cleanObjective}” with one realistic constraint, such as a steady timer or limited retries.`,
        'Finish the exercise within the constraint while keeping your core technique steady.',
      ],
      [
        `Build a complete draft for ${cleanObjective}`,
        `Put all the steps you have practised in ${cleanTopic} together into one end-to-end rehearsal of “${cleanObjective}”.`,
        'Complete the full rehearsal from beginning to end without restarting.',
      ],
      [
        `Polish and verify your ${cleanTopic} milestone`,
        `Repeat your end-to-end run of “${cleanObjective}” and compare it with your first session’s work.`,
        'Finish a clean final take and note the next technique you want to explore.',
      ],
    ],
    practice: [
      `Extend ${cleanTopic} to a new variation`,
      `Choose a fresh scenario connected to “${cleanObjective}” and apply your core sequence with one new detail.`,
      'Complete the variation cleanly and note what adapted well.',
    ],
  };
}

const TRACKS = [...PROFILES, ...AUTHORED_TRACKS];

function firstMatch(text) {
  let match;
  let first = Infinity;
  for (const track of TRACKS) {
    const index = String(text ?? '').search(track.matches);
    if (index !== -1 && index < first) {
      match = track;
      first = index;
    }
  }
  return match;
}

function customProfile({ topic, objective }) {
  const profile = firstMatch(topic) ?? firstMatch(objective);
  const context = topic + ' ' + objective;
  if (profile?.theme === 'language' && SPANISH_TRAVEL.matches.test(context)
      && /\b(travel|trip|holiday|abroad|visit|vacation|spain)\b/i.test(context)) return SPANISH_TRAVEL;
  return profile;
}

export function customArtworkTheme(input) {
  return customProfile(input)?.theme ?? 'compass';
}

export function buildCustomRoadmap(input) {
  const { topic, objective, experience, minutes } = input;
  const profile = customProfile(input) ?? fallbackProfile(topic, objective, experience);
  const { theme } = profile;
  if (profile.authored) {
    const { focus, checkpoint, next, steps } = buildRoadmap({ category: theme, objective: topic + ' ' + objective, experience });
    const tailored = [...steps];
    if (focus === 'Song accompaniment') {
      tailored[1] = ['Connect two chord changes in your song',
        'Pick one song you want to play. Find two chord changes from its verse and loop each one at a slow click. Practise one change per session if needed.',
        'Play both changes cleanly on beat one in three consecutive four-bar loops.'];
    }
    if (theme === 'photography' && minutes <= 10 && focus === 'Street photography' && experience === 'beginner') {
      tailored[0] = ['Find a strong frame nearby',
        'Use your phone or camera to frame one subject near you. Take two photos from different angles and keep the subject in the same place.',
        'Keep the photo with the cleaner background and point to one distraction you removed.'];
    }
    return { focus: topic, theme, checkpoint, next, practiceFocus: focus, steps: tailored };
  }

  const { checkpoint, steps, experiencedStart } = profile;
  const contextualSteps = steps.map(step => [...step]);
  if (Object.hasOwn(experiencedStart ?? {}, experience)) contextualSteps[0] = [...experiencedStart[experience]];
  if (theme === 'people' && experience === 'beginner' && /\b(uni|university|campus|college)\b/i.test(objective)) {
    contextualSteps[0][1] = 'Look for one recurring activity on campus that matches an existing interest. Try a society, a study group or a volunteering session.';
  }
  if (theme === 'origami' && objective !== topic) {
    contextualSteps[6][1] = 'Use a diagram for “' + objective + '”. Identify the base and practise its hardest fold before assembling the full model.';
  }
  if (theme === 'origami' && minutes <= 10) {
    contextualSteps[4][1] = 'Make a bird base from your square base by folding a petal on each face. In later sessions, reverse one narrow point for the tail and the other for the head.';
  }
  if (profile === SPANISH_TRAVEL && /\b(meal|food|restaurant|café|cafe|menu|order)\b/i.test(objective)) {
    contextualSteps[0] = SPANISH_MEAL_START[experience] ?? SPANISH_MEAL_START.beginner;
    contextualSteps[2] = ['Ask for the bill in Spanish', 'Practise “La cuenta, por favor” after ordering a dish. Ask “¿Puedo pagar con tarjeta?” and rehearse both yes and no replies.',
      'Ask for the bill without reading and respond to a shuffled reply about how you can pay.'];
  }
  if (theme === 'language' && profile !== SPANISH_TRAVEL) {
    contextualSteps[0][1] += ' Use “' + topic + '” to work toward “' + objective + '”.';
    if (experience === 'beginner' && minutes <= 10) {
      contextualSteps[0][1] = 'For “' + objective + '”, look up two phrases in your target language and listen to their pronunciation.';
      contextualSteps[0][2] = 'Say both phrases from memory and explain when you would use them.';
    }
  }
  return { focus: topic, theme, checkpoint, steps: contextualSteps };
}

export function nextCustomPractice(island, index) {
  if (island.roadmap?.practiceFocus) {
    return nextPractice({ category: island.theme, roadmap: { focus: island.roadmap.practiceFocus } }, index);
  }
  const profile = customProfile(island) ?? fallbackProfile(island.topic || island.title, island.objective, island.experience);
  const { practice, authored } = profile;
  if (authored) {
    const { theme, practiceFocus } = buildCustomRoadmap(island);
    return nextPractice({ category: theme, roadmap: { focus: practiceFocus } }, index);
  }
  const round = Math.floor(index / 3) + 1;
  const [challenge] = practice;
  const steps = [
    practice,
    ['Review your latest attempt', 'Compare the result of “' + challenge + '” with an earlier attempt. Ask for feedback if it makes sense for this skill.', 'Record one thing that worked and one change to try.'],
    ['Try the change and compare', 'Use what you learnt to repeat the challenge with one deliberate change.', 'Describe one observable difference and choose what to practise next.'],
  ];
  const [title, description, finish] = steps[index % steps.length];
  return { title: title + ' · Practice round ' + round, description, finish };
}
