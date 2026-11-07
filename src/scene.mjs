const trees = [[314,335,.8],[345,309,1],[383,292,.7],[405,290,.9],[426,277,.7],[570,292,.85],[601,307,1],[620,325,.8],[644,340,.72],[346,367,.7],[367,378,.92],[575,379,.7],[600,369,.88],[630,357,.68]];

function tree(x, y, scale) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cx="8" cy="2" rx="15" ry="5" fill="#254f41" opacity=".34"/>
    <path d="M-2 1v-24h4V0l-2 3Z" fill="#72563f"/>
    <path d="m0-43-13 24 4-1-9 14L0 1l17-7-9-14 4 1Z" fill="#3c7854"/>
    <path d="m0-43-13 24 4-1-9 14L0 1Z" fill="#7eb06a"/>
    <path d="m0-35-10 18 10 4 10-4Z" fill="#8ebe76"/>
  </g>`;
}

function lodge(x, y, scale, roof = '#c67550') {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="m-27 2 24 13 39-15-24-13Z" fill="#214d42" opacity=".37"/>
    <path d="M-25-23 0-10 26-24V0L0 15-25 1Z" fill="#e8c99a"/>
    <path d="M0-10 26-24V0L0 15Z" fill="#a27456"/>
    <path d="m-30-24 16-19 28-13 17 30L0-9Z" fill="${roof}"/>
    <path d="m-14-43 14 34 31-17-17-30Z" fill="#774536" opacity=".48"/>
    <path d="m-14-43 28-13" stroke="#ffe0a9" stroke-width="1.5" opacity=".7"/>
    <path d="m-18-14 7 4V0l-7-4Z" fill="#4b5b55"/>
    <path d="m-17-12 5 3v6l-5-3Z" fill="#f8c16e"/>
    <path d="m8-7 8-4V5l-8 4Z" fill="#48554e"/>
  </g>`;
}

