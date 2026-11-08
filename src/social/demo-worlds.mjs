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
];

export const EXTRA_DEMO_PERSONAS = ['user-nia-brooks', 'user-ravi-shah', 'user-jo-tan'];
