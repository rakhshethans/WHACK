export const SKILLS = {
  guitar: { label: 'Guitar', objective: 'e.g. Play an acoustic set at an open mic' },
  songwriting: { label: 'Songwriting', objective: 'e.g. Write and record my first original song' },
  photography: { label: 'Photography', objective: 'e.g. Make a street photography series' },
};

const EXPERIENCES = ['beginner', 'intermediate', 'advanced'];

const GUITAR_START = {
  accompaniment: [
    ['Play three clean chords', 'Tune the guitar, then practise G, C and D individually.', 'Play each chord twice with every intended string ringing.'],
    ['Measure your chord changes', 'Play a four-chord progression from the song or style you want to learn.', 'Record two clean loops with a metronome and identify the weakest change.'],
    ['Diagnose a full take', 'Record the hardest section of your target song at performance tempo.', 'Name the two bars where timing, tone or dynamics drift.'],
  ],
  fingerstyle: [
    ['Separate thumb and fingers', 'Hold one chord. Alternate two bass strings with your thumb and pluck the top string with your index finger.', 'Play four bars at 50 bpm without losing the bass pulse.'],
    ['Balance bass and melody', 'Choose four bars with an alternating bass and melody. Record them slowly.', 'Keep the bass even while the melody stays clearly audible.'],
    ['Diagnose a fingerstyle passage', 'Record your most difficult eight bars at target tempo and listen to bass, melody and noise separately.', 'Identify two technical problems and establish a clean practice tempo for each.'],
  ],
  lead: [
    ['Play a clean pentatonic phrase', 'Learn five notes of A minor pentatonic and make a two-bar phrase.', 'Repeat the phrase three times at 60 bpm with clean starts and stops.'],
    ['Map the target riff', 'Pick a riff or solo that fits your objective and transcribe the first two bars in short sections.', 'Play both bars at half tempo with accurate timing and clean muting.'],
    ['Find your speed ceiling', 'Record the hardest two bars of your chosen riff or solo at three tempos.', 'Identify the fastest clean take and the motion that breaks down above it.'],
  ],
};

const GUITAR_ACCOMPANIMENT = [
  ['Connect the chord changes', 'Isolate the two changes your song needs most and practise them to a slow click.', 'Play each change cleanly on beat one in three consecutive four-bar loops.'],
  ['Hold a verse in time', 'Learn one verse from the song you chose. Split it into four-bar chunks across sessions if needed.', 'Record a full verse without stopping or dropping the pulse.'],
  ['Make the chorus feel different', 'Use lighter strumming in the verse and more drive in the chorus.', 'Play the transition twice at the same tempo with an audible contrast.'],
  ['Play a complete song', 'Join the intro, verses, choruses and ending. Practise any weak transition on its own.', 'Record one complete take without restarting.'],
  ['Add a contrasting song', 'Choose a second song with a different rhythm or feel and work through it in short sections.', 'Play its verse and chorus at a stable tempo with a clear start and finish.'],
  ['Rehearse a short set', 'Put your two songs in order and practise introducing them and moving between them.', 'Play the set from beginning to end, including the transition.'],
  ['Perform and review', 'Play for a listener or record a full take. Ask for feedback on timing and expression.', 'Pick one audible weakness and show an improvement in a second take.'],
];

const GUITAR_ARTIST = [
  ['Build a reliable acoustic groove', 'Choose an acoustic pop progression. Practise a four-bar loop using muted strums and a steady backbeat.', 'Record four repeats against a click without losing the pulse.'],
  ['Sing over a steady guitar part', 'Hum a melody over the progression first. Add a line of lyrics once the strumming is automatic.', 'Record an eight-bar take with a steady guitar pulse and audible melody.'],
  ['Write an acoustic verse and chorus', 'Write a four-line verse and a short hook over a progression. Give the chorus a distinct rhythmic or melodic shape.', 'Record a verse into the chorus and make the hook recognisable on a second listen.'],
  ['Build a two-layer live loop', 'Record a four-bar guitar loop and add a rhythm or harmony layer. Use a looper or a free recorder with overdubbing.', 'Bring the second layer in at the bar line and keep both layers in time for four cycles.'],
  ['Arrange an original song', 'Extend your verse and chorus into a complete arrangement. Plan where the guitar, voice and loop enter or drop out.', 'Record one complete take with a deliberate start, build and ending.'],
  ['Rehearse a three-song solo set', 'Prepare one original and two contrasting covers. Rehearse each song separately, then run the full set.', 'Record the set without restarting, with at least one clean layer change in the looped song.'],
  ['Perform, get feedback, and iterate', 'Play the set for a listener or at an open mic. Ask about timing, vocal delivery and whether the hook lands.', 'Use two specific pieces of feedback to revise and record one song again.'],
];

