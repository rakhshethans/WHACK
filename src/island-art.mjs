const SUBJECTS = [
  ['shooter', /\b(?:valorant|counter[- ]?strike|cs2|cs[: ]?go|overwatch(?: 2)?|apex legends|rainbow six siege|call of duty|fortnite|first[- ]person shooters?|shooter games?)\b/i],
  ['racing', /\b(?:mario kart|gran turismo|forza|iracing|sim racing|racing games?)\b/i],
  ['building-game', /\b(?:minecraft|block[- ]building games?)\b/i],
  ['film', /\b(?:cinematograph\w*|filmmak\w*|video edit\w*)\b/i],
  ['camera', /\b(?:photograph\w*|photos?|camera)\b/i],
  ['guitar', /\b(?:guitar|ukulele)\b/i],
  ['piano', /\b(?:piano|keyboard playing)\b/i],
  ['drums', /\b(?:drums?|drumming|percussion)\b/i],
  ['violin', /\b(?:violin|fiddle|viola)\b/i],
  ['music', /\b(?:music|singing|songwrit\w*|compos(?:e|ing))\b/i],
  ['breakdance', /\b(?:break[ -]?danc\w*|toprock|b[ -]?boying|b[ -]?girling)\b/i],
  ['dance', /\b(?:danc\w*|ballet|salsa|choreograph\w*)\b/i],
  ['code', /\b(?:cod(?:e|ing)|programming|python|javascript|web development|software|spreadsheets?|excel)\b/i],
  ['cooking', /\b(?:cook\w*|bak(?:e|ing)|sourdough|chef|culinary|barista)\b/i],
  ['plant', /\b(?:garden\w*|plants?|grow(?:ing)? vegetables|horticulture|bonsai)\b/i],
  ['brush', /\b(?:paint\w*|draw(?:ing)?|illustrat\w*|sketch\w*|watercolou?r)\b/i],
  ['pottery', /\b(?:potter\w*|ceramic\w*|clay sculpt\w*)\b/i],
  ['woodwork', /\b(?:woodwork\w*|whittl\w*|carpentr\w*|wood carv\w*)\b/i],
  ['textiles', /\b(?:knit\w*|crochet\w*|sew\w*|embroider\w*)\b/i],
  ['running', /\b(?:running|marathon|jogging|sprinting)\b/i],
  ['swimming', /\b(?:swim\w*|freestyle stroke)\b/i],
  ['fitness', /\b(?:fitness|strength|weightlift\w*|gymnast\w*|yoga)\b/i],
  ['origami', /\b(?:origami|paper folding|paper cranes?)\b/i],
  ['chess', /\bchess\b/i],
  ['board', /\b(?:go game|checkers|board games?)\b/i],
  ['speech', /\b(?:public speak\w*|speaking in public|speech|presentations?|debate)\b/i],
  ['language', /\b(?:languages?|spanish|french|german|japanese|korean|mandarin|italian|arabic|portuguese|dutch)\b/i],
  ['people', /\b(?:mak(?:e|ing) friends|meet(?:ing)? (?:new )?people|socialis\w*|socializ\w*|networking)\b/i],
  ['book', /\b(?:writing|essays?|read(?:ing)?|stud(?:y|ying)|novels?|poetry)\b/i],
];

const GENERAL_GAMING = /\b(?:gaming|video games?|esports|league of legends|dota(?: 2)?|street fighter|tekken)\b/i;

export const LANDMARKS = [...SUBJECTS.map(([key]) => key), 'controller', 'compass'];

export function knownLandmark({ topic, objective }) {
  for (const text of [topic, objective]) {
    if (typeof text !== 'string') continue;
    let bestIndex = Infinity;
    let landmark;
    for (const [key, pattern] of SUBJECTS) {
      const index = text.search(pattern);
      if (index >= 0 && index < bestIndex) {
        bestIndex = index;
        landmark = key;
      }
    }
    if (landmark) return landmark;
    if (GENERAL_GAMING.test(text)) return 'controller';
  }
}

export function validLandmark(value) {
  return LANDMARKS.includes(value);
}
