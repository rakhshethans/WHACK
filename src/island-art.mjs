const SUBJECTS = [
  ['camera', /\b(?:photograph\w*|photos?|camera|cinematograph\w*|filmmak\w*)\b/i],
  ['guitar', /\b(?:guitar|ukulele)\b/i],
  ['music', /\b(?:music|piano|drums?|singing|songwrit\w*|violin|compos(?:e|ing))\b/i],
  ['dance', /\b(?:danc\w*|break[ -]?danc\w*|toprock|ballet|salsa|choreograph\w*)\b/i],
  ['code', /\b(?:cod(?:e|ing)|programming|python|javascript|web development|software|spreadsheets?|excel)\b/i],
  ['cooking', /\b(?:cook\w*|bak(?:e|ing)|sourdough|chef|culinary|barista)\b/i],
  ['plant', /\b(?:garden\w*|plants?|grow(?:ing)? vegetables|horticulture|bonsai)\b/i],
  ['brush', /\b(?:paint\w*|draw(?:ing)?|illustrat\w*|sketch\w*|watercolou?r)\b/i],
  ['fitness', /\b(?:fitness|running|marathon|strength|weightlift\w*|gymnast\w*|yoga|swim\w*)\b/i],
  ['origami', /\b(?:origami|paper folding|paper cranes?)\b/i],
  ['board', /\b(?:chess|go game|checkers|board games?)\b/i],
  ['speech', /\b(?:public speak\w*|speaking in public|speech|presentations?|debate)\b/i],
  ['language', /\b(?:languages?|spanish|french|german|japanese|korean|mandarin|italian|arabic|portuguese|dutch)\b/i],
  ['people', /\b(?:mak(?:e|ing) friends|meet(?:ing)? (?:new )?people|socialis\w*|socializ\w*|networking)\b/i],
  ['book', /\b(?:writing|essays?|read(?:ing)?|stud(?:y|ying)|novels?|poetry)\b/i],
];

export const LANDMARKS = [...SUBJECTS.map(([key]) => key), 'compass'];

export function knownLandmark({ topic, objective }) {
  for (const text of [topic, objective]) {
    if (!text) continue;
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
  }
}

export function validLandmark(value) {
  return LANDMARKS.includes(value);
}