const GUITAR_FINGERSTYLE = [
  ['Keep an alternating bass', 'Practise a repeating thumb pattern over two chords with a metronome.', 'Play eight bars at 55 bpm without speeding up at the chord change.'],
  ['Put a melody over the bass', 'Add one melody note at a time to the thumb pattern.', 'Record four bars with a steady bass and each melody note clearly audible.'],
  ['Connect the phrases', 'Learn two four-bar sections of a target arrangement and isolate their join.', 'Play all eight bars twice without a gap or lost bass note.'],
  ['Shape the dynamics', 'Record the passage with softer accompaniment and a louder top melody.', 'Compare the recordings and choose the take with the clearest melody.'],
  ['Arrange a contrasting section', 'Create a second section using a different picking texture.', 'Play both sections back to back with a clear contrast and steady timing.'],
  ['Record the full arrangement', 'Assemble an intro, both sections and an ending, then record in one take.', 'Play from start to finish without restarting.'],
  ['Refine the performance', 'Ask a listener where the melody is hardest to hear, or locate the issue in your recording.', 'Record a second take with a demonstrably clearer melody in that passage.'],
];

const GUITAR_LEAD = [
  ['Lock a phrase to the beat', 'Play your target riff at half tempo and count where notes fall between the beats.', 'Record three repetitions that start and finish exactly on time.'],
  ['Build reliable articulation', 'Isolate the target phrase’s bend, slide or legato movement and practise it slowly.', 'Play five clean repetitions with consistent pitch and no adjacent-string noise.'],
  ['Increase clean speed', 'Raise the metronome in small steps only after a clean repetition.', 'Play your target bars three times at a faster tempo with the same accuracy.'],
  ['Play across the chord changes', 'Write a short answer phrase that lands on a chord tone when the harmony changes.', 'Record four bars over a backing track with deliberate starts, rests and endings.'],
  ['Finish the target riff or solo', 'Combine the sections and play along with a backing track.', 'Record a continuous take at your target tempo or document the clean tempo reached.'],
  ['Compose a contrasting solo', 'Create a short solo with a quiet opening, a peak and an ending.', 'Record 16 bars where the three parts are easy to distinguish.'],
  ['Compare and improve two takes', 'Record two approaches to the same backing track and compare timing and expression.', 'Choose one specific improvement and demonstrate it in a final take.'],
];

const SONGWRITING = [
  ['Capture a hook', 'Write three short lines that express the central idea of the song. Sing them over a simple rhythm.', 'Choose one hook and save a voice note of it.'],
  ['Find a verse perspective', 'Write four concrete lines around one moment that leads into your hook.', 'Read or sing the lines aloud and remove any that repeat the same idea.'],
  ['Separate verse and chorus', 'Give the chorus a noticeably different melody, rhythm or register.', 'Record both sections so a listener can identify where the chorus starts.'],
  ['Build a complete draft', 'Order the sections and fill in a second verse that moves the story forward.', 'Sing or play the full draft in one uninterrupted recording.'],
  ['Edit for singability', 'Circle awkward words and replace them with phrases that fit the same rhythm naturally.', 'Record the revised lines without squeezing in syllables or dropping words.'],
  ['Arrange a basic demo', 'Choose a simple accompaniment or backing texture and plan how it develops.', 'Record a complete demo with an audible vocal or lead melody.'],
  ['Get one specific reaction', 'Share the draft with a listener and ask what line or melody stayed with them.', 'Make one deliberate revision based on the response.'],
  ['Finish a second draft', 'Record your revised song and compare it against the first take.', 'Keep both versions and describe one way the new one communicates the idea more clearly.'],
];

const PHOTOGRAPHY = {
  street: [
    ['Find a strong frame', 'Pick a public location and frame one subject using the surrounding architecture.', 'Make three versions and choose one with the cleanest background.'],
    ['Follow the light', 'Photograph the same area in hard light and shade.', 'Select a pair that shows how light changes what your eye notices first.'],
    ['Time a moving subject', 'Watch for a subject entering a frame you composed in advance.', 'Make one frame in which subject placement and timing both feel intentional.'],
    ['Work on a visual motif', 'Choose one repeatable motif such as reflections, colour or silhouettes.', 'Capture four different frames that share the motif.'],
  ],
  portrait: [
    ['Find flattering light', 'With a willing subject, try window light from the front, side and behind.', 'Choose one frame and explain how the light shapes the face.'],
    ['Control the background', 'Photograph the same subject against three backgrounds.', 'Select one portrait where the background supports the subject without competing.'],
    ['Give one useful direction', 'Try a simple pose cue or conversation prompt with your subject.', 'Make two portraits with distinctly different expressions or poses.'],
    ['Make a portrait set', 'Use one lighting idea across three different frames.', 'Select three portraits that feel coherent but avoid repeating the same pose.'],
  ],
  landscape: [
    ['Build foreground and depth', 'Find a viewpoint with foreground, middle distance and background.', 'Make two compositions and choose the one where the layers are clearest.'],
    ['Compare changing light', 'Return to a viewpoint at a different time or wait for the light to shift.', 'Keep one pair where the change in light alters the composition or mood.'],
    ['Control exposure for the sky', 'Try two exposures for a scene with a bright sky and dark foreground.', 'Keep one frame that preserves the details you most want to show.'],
    ['Tell a place in four frames', 'Make a wide view, a detail, a second angle and a transitional frame.', 'Select four frames that convey different aspects of the same place.'],
  ],
};