function tower(x, y, scale) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="m-23 1 24 13 44-15-25-13Z" fill="#214d42" opacity=".4"/>
    <path d="m-19-53 19 10 19-10V2L0 14-19 3Z" fill="#d9cab0"/>
    <path d="M0-43 19-53V2L0 14Z" fill="#77918a"/>
    <path d="m-23-53 23-12 23 12L0-40Z" fill="#f8e2b4"/>
    <path d="m-13-59 13 7 13-7V-81L0-89l-13 8Z" fill="#e1c296"/>
    <path d="m0-52 13-7V-81L0-74Z" fill="#88a8a1"/>
    <path d="m-16-80 16-17 16 17L0-72Z" fill="#b7614f"/>
    <path d="M0-97v-13" stroke="#f3d590" stroke-width="2"/>
    <path d="M0-110q9-3 15 0l-4 6q-6-3-11 0Z" fill="#efb76f"/>
    <path d="m-13-43 6 4v8l-6-4Zm0 15 6 4v8l-6-4Zm0 15 6 4v8l-6-4Z" fill="#496962"/>
    <path d="m7-41 5-3v8l-5 3Zm0 15 5-3v8l-5 3Zm0 15 5-3v8l-5 3Z" fill="#f6c86e"/>
  </g>`;
}

function terrain(stage) {
  const buildings = [
    stage >= 4 ? lodge(536,300,.88,'#7ba9a3') : '',
    stage >= 5 ? tower(495,303,1.12) : '',
    lodge(467,329,1.08),
    stage >= 3 ? lodge(418,352,.87,'#749b9c') : '',
    stage >= 2 ? lodge(529,354,.82,'#d7a457') : '',
  ];
  return `<g class="wh-island">
    <ellipse cx="485" cy="415" rx="220" ry="47" fill="#07282f" opacity=".32"/>
    <path d="M260 348 296 318 354 286 428 259 498 252 571 265 642 291 689 321 715 349 700 376 643 405 560 428 489 436 414 426 341 404 290 377Z" fill="#a5d6b4" opacity=".24" stroke="#b9e6ce" stroke-width="2"/>
    <path d="M280 347 320 314 388 283 451 265 504 262 575 280 642 307 678 333 694 350 681 373 630 400 557 422 490 431 421 420 348 396 303 374Z" fill="#615947"/>
    <path d="M280 338 320 304 388 272 451 255 504 252 575 270 642 297 678 323 694 339 681 360 630 389 557 411 490 419 421 409 348 385 303 363Z" fill="#d3ae74"/>
    <path d="M280 338 303 363 348 385 421 409 490 419 490 431 421 420 348 396 303 374 280 347Z" fill="#9d7956"/>
    <path d="M490 419 557 411 630 389 681 360 694 339 694 350 681 373 630 400 557 422 490 431Z" fill="#82684f"/>
    <path d="M303 337 342 306 390 286 452 267 504 263 565 279 629 306 668 330 676 341 663 354 619 377 552 399 490 408 424 398 361 377 318 355Z" fill="url(#wh-meadow)" stroke="#a0b575" stroke-width="2"/>
    <path d="M355 351q41-40 111-52 70-16 138 22l26 20-41 30-82 26-101-14Z" fill="#89a968" opacity=".64"/>
    <path d="M488 407q-36-25-23-55 9-14 35-21t41-25M463 354q-23 5-58 1m68-9q30 18 69 10" fill="none" stroke="#d9c18a" stroke-width="7" stroke-linecap="round"/>
    <path d="M488 407q-36-25-23-55 9-14 35-21t41-25M463 354q-23 5-58 1m68-9q30 18 69 10" fill="none" stroke="#f5d6a0" stroke-width="2" stroke-linecap="round"/>
    <path d="m482 406 13 1 10 22-13 4Z" fill="#785b45" stroke="#b38f64" stroke-width="2"/>
    <path d="m485 413 13-1m-10 7 13-2m-11 7 13-2" stroke="#c2a378" stroke-width="1.5"/>
    <path d="m495 440 14-5 10 9-13 8-9-3Z" fill="#cb895b"/><path d="m506 437-1 9m-6-4 11-3" stroke="#f6ddaa"/>
    ${trees.map(([x, y, scale]) => tree(x, y, scale)).join('')}
    ${buildings.join('')}
    <g fill="#e0c78c" opacity=".9"><circle cx="387" cy="370" r="2"/><circle cx="396" cy="373" r="1.7"/><circle cx="569" cy="363" r="2.1"/><circle cx="576" cy="367" r="1.3"/><circle cx="616" cy="345" r="2"/></g>
    <path d="m470 370 4-7 6 4-2 7Z" fill="#da7750"/><path d="m474 363 3-3m-7 6-2-2m10 1 2-2" stroke="#f8cb7b" stroke-width="1.5" stroke-linecap="round"/>
  </g>`;
}

const waves = [[114,167],[198,293],[282,203],[359,121],[537,161],[671,224],[813,173],[771,302],[124,424],[227,465],[330,510],[596,484],[720,438],[836,401],[785,511],[413,466],[195,208],[755,115]];

export function renderScene(island, stage) {
  return `<svg class="wh-scene" viewBox="0 0 960 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${island ? 'An island with ' + stage + ' landmarks' : 'An open ocean awaiting your first island'}">
    <defs>
      <radialGradient id="wh-sea" cx="50%" cy="42%" r="69%"><stop stop-color="#417f7e"/><stop offset=".6" stop-color="#245959"/><stop offset="1" stop-color="#133740"/></radialGradient>
      <linearGradient id="wh-meadow" x2=".65" y2="1"><stop stop-color="#b3c484"/><stop offset="1" stop-color="#688e61"/></linearGradient>
      <pattern id="wh-grid" width="68" height="40" patternUnits="userSpaceOnUse"><path d="m0 20 34-20 34 20-34 20Z" fill="none" stroke="#cae9d6" stroke-width=".6" opacity=".12"/></pattern>
    </defs>
    <rect width="960" height="620" fill="url(#wh-sea)"/>
    <rect width="960" height="620" fill="url(#wh-grid)" opacity=".6"/>
    <g fill="none" stroke="#99c8b8" opacity=".23"><ellipse cx="481" cy="347" rx="273" ry="103" stroke-dasharray="2 9"/><ellipse cx="481" cy="347" rx="310" ry="129" stroke-dasharray="29 8 3 8"/><ellipse cx="481" cy="347" rx="345" ry="155" opacity=".42"/></g>
    <g fill="none" stroke="#e0f4d3" stroke-width="1.5" opacity=".42">${waves.map(([x, y]) => `<path d="M${x} ${y}q6-3 12 0t12 0m-18 5q6-3 12 0"/>`).join('')}</g>
    <g transform="translate(108 487)" fill="#d8ddad" opacity=".69"><circle r="26" fill="none" stroke="#d8ddad" stroke-width=".7"/><path d="M0-22 4-4 17 0 4 4 0 22-4 4-17 0-4-4Z" fill="none" stroke="#d8ddad"/><path d="M0-22 4-4 0 0Z M0 22-4 4 0 0Z"/><text x="0" y="-34" font-family="sans-serif" font-size="9" text-anchor="middle">N</text></g>
    <path d="M759 219q8-7 14 0 6-7 14 0m-42 10q5-4 9 0 4-4 9 0" fill="none" stroke="#e6efcf" stroke-width="1.4" opacity=".62"/>
    ${island ? terrain(stage) : '<g opacity=".35" stroke="#c7e3c6" fill="none"><ellipse cx="481" cy="347" rx="102" ry="44" stroke-dasharray="3 5"/><path d="M466 347h30m-15-15v30" stroke-width="1.5"/></g>'}
  </svg>`;
}
