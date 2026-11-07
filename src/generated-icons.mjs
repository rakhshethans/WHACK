const coord = '(?:[0-5]?[0-9]|6[0-4])';
const coordinates = count => ` *${coord}(?:[ ,]+${coord}){${count - 1}}`;
const pathPattern = new RegExp(`^M${coordinates(2)}(?: *L${coordinates(2)}| *Q${coordinates(4)}| *C${coordinates(6)})+(?: *Z)?$`);
const colours = { cream: '#fff0cc', amber: '#e4b375', teal: '#9bc5ba', line: 'none' };

export const iconSchema = {
  type: 'object',
  required: ['reuse', 'family', 'aliases', 'paths'],
  properties: {
    reuse: { type: 'integer', minimum: -1, maximum: 23 },
    family: { type: 'string', maxLength: 40 },
    aliases: { type: 'array', maxItems: 5, items: { type: 'string', maxLength: 60 } },
    paths: {
      type: 'array', maxItems: 6,
      items: {
        type: 'object', required: ['d', 'colour'],
        properties: { d: { type: 'string', maxLength: 160 }, colour: { type: 'string', enum: Object.keys(colours) } },
      },
    },
  },
};

export function iconTopicKey(topic) {
  return String(topic ?? '').normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    .replace(/^(?:i want to )?(?:learn(?: how to)?|practice|practise|improve(?: my)?|get better at) /, '')
    .replace(/\b([a-z]{3,}[^s ])s\b/g, '$1').slice(0, 120);
}

function iconPaths(paths) {
  return Array.isArray(paths) && paths.length > 0 && paths.length <= 6 && paths.every(path =>
    typeof path?.d === 'string' && path.d.length <= 160 && pathPattern.test(path.d) && Object.hasOwn(colours, path.colour));
}

export function iconForTopic(library, topic) {
  const key = iconTopicKey(topic);
  return key && library.find(icon => Array.isArray(icon?.aliases) && icon.aliases.includes(key) && iconPaths(icon.paths));
}

export function iconCandidates(library) {
  return library.filter(icon => typeof icon?.family === 'string' && icon.family.length <= 40 &&
    Array.isArray(icon.aliases) && iconPaths(icon.paths)).slice(-24);
}

export function storeGeneratedIcon(library, topic, suggestion, candidates) {
  if (!suggestion || iconForTopic(library, topic)) return library;
  const key = iconTopicKey(topic);
  if (!key) return library;
  const { reuse, family, paths, aliases } = suggestion;
  if (Number.isInteger(reuse) && reuse >= 0) {
    const match = candidates[reuse];
    if (!match || !library.includes(match)) return library;
    return library.map(icon => icon === match ? { ...icon, aliases: [...icon.aliases, key] } : icon);
  }
  if (reuse !== -1 || typeof family !== 'string' || !family.trim() || family.length > 40 || !iconPaths(paths)) return library;
  const related = Array.isArray(aliases) ? aliases.slice(0, 5)
    .filter(alias => typeof alias === 'string' && alias.length <= 60).map(iconTopicKey) : [];
  return [...library, {
    family: family.trim(),
    aliases: [...new Set([key, iconTopicKey(family), ...related].filter(Boolean))],
    paths: paths.map(({ d, colour }) => ({ d, colour })),
  }];
}

export function renderGeneratedIcon(icon) {
  if (!iconPaths(icon?.paths)) return '';
  return `<g class="generated-landmark" transform="translate(-32 -32)" stroke="#31595a" stroke-width="3"
    stroke-linecap="round" stroke-linejoin="round">${icon.paths.map(({ d, colour }) =>
      `<path d="${d}" fill="${colours[colour]}"/>`).join('')}</g>`;
}