const PHOTO_FINISH = [
  ['Edit for consistency', 'Apply a consistent crop, brightness and colour approach to a selection.', 'Make a set of six edited images without a distracting outlier.'],
  ['Reshoot the missing frame', 'Identify one gap in your set and plan a shot to address it.', 'Add a frame that performs a clear role in the sequence.'],
  ['Sequence a small portfolio', 'Arrange your strongest images as an opening, middle and closing.', 'Keep six to eight frames and give a reason for the first and last choices.'],
  ['Get feedback and revise', 'Show the sequence to a viewer and ask which image felt out of place.', 'Revise the selection or order and state what the change improves.'],
];

function guitarPath(objective, experience) {
  if (/\bed sheeran\b|\bsinger[\s-]*songwriter\b|\blive loop|\b(loop pedal|open mic|gig|solo set|sing (and|while)|write (my |a )?(song|music))\b/i.test(objective)) {
    return {
      focus: 'Acoustic singer-songwriter',
      checkpoint: 'Perform a three-song solo set with an original and a looped arrangement.',
      next: 'Build a larger original repertoire, perform regularly, get coaching and use feedback to improve your writing and live performance.',
      steps: [GUITAR_START.accompaniment[experience], ...GUITAR_ARTIST],
    };
  }
  if (/\bfinger[\s-]*(style|pick)|\b(classical guitar|travis picking)\b/i.test(objective)) {
    return { focus: 'Fingerstyle arrangement', checkpoint: 'Record a complete fingerstyle arrangement.', steps: [GUITAR_START.fingerstyle[experience], ...GUITAR_FINGERSTYLE] };
  }
  if (/\b(riff|riffs|solo|solos|shred|metal|blues lead|lead guitar|improvis\w*)\b/i.test(objective)) {
    return { focus: 'Lead guitar and improvisation', checkpoint: 'Play a target riff or solo and record a short solo of your own.', steps: [GUITAR_START.lead[experience], ...GUITAR_LEAD] };
  }
  return {
    focus: 'Song accompaniment',
    checkpoint: 'Play your target song all the way through, then rehearse a contrasting second song.',
    steps: [GUITAR_START.accompaniment[experience], ...GUITAR_ACCOMPANIMENT],
  };
}

function songwritingPath(objective, experience) {
  const lyricsFirst = /\b(lyric|lyrics|rap|verse|words)\b/i.test(objective);
  const steps = [...SONGWRITING];
  if (lyricsFirst) {
    steps[0] = ['Write a lyrical hook', 'Start with a specific image or phrase from the story you want to tell. Write three variants with different stresses.', 'Say all three over a beat and keep the one that lands naturally.'];
  }
  if (experience > 0) {
    steps[0] = [steps[0][0], steps[0][1] + ' Compare it with a hook from one of your earlier songs and try a different phrasing pattern.', steps[0][2]];
  }
  return { focus: lyricsFirst ? 'Lyrics and delivery' : 'Original song and recording', checkpoint: 'Finish and revise an original song you can play back for someone.', steps };
}

function photographyPath(objective, experience) {
  const genre = /\b(portrait|portraits|people|headshot|headshots)\b/i.test(objective) ? 'portrait' :
    /\b(landscape|landscapes|nature|mountain|mountains|sunset)\b/i.test(objective) ? 'landscape' : 'street';
  const steps = [...PHOTOGRAPHY[genre], ...PHOTO_FINISH];
  if (experience > 0) {
    const [title, practice, finish] = steps[0];
    steps[0] = [title, practice + ' Repeat at a second distance or focal length and compare your choices.', finish];
  }
  return { focus: genre[0].toUpperCase() + genre.slice(1) + ' photography', checkpoint: 'Produce and refine a six-to-eight-image series with a clear theme.', steps };
}

export function buildRoadmap({ category, objective, experience }) {
  const level = Math.max(0, EXPERIENCES.indexOf(experience));
  if (category === 'songwriting') return songwritingPath(objective, level);
  if (category === 'photography') return photographyPath(objective, level);
  return guitarPath(objective, level);
}

