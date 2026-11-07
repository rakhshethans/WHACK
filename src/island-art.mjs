const SUBJECTS = [
  ['shooter', /\b(?:valorant|counter[- ]?strike|cs2|cs[: ]?go|overwatch(?: 2)?|apex legends|rainbow six siege|call of duty|fortnite|first[- ]person shooters?|shooter games?)\b/i],
  ['racing', /\b(?:mario kart|gran turismo|forza|iracing|sim racing|racing games?)\b/i],
  ['building-game', /\b(?:minecraft|block[- ]building games?)\b/i],
  ['football', /\b(?:football|soccer|futsal|penalty kicks?)\b/i],
  ['basketball', /\b(?:basketball|free throws?|layups?)\b/i],
  ['racket', /\b(?:tennis|badminton|squash|pickleball|padel|racket sports?)\b/i],
  ['golf', /\b(?:golf|putting drills?|golf swing)\b/i],
  ['bat-sports', /\b(?:cricket|baseball|softball|batting drills?)\b/i],
  ['volleyball', /\b(?:volleyball|beach volley)\b/i],
  ['cycling', /\b(?:cycling|biking|mountain bik\w*|bmx|road bik\w*)\b/i],
  ['climbing', /\b(?:climbing|bouldering|belaying|rock climb\w*)\b/i],
  ['outdoors', /\b(?:hiking|trekking|camping|backpacking|orienteering|bushcraft)\b/i],
  ['snow-sports', /\b(?:skiing|snowboard\w*|snow sports?)\b/i],
  ['water-sports', /\b(?:surfing|kayak\w*|canoe\w*|sailing|rowing|paddleboard\w*|windsurf\w*)\b/i],
  ['martial-arts', /\b(?:martial arts?|boxing|kickboxing|karate|judo|jiu[- ]jitsu|taekwondo|wrestling|muay thai|mma)\b/i],
  ['skating', /\b(?:skateboard\w*|rollerblad\w*|roller skat\w*|ice skat\w*|figure skat\w*)\b/i],
  ['mobility', /\b(?:yoga|pilates|stretching|flexibility|mobility drills?)\b/i],
  ['film', /\b(?:cinematograph\w*|filmmak\w*|video edit\w*)\b/i],
  ['camera', /\b(?:photograph\w*|photos?|camera)\b/i],
  ['guitar', /\b(?:(?:(?:spanish|classical|acoustic|electric|bass|fingerstyle) )?guitar|ukulele)\b/i],
  ['piano', /\b(?:piano|keyboard playing)\b/i],
  ['drums', /\b(?:drums?|drumming|percussion)\b/i],
  ['violin', /\b(?:violin|fiddle|viola)\b/i],
  ['audio', /\b(?:podcast\w*|audio edit\w*|sound design|music production|beatmak\w*|mixing audio|djing|voice[- ]?over)\b/i],
  ['music', /\b(?:music|singing|songwrit\w*|compos(?:e|ing)|saxophone|trumpet|flute|clarinet|harmonica|cello)\b/i],
  ['breakdance', /\b(?:break[ -]?danc\w*|toprock|b[ -]?boying|b[ -]?girling)\b/i],
  ['dance', /\b(?:danc\w*|ballet|salsa|choreograph\w*|(?:latin|irish) danc\w*)\b/i],
  ['code', /\b(?:cod(?:e|ing)|programming|python|javascript|web development|software|spreadsheets?|excel)\b/i],
  ['cooking', /\b(?:cook\w*|chef|culinary|meal prep|knife skills)\b/i],
  ['baking', /\b(?:bak(?:e|er|ery|ing)|sourdough|breadmak\w*|pastry|cake decorat\w*|bread making)\b/i],
  ['coffee', /\b(?:barista|espresso|latte art|coffee brew\w*|pour[- ]over|coffee making)\b/i],
  ['plant', /\b(?:garden\w*|plants?|grow(?:ing)? vegetables|horticulture|bonsai)\b/i],
  ['brush', /\b(?:paint\w*|draw(?:ing)?|illustrat\w*|sketch\w*|watercolou?r)\b/i],
  ['pottery', /\b(?:potter\w*|ceramic\w*|clay sculpt\w*)\b/i],
  ['woodwork', /\b(?:woodwork\w*|whittl\w*|carpentr\w*|wood carv\w*)\b/i],
  ['textiles', /\b(?:knit\w*|crochet\w*|sew\w*|embroider\w*)\b/i],
  ['calligraphy', /\b(?:calligraphy|hand lettering|brush lettering|handwriting)\b/i],
  ['repair', /\b(?:metalwork\w*|welding|blacksmith\w*|mechanics|car repair|diy|home repair|bike repair|fixing appliances)\b/i],
  ['electronics', /\b(?:electronics|solder\w*|robotics|arduino|raspberry pi|circuit design|3d print\w*)\b/i],
  ['design', /\b(?:graphic design|ui design|ux design|figma|typography|logo design|layout design|product design)\b/i],
  ['maths', /\b(?:maths?|mathematics|calculus|algebra|geometry|trigonometry|statistics)\b/i],
  ['science', /\b(?:chemistry|biology|physics|microscopy|lab work|science experiments?)\b/i],
  ['astronomy', /\b(?:astronomy|stargaz\w*|telescope\w*|observational astronomy)\b/i],
  ['finance', /\b(?:budget\w*|saving money|accounting|bookkeeping|personal finance|invest\w*)\b/i],
  ['business', /\b(?:entrepreneur\w*|marketing|sales|leadership|project management|negotiat\w*|job interview\w*)\b/i],
  ['organisation', /\b(?:time management|organis\w*|organiz\w*|planning routines?|productivity|habit track\w*)\b/i],
  ['travel', /\b(?:travel planning|trip planning|navigation|map read\w*|plan(?:ning)? (?:a |my )?(?:trip|holiday))\b/i],
  ['animals', /\b(?:dog train\w*|puppy train\w*|pet care|horse rid\w*|equestrian|dog obedience)\b/i],
  ['beauty', /\b(?:make[- ]?up|hair styl\w*|hairstyl\w*|hairdress\w*|nail art|barber\w*)\b/i],
  ['magic', /\b(?:magic tricks?|sleight of hand|card magic|stage magic|juggling)\b/i],
  ['running', /\b(?:running|marathon|jogging|sprinting)\b/i],
  ['swimming', /\b(?:swim\w*|freestyle stroke)\b/i],
  ['fitness', /\b(?:fitness|strength|weightlift\w*|gymnast\w*|bodybuild\w*|calisthenics|powerlift\w*)\b/i],
  ['origami', /\b(?:origami|paper folding|paper cranes?)\b/i],
  ['chess', /\bchess\b/i],
  ['board', /\b(?:go game|checkers|board games?)\b/i],
  ['speech', /\b(?:public speak\w*|speaking in public|speech|presentations?|debate)\b/i],
  ['language', /\b(?:languages?|spanish|french|german|japanese|korean|mandarin|cantonese|italian|arabic|portuguese|dutch|hindi|tamil|russian|greek|turkish|swedish|welsh|irish|urdu|vietnamese|indonesian|thai|hebrew|ukrainian|latin|asl|bsl|(?:learn\w*|speak\w*|basic|conversational) polish|polish language)\b|^\s*polish\s*$/i],
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
