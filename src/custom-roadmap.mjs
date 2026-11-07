const PROFILES = [
  {
    theme: 'people', matches: /\b(meet(?:ing)? (?:new )?people|friends?|friendships?|sociali[sz]\w*|networking|social confidence|connections)\b/i,
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
  },
  {
    theme: 'speaking', matches: /\b(public speaking|give a (short )?(talk|speech|presentation)|present to a group)\b/i,
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

function generalProfile(topic, objective, experience) {
  const first = experience === 'beginner'
    ? 'Find one simple example of ' + topic + ' and pick one basic action you can try with the tools you already have.'
    : 'Choose an example of your current work in ' + topic + ' and attempt the part that most often slows you down.';
  return {
    theme: 'compass',
    checkpoint: 'Complete a small real example of ' + topic + ' and show one improvement toward “' + objective + '”.',
    steps: [
      ['Make a first attempt at ' + topic, first, 'Save, demonstrate or describe one attempt and identify a single point to improve.'],
      ['Isolate one part of the skill', 'Take the part you struggled with. Remove the other steps and practise a smaller version of that action.', 'Complete two attempts and point out one difference between them.'],
      ['Use the skill in a small example', 'Choose a short example that contributes directly to “' + objective + '”. Use the part you just practised.', 'Produce one observable result and describe what made it work.'],
      ['Compare with a clear reference', 'Find a worked example or ask someone familiar with ' + topic + ' to look at your attempt.', 'Identify one specific gap you can practise next.'],
      ['Make a deliberate revision', 'Repeat your example with one change that addresses the gap.', 'Keep the earlier result and show what changed.'],
      ['Try a different situation', 'Use the same skill in a new example with one changed constraint.', 'Complete the new example and identify where the skill transferred.'],
      ['Bring it closer to your ambition', 'Choose a more realistic version of “' + objective + '” and practise the piece you are ready for.', 'Complete that piece and identify the next part you need to learn.'],
      ['Review and set the next challenge', 'Compare your current work in ' + topic + ' with your first attempt.', 'Name one clear improvement and choose a new challenge to build on it.'],
    ],
    practice: ['Apply ' + topic + ' to a fresh example', 'Choose new material relevant to “' + objective + '”. Change one constraint from your last attempt and practise the hardest step.', 'Keep an example that shows how you handled the change.'],
  };
}

function customProfile({ topic, objective, experience }) {
  return PROFILES.find(profile => profile.matches.test(topic))
    ?? PROFILES.find(profile => profile.matches.test(objective))
    ?? generalProfile(topic, objective, experience);
}

export function buildCustomRoadmap(input) {
  const { theme, checkpoint, steps } = customProfile(input);
  const contextualSteps = steps.map(step => [...step]);
  if (theme === 'people' && /\b(uni|university|campus|college)\b/i.test(input.objective)) {
    contextualSteps[0][1] = 'Look for one recurring activity on campus that matches an existing interest. Try a society, a study group or a volunteering session.';
  }
  if (theme !== 'compass' && input.objective !== input.topic) {
    contextualSteps[2][1] += ' Choose an example that moves you toward “' + input.objective + '”.';
  }
  return { focus: input.topic, theme, checkpoint, steps: contextualSteps };
}

export function nextCustomPractice(island, index) {
  const { practice } = customProfile({ topic: island.topic, objective: island.objective, experience: island.experience });
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
