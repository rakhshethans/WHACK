// Each group gives Explore a few people with the same skill at different levels.
export const DEMO_WORLDS = [
  {
    topic: 'Driving', title: 'Junction Bay',
    members: [['nia-brooks', 'Nia Brooks', 2, 'Prepare for a first supervised drive'], ['leon-park', 'Leon Park', 5, 'Park confidently on a narrow street'], ['maya-das', 'Maya Das', 8, 'Prepare for an advanced driving assessment']],
    goals: [
      ['Rehearse the cockpit check', 'In a parked car with the engine off, adjust the seat and mirrors, then point out the main controls.', 'You can repeat the seat, mirrors and controls check in order.'],
      ['Map the approach to a junction', 'Use a diagram of a local junction to rehearse observations and where to stop with a qualified instructor or supervisor.', 'You can point to the stop position and explain which way to look.'],
    ],
  },
  {
    topic: 'Fear of flying', title: 'Cloud Harbour',
    members: [['ines-costa', 'Inês Costa', 1, 'Prepare for a short flight to visit family'], ['elliot-wong', 'Elliot Wong', 4, 'Feel more prepared for takeoff'], ['samira-khan', 'Samira Khan', 6, 'Build a practical plan for a long flight']],
    goals: [
      ['Map the stages of a flight', 'Write down boarding, taxi, takeoff, cruise and landing, then note one question about each unfamiliar stage.', 'Your notes name all five stages and at least one question you can look up.'],
      ['Pack a simple travel plan', 'Make a one-page checklist for getting to the gate, boarding and settling into your seat.', 'The checklist has one action for each of the three stages.'],
    ],
  },
  {
    topic: 'Python', title: 'Script Quay',
    members: [['ravi-shah', 'Ravi Shah', 2, 'Automate a weekly expense summary'], ['ivy-morgan', 'Ivy Morgan', 5, 'Build a small weather data dashboard'], ['zoe-adele', 'Zoë Adele', 8, 'Write dependable command-line tools']],
    goals: [
      ['Total three amounts in Python', 'Put three test amounts in a Python list and use sum to print their total.', 'The printed total matches your hand calculation.'],
      ['Read the heading of a CSV', 'Use csv.DictReader on a small CSV with date and amount columns.', 'Your script prints both column names in the order they appear in the file.'],
    ],
  },
  {
    topic: 'Cooking', title: 'Copper Kitchen',
    members: [['jo-tan', 'Jo Tan', 1, 'Cook simple dinners on weeknights'], ['amelia-reed', 'Amelia Reed', 4, 'Cook a vegetable main for friends'], ['hassan-ali', 'Hassan Ali', 7, 'Plan a seasonal dinner menu']],
    goals: [
      ['Dice one onion evenly', 'Use a stable chopping board and cut one onion half into similarly sized pieces.', 'Most pieces are close to the same size so they can cook evenly.'],
      ['Compare two batches of onions', 'Sauté two small batches over different heat settings and compare the colour and texture.', 'Your notes identify which setting softened the onion evenly.'],
    ],
  },
  {
    topic: 'Bouldering', title: 'Granite Reach',
    members: [['lena-frost', 'Lena Frost', 2, 'Climb a first graded indoor problem'], ['omar-rossi', 'Omar Rossi', 5, 'Improve precise foot placement'], ['ben-jones', 'Ben Jones', 8, 'Build a routine for working on harder problems']],
    goals: [
      ['Place each foot quietly', 'On a low easy traverse at a climbing gym, look at each foothold until the shoe is on it.', 'Cross five holds with controlled placements and no foot scraping.'],
      ['Repeat one balanced move', 'On a low, comfortable problem, pause in balance before moving a hand to the next hold.', 'Repeat the same move three times without an uncontrolled swing.'],
    ],
  },
  {
    topic: 'Running', title: 'Stride Point',
    members: [['grace-bell', 'Grace Bell', 1, 'Build a steady walk-run routine'], ['dev-patel', 'Dev Patel', 4, 'Pace a first 5K'], ['marta-novak', 'Marta Novak', 7, 'Run more even splits at club sessions']],
    goals: [
      ['Find a conversational pace', 'Use a flat route and alternate short easy jogs with walks, keeping enough breath to say a full sentence.', 'You can say a full sentence during each of three jogs.'],
      ['Repeat an even interval', 'On the same flat stretch, repeat three comfortable one-minute jogs and note where each ends.', 'The three endpoints are close together without sprinting to finish.'],
    ],
  },
  {
    topic: 'Valorant', title: 'Crosshair Cay',
    members: [['kai-chen', 'Kai Chen', 2, 'Get comfortable with aim and movement'], ['rosa-mills', 'Rosa Mills', 5, 'Improve opening duels'], ['finn-clarke', 'Finn Clarke', 8, 'Build consistent crosshair placement on attack']],
    goals: [
      ['Stop before each first shot', 'In the practice range, strafe between single shots and settle your movement before firing at each bot.', 'Land ten stationary first shots without holding down the trigger.'],
      ['Clear corners at head height', 'In a custom map, walk a route into one site and line up your crosshair at head height on each common angle.', 'You can repeat the route with your crosshair already at each angle before you round it.'],
    ],
  },
  {
    topic: 'Origami', title: 'Paper Lantern Isle',
    members: [['mei-lam', 'Mei Lam', 2, 'Fold an even paper crane'], ['aisha-nordin', 'Aisha Nordin', 4, 'Make crisp reverse folds for animal models'], ['leo-martin', 'Leo Martin', 7, 'Build a display of paper birds']],
    goals: [
      ['Fold a crisp square base', 'Make two diagonal creases and two centre creases, then collapse the paper into a square base.', 'The four corners meet and the centre creases line up.'],
      ['Make an inside reverse fold', 'Use a spare folded corner to practise opening the layers and reversing the crease inward.', 'The point sits cleanly inside the fold with both edges aligned.'],
    ],
  },
  {
    topic: 'Urban sketching', title: 'Palette Shore',
    members: [['tariq-mansour', 'Tariq Mansour', 2, 'Sketch pen-and-ink street corners with accurate perspective'], ['chloe-dubois', 'Chloé Dubois', 5, 'Paint loose architectural watercolour washes'], ['kenji-mori', 'Kenji Mori', 8, 'Capture atmospheric twilight plein-air gouache studies']],
    goals: [
      ['Draw a two-point perspective street corner', 'Set two vanishing points on the horizon line and block in the roofline, windows and kerb with a 0.3 fineliner.', 'The receding lines converge toward their respective vanishing points without curving.'],
      ['Layer a clean transparent wash', 'Mix a pale cobalt and raw sienna wash, tilting the sketchbook to lay a streak-free sky wash over ink lines.', 'The wash dries without pooling, blooms, or muddy streaks.'],
    ],
  },
  {
    topic: 'Ceramics', title: 'Kiln Haven',
    members: [['saffron-ward', 'Saffron Ward', 1, 'Centre clay on the pottery wheel consistently'], ['diego-alvarez', 'Diego Alvarez', 4, 'Pull even cylinder walls for handmade coffee mugs'], ['amara-okafor', 'Amara Okafor', 7, 'Throw wide lidded stoneware vessels and carve foot rings']],
    goals: [
      ['Cone and centre 1kg clay', 'Rest both elbows on your thighs, compress the spinning clay into a cone twice, and press down until the mound spins completely true.', 'The clay dome does not wobble or vibrate under your fingers at medium wheel speed.'],
      ['Pull a five-inch cylinder', 'Use the inside and outside sponge fingertips to lift an even wall in three steady passes.', 'The rim stays level and the wall thickness is consistent from base to top.'],
    ],
  },
  {
    topic: 'Music production', title: 'Soundwave Atoll',
    members: [['marcus-vance', 'Marcus Vance', 2, 'Program punchy drum loops and syncopated hi-hats'], ['yuki-tanaka', 'Yuki Tanaka', 5, 'Design rich analog poly-synth patches from scratch'], ['faye-harrison', 'Faye Harrison', 8, 'Mix and master multi-track instrumentals with clean dynamics']],
    goals: [
      ['Program an off-grid groove', 'In your DAW, nudge kick and snare hits slightly off grid and set velocity variation on sixteenth-note hats.', 'The loop has human swing and head-nodding feel without sounding quantised or sloppy.'],
      ['Sculpt a warm analog bass patch', 'Init a subtractive synth patch, detune two saw waves slightly, and roll off high frequencies with an envelope-modulated 24dB low-pass filter.', 'The synth bass produces a solid fundamental below 100Hz with zero digital harshness.'],
    ],
  },
  {
    topic: 'Gardening', title: 'Fern Cove',
    members: [['leila-kassem', 'Leila Kassem', 1, 'Propagate houseplants and start kitchen herbs on a windowsill'], ['tobias-schmidt', 'Tobias Schmidt', 4, 'Build raised garden beds and companion-plant heirloom vegetables'], ['ananya-deshmukh', 'Ananya Deshmukh', 7, 'Manage four-season organic composting and soil microbiomes']],
    goals: [
      ['Take clean stem cuttings', 'Sanitise pruning shears and cut two healthy pothos or basil stems just below an active leaf node.', 'Both cuttings are placed in clean water with node submerged and leaves dry.'],
      ['Mix a well-draining potting soil', 'Combine coco coir, perlite, and worm castings in a 3:1:1 ratio and test drainage with water.', 'Water flows freely through the drainage holes within ten seconds without waterlogging.'],
    ],
  },
  {
    topic: 'Astronomy', title: 'Starlight Point',
    members: [['hugo-lindqvist', 'Hugo Lindqvist', 2, 'Identify major seasonal constellations and navigate with star charts'], ['fatima-al-mansoor', 'Fatima Al-Mansoor', 5, 'Track Jupiter moons and Saturn rings through a telescope'], ['callum-reid', 'Callum Reid', 8, 'Capture deep-sky astrophotography of nebulae and star clusters']],
    goals: [
      ['Star-hop to the North Star', 'Locate the Big Dipper pointer stars (Merak and Dubhe) and trace a five-fold line directly to Polaris.', 'You can point out Polaris and name three surrounding constellations in under two minutes.'],
      ['Calibrate a telescope finder scope', 'Align your finder scope reticle on a distant daytime landmark before slewing to the lunar terminator at dusk.', 'Objects centred in the crosshair appear centred in a 25mm eyepiece view.'],
    ],
  },
  {
    topic: 'Italian', title: 'Piazza Bay',
    members: [['lucia-moretti', 'Lucia Moretti', 2, 'Order food and espresso naturally in an Italian café'], ['gabriele-ricci', 'Gabriele Ricci', 4, 'Chat about daily routines and weekend plans in conversational Italian'], ['valeria-conti', 'Valeria Conti', 7, 'Discuss literature, regional culture, and current affairs in fluent Italian']],
    goals: [
      ['Order at an Italian coffee bar', 'Practise ordering "un caffè macchiato e un cornetto alla crema, per favore" with correct polite forms.', 'You can complete a mock barista dialogue smoothly without pausing for vocabulary.'],
      ['Ask and follow walking directions', 'Rehearse listening to directions involving "sempre dritto", "gira a destra", and "all incrocio".', 'You can trace the correct route on a city map based on an audio prompt.'],
    ],
  },
  {
    topic: 'Creative writing', title: 'Inkwell Anchorage',
    members: [['dahlia-sinclair', 'Dahlia Sinclair', 2, 'Draft compelling scene openings with sensory hooks'], ['kofi-mensah', 'Kofi Mensah', 5, 'Develop distinct character dialogue voices and subtext'], ['selena-vargas', 'Selena Vargas', 8, 'Structure three-act narrative pacing and plot turning points']],
    goals: [
      ['Write an opening sensory hook', 'Draft a 150-word scene opener focusing on two distinct senses (scent, sound, or touch) without exposition dumps.', 'The reader understands the physical setting and character tension from the first sentence.'],
      ['Sharpen dialogue subtext', 'Write a two-character conversation where neither person explicitly says what they actually want.', 'A peer reader can correctly identify the unspoken conflict from dialogue and body beats alone.'],
    ],
  },
  {
    topic: 'Coffee brewing', title: 'Crema Cay',
    members: [['milo-chen', 'Milo Chen', 2, 'Dial in pour-over brew ratios and grind size consistency'], ['clara-becker', 'Clara Becker', 5, 'Steam glossy microfoam and pour tulip latte art'], ['ethan-foster', 'Ethan Foster', 7, 'Calibrate single-origin espresso extraction and TDS refractometry']],
    goals: [
      ['Brew a balanced V60 pour-over', 'Use a 1:16 ratio with a 45-second bloom and circular water pulses to finish brew between 2:45 and 3:15.', 'The cup has clear fruit acidity with zero astringent or bitter dry aftertaste.'],
      ['Steam silk microfoam for latte art', 'Aerate cold whole milk for 3 seconds before creating a vortex until the pitcher is warm to the touch (60°C).', 'The surface has a mirror-gloss sheen with no visible dry bubbles and pours a distinct 3-tier tulip.'],
    ],
  },
  {
    topic: 'Swimming', title: 'Azure Shoal',
    members: [['simon-beauchamp', 'Simon Beauchamp', 2, 'Breathe bilaterally every three strokes with balanced body rotation'], ['talia-stern', 'Talia Stern', 5, 'Pace 400m freestyle intervals with streamlined flip turns'], ['joaquin-navarro', 'Joaquin Navarro', 8, 'Navigate open-water sighting and continuous distance drafting']],
    goals: [
      ['Master bilateral breathing rhythm', 'Swim three 50m lengths breathing alternately to left and right every 3 strokes while keeping hips high.', 'Maintain steady forward propulsion without pausing or scissor-kicking on breaths.'],
      ['Streamline off every wall', 'Push off underwater in a tight pencil streamline with three dolphin kicks before breaking the surface.', 'Travel past the 5-metre flags on each wall push-off with minimal effort.'],
    ],
  },
  {
    topic: 'Woodworking', title: 'Timber Reach',
    members: [['rowan-hayes', 'Rowan Hayes', 1, 'Make square hand-saw cuts on hardwood stock'], ['nadia-alvarez', 'Nadia Alvarez', 4, 'Chisel snug mortise-and-tenon joinery for small tables'], ['soren-lind', 'Sören Lind', 7, 'Hand-plane curly maple surfaces and apply rubbed oil finishes']],
    goals: [
      ['Saw a square cut on the line', 'Mark a square line with a try square and knife, kerf the waste side, and saw with a Japanese pull-saw.', 'The cut face is square in both planes when checked against an engineer square.'],
      ['Chisel a flat mortise floor', 'Chisel from both ends toward the middle of a 12mm mortise, paring down to a marked depth gauge.', 'The tenon seats flush without rocking and the cheeks have no gaps wider than 0.5mm.'],
    ],
  },
];

export const EXTRA_DEMO_PERSONAS = [
  'user-nia-brooks',
  'user-ravi-shah',
  'user-jo-tan',
  'user-tariq-mansour',
  'user-saffron-ward',
  'user-lucia-moretti',
  'user-dahlia-sinclair',
  'user-milo-chen',
];