const PRACTICE_SERIES = {
  'Acoustic singer-songwriter': [
    ['Expand your live set', 'Add one original or contrasting cover to your set. Plan its introduction and where the guitar, voice or loop enters.', 'Play it between two familiar songs without a pause to reset.'],
    ['Write for a different groove', 'Write a new hook in a groove or metre your existing songs use rarely. Pair it with a rhythm you can sing over.', 'Record a verse and chorus where the groove stays steady under the vocal.'],
    ['Strengthen your live looping', 'Arrange a song around a loop entrance and a deliberate layer drop. Rehearse the two transitions separately.', 'Record both transitions on the bar line in one take.'],
    ['Rehearse for a new room', 'Choose a setting you have not rehearsed for, such as a quiet listening room or an open mic with a short slot.', 'Play an uninterrupted set that fits the time and dynamic range of that setting.'],
  ],
  'Fingerstyle arrangement': [
    ['Arrange a new melody', 'Choose an unfamiliar melody and find two places to support it with alternating bass.', 'Play an eight-bar passage with clearly separated melody and bass.'],
    ['Work on your dynamic range', 'Practise a passage with a quiet opening and a stronger ending while keeping the bass even.', 'Record a take where the change in intensity is audible and the tempo holds.'],
    ['Try a new picking texture', 'Adapt a section to use an arpeggio or syncopated fingerpicking pattern.', 'Play both the original and the adapted versions at the same tempo.'],
  ],
  'Lead guitar and improvisation': [
    ['Build a new vocabulary phrase', 'Transcribe a short phrase from a player you admire, then alter its ending.', 'Record the original and your variation against the same backing track.'],
    ['Improvise through a change', 'Choose a progression with one unfamiliar chord and practise landing on its chord tones.', 'Record an improvised chorus with intentional phrasing across that change.'],
    ['Recover from a mistake', 'Practise restarting a phrase on the next beat while a backing track continues.', 'Record a short solo and keep time through one deliberately interrupted phrase.'],
  ],
  guitar: [
    ['Learn a contrasting song', 'Choose a song outside your current set with a different tempo, metre or strumming feel.', 'Play a verse and chorus with a steady pulse and a clear transition.'],
    ['Play with another part', 'Practise alongside a recording or a second player and leave room for their melody.', 'Record one section where your part stays in time and supports the melody.'],
    ['Rearrange a familiar song', 'Change the accompaniment texture or move the song to a different key.', 'Play the original and new arrangements with clean transitions.'],
  ],
  songwriting: [
    ['Write under a new constraint', 'Draft a song with a different point of view, metre or structure from your last one.', 'Record a verse and chorus where the constraint is audible and the idea is clear.'],
    ['Develop a contrasting bridge', 'Write a short section that changes the emotional angle of your draft.', 'Record it between two existing sections and check that the return to the hook feels earned.'],
    ['Rework the arrangement', 'Give a draft a contrasting tempo or accompaniment without changing its central hook.', 'Record both versions and explain which better supports the lyric or melody.'],
  ],
  photography: [
    ['Start a new photo study', 'Choose a new subject within your chosen genre and limit the shoot to one lighting or framing idea.', 'Select four frames that explore the idea without repeating the same composition.'],
    ['Reshoot under different conditions', 'Revisit a subject from your last series under a different light, at a different distance or in a new setting.', 'Choose one before-and-after pair and explain what the change added.'],
    ['Build a second photo sequence', 'Make a short sequence about a new place, person or visual motif within your chosen genre.', 'Select an opening, middle and closing frame with distinct roles.'],
  ],
};

export function nextPractice(island, practiceIndex) {
  const series = Object.hasOwn(PRACTICE_SERIES, island.roadmap?.focus) ? PRACTICE_SERIES[island.roadmap.focus] :
    PRACTICE_SERIES[island.category] ?? PRACTICE_SERIES.guitar;
  const round = Math.floor(practiceIndex / 3) + 1;
  const [challenge, practice, finish] = series[(round - 1) % series.length];
  const medium = island.category === 'photography' ? 'photo set' : 'recording';
  const steps = [
    [challenge, practice + ' Choose material you haven’t used for this challenge before.', finish],
    ['Get feedback on your ' + medium, 'Show the work from “' + challenge + '” to a listener or viewer. If you are practising alone, review it against an earlier attempt.', 'Write down one strength and one specific change you can make.'],
    ['Revise and compare', 'Use the feedback to revise the work from “' + challenge + '”. Keep both versions.', 'Point to one concrete improvement you can hear or see in the new version.'],
  ];
  const [title, description, done] = steps[practiceIndex % steps.length];
  return { title: title + ' · Practice round ' + round, description, finish: done };
}
