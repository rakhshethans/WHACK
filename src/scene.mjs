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

function guitarTerrain(stage) {
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
    <path d="M303 337 342 306 390 286 452 267 504 263 565 279 629 306 668 330 676 341 663 354 619 377 552 399 490 408 424 398 361 377 318 355Z" fill="#92ac72" stroke="#a0b575" stroke-width="2"/>
    <path d="M355 351q41-40 111-52 70-16 138 22l26 20-41 30-82 26-101-14Z" fill="#89a968" opacity=".64"/>
    <path d="M488 407q-36-25-23-55 9-14 35-21t41-25M463 354q-23 5-58 1m68-9q30 18 69 10" fill="none" stroke="#d9c18a" stroke-width="7" stroke-linecap="round"/>
    <path d="M488 407q-36-25-23-55 9-14 35-21t41-25M463 354q-23 5-58 1m68-9q30 18 69 10" fill="none" stroke="#f5d6a0" stroke-width="2" stroke-linecap="round"/>
    <path d="m482 406 13 1 10 22-13 4Z" fill="#785b45" stroke="#b38f64" stroke-width="2"/>
    <path d="m485 413 13-1m-10 7 13-2m-11 7 13-2" stroke="#c2a378" stroke-width="1.5"/>
    <path d="m495 440 14-5 10 9-13 8-9-3Z" fill="#cb895b"/><path d="m506 437-1 9m-6-4 11-3" stroke="#f6ddaa"/>
    ${trees.map(([x, y, scale]) => tree(x, y, scale)).join('')}
    ${buildings.join('')}
    ${guitarLandmark(stage)}
    <g fill="#e0c78c" opacity=".9"><circle cx="387" cy="370" r="2"/><circle cx="396" cy="373" r="1.7"/><circle cx="569" cy="363" r="2.1"/><circle cx="576" cy="367" r="1.3"/><circle cx="616" cy="345" r="2"/></g>
    <path d="m470 370 4-7 6 4-2 7Z" fill="#da7750"/><path d="m474 363 3-3m-7 6-2-2m10 1 2-2" stroke="#f8cb7b" stroke-width="1.5" stroke-linecap="round"/>
  </g>`;
}

function guitarLandmark(stage) {
  return `<g class="guitar-landmark" transform="translate(464 286) rotate(-24)">
    <ellipse cy="23" rx="31" ry="11" fill="#183c34" opacity=".45"/>
    <path d="M-9 1C-26-14-32 0-29 15c3 16 16 20 29 17 14 3 27-1 30-17C33 0 27-14 9 1H5v-59h-10V1Z" fill="#9d583c" stroke="#f5cd7e" stroke-width="3"/>
    <circle cy="13" r="6" fill="#472e29" stroke="#e7ae62" stroke-width="2"/>
    <path d="M-2-57v75m4-75v75" stroke="#f9dda3" stroke-width="1.3"/>
    <path d="M-9-61h18l-2 13H-7Z" fill="#7c4a36" stroke="#e2a866" stroke-width="2"/>
    ${stage >= 3 ? '<path d="M-34-20v-15l10-3v15m-10 3c-7-3-9 6-2 6m12-9c-7-3-9 6-2 6" fill="none" stroke="#ffdda3" stroke-width="2.5"/>' : ''}
  </g>`;
}

function songwritingTerrain(stage) {
  return `<g class="wh-island songwriting-terrain">
    <ellipse cx="483" cy="416" rx="210" ry="33" fill="#121e32" opacity=".45"/>
    <path d="m270 358 45-46 83-35 73-35 103 14 92 41 45 48-40 47-114 36-117 9-118-29Z" fill="#b5cad1" opacity=".29"/>
    <path d="m288 351 54-49 98-33 77-17 94 23 77 61-35 44-92 45-110 8-103-29Z" fill="#724e64"/>
    <path d="m288 340 54-49 98-33 77-17 94 23 77 61-35 44-92 45-110 8-103-29Z" fill="#e7a687"/>
    <path d="m348 393 103 29 110-8 92-45 35-44v11l-35 44-92 45-110 8-103-29Z" fill="#a86976"/>
    <path d="m320 337 65-47 129-36 85 25 64 45-31 34-77 38-101 11-89-25Z" fill="#ae7497"/>
    <path d="m356 333 60-37 93-24 82 21 43 31-35 34-64 21-73 6-73-19Z" fill="#d69baa"/>
    <path d="m372 346 31 17 42 13 58 3 59-13 49-30m-221-20 35 24 63 17 63-9 38-20" fill="none" stroke="#f8bf9f" stroke-width="3"/>
    <g transform="translate(488 309)">
      <ellipse cy="28" rx="75" ry="21" fill="#71485c" opacity=".43"/>
      <path d="m-64 0 32-17 32 8 30-13 37 11v34L30 13 0 24l-31-9-33 10Z" fill="#673a57"/>
      <path d="m-64-4 32-17 32 8 30-13 37 11v30L30 5 0 16l-31-9-33 10Z" fill="#fae1b4" stroke="#8e5573" stroke-width="2"/>
      <path d="M0-13v29m-52-14 20-7 23 4m-43 12 20-7 23 4m19-7 20-8 22 5m-42 12 20-8 22 5" fill="none" stroke="#b48286" stroke-width="2"/>
      <path d="M13 2q6-49 61-68-7 28-31 47L21-10Z" fill="#8b416d" stroke="#ffe2ab" stroke-width="2.5"/>
      <path d="M13 2q18-30 49-56" fill="none" stroke="#ffe2ab" stroke-width="2"/>
    </g>
    ${stage >= 2 ? lodge(394,359,.8,'#ac557e') : ''}
    ${stage >= 3 ? '<path d="M528 371q28-26 68-16l15 8q-39 6-57 20Z" fill="#653a5c" stroke="#f4ba9b" stroke-width="3"/>' : ''}
    ${stage >= 4 ? lodge(573,299,.82,'#bd5d87') : ''}
    ${stage >= 5 ? tower(628,329,.84) : ''}
  </g>`;
}

function photographyTerrain(stage) {
  return `<g class="wh-island photography-terrain">
    <ellipse cx="482" cy="408" rx="206" ry="38" fill="#0c233b" opacity=".4"/>
    <path d="m269 350 66-63 130-44 96 17 86 33 64 62-67 46-115 38-117-6-96-33Z" fill="#bbd9de" opacity=".28"/>
    <path d="m293 351 64-61 112-38 94 18 73 31 52 49-53 40-110 39-108-7-92-34Z" fill="#4f637e"/>
    <path d="m293 338 64-61 112-38 94 18 73 31 52 49-53 40-110 39-108-7-92-34Z" fill="#a7c6d3"/>
    <path d="m315 338 49-47 100-39 99 18 59 26 46 43-47 31-98 35-99-10-86-30Z" fill="#6d8ca9"/>
    <path d="m344 337 73-112 20 28 63-77 55 77 30-33 61 105-91 32-75 14Z" fill="#506b8a"/>
    <path d="m344 337 73-112 20 28-19 49-39 27Zm76-17 80-144 55 77-43 72-39 29Z" fill="#849fb8"/>
    <path d="m390 267 27-42 20 28-14 13-9-10-11 14Zm80-35 30-56 36 50-22-3-10 11-13-12-14 17Zm95 42 20-54 27 46-16-3-10 12-10-8Z" fill="#e9eef0"/>
    <path d="m555 345 47-12 19 12-51 20-55 16-32 10" stroke="#ccdce2" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="m325 351 36-19 55 8 17 13-37 17-50-5Z" fill="#4c9eaa" stroke="#b3e4e2" stroke-width="2"/>
    <g transform="translate(510 363)">
      <ellipse cy="12" rx="58" ry="14" fill="#1e3b55" opacity=".47"/>
      <path d="m-46-23 58-15 43 10v26L0 17l-46-13Z" fill="#26394d" stroke="#dae5e5" stroke-width="2"/>
      <path d="m-46-23 58-15 43 10L0-12Z" fill="#a8c2cb"/>
      <path d="m-20-24 3-14 27-6 15 9-2 7Z" fill="#45647d" stroke="#b7d5d9" stroke-width="2"/>
      <ellipse cx="25" cy="-9" rx="15" ry="11" fill="#182c40" stroke="#9bc3d0" stroke-width="3" transform="rotate(-17 25 -9)"/>
      <ellipse cx="26" cy="-10" rx="8" ry="6" fill="#58a3b8" transform="rotate(-17 26 -10)"/>
      <circle cx="27" cy="-13" r="2.6" fill="#f0f6e4"/>
    </g>
    ${stage >= 2 ? lodge(579,322,.8,'#779aaa') : ''}
    ${stage >= 3 ? '<path d="m403 365 16-12 21 7-15 13Z" fill="#e0d8b2" stroke="#fff0c8" stroke-width="2"/>' : ''}
    ${stage >= 4 ? lodge(384,305,.7,'#6d899f') : ''}
    ${stage >= 5 ? tower(612,335,.8) : ''}
  </g>`;
}

const CUSTOM_ICONS = {
  people: '<circle cx="-16" cy="-13" r="8"/><circle cx="16" cy="-13" r="8"/><path d="M-30 15q2-21 14-21T-2 15zm32 0Q4-6 16-6t14 21z"/><path d="m-6-22 6-7 6 7" fill="none"/>',
  board: '<path d="m-30-9 29-16 31 16L0 9z"/><path d="M-30-9v9L0 18 30 0v-9M-15-17l30 17M0-25l30 16M-15 0l30-17M0 9l30-18" fill="none"/>',
  language: '<path d="M-29-20h39q8 0 8 8v13q0 8-8 8H-6l-13 9 2-9h-12q-8 0-8-8v-13q0-8 8-8Z"/><path d="M13-7h16q8 0 8 8v12q0 8-8 8h-7l2 7-11-7h-7q-8 0-8-8v-2" fill="none"/><path d="M-25-9H6m-31 8h22" stroke="#265355"/>',
  origami: '<path d="m-34-10 20 6 14-20 14 20 20-6-11 20-23 9-23-9Z"/><path d="M-14-4 0 19 14-4M-23 10 0-6l23 16" fill="none"/>',
  speaking: '<path d="M-24-12h48v9h-48zM-17-3h34l-5 24h-24z"/><path d="M5-12v-10l12-8" fill="none"/><circle cx="18" cy="-30" r="4"/>',
  compass: '<circle r="25"/><path d="m11-17-4 21-18 13 4-21Z" fill="#e5aa69" stroke="#1d5558"/><circle r="3" fill="#244e52"/>',
};

const COASTLINES = [
  'M248 339 268 300 309 279 336 251 385 246 421 259 456 236 504 246 534 233 568 255 615 251 638 277 690 285 727 318 713 348 733 376 703 402 673 407 649 435 604 431 575 452 530 439 492 451 451 432 407 441 379 421 337 426 310 397 276 385Z',
  'M256 342 268 314 302 302 318 270 351 246 389 250 419 235 458 251 485 233 520 253 566 246 597 262 642 265 664 293 703 300 727 329 715 352 727 371 701 399 667 408 641 433 606 428 576 449 536 435 503 451 467 431 426 442 394 423 360 430 334 410 300 406 279 382Z',
  'M247 343 262 310 298 294 319 268 361 251 397 258 433 236 468 249 505 237 536 256 573 245 601 269 642 259 670 285 706 292 731 326 713 353 731 379 701 401 669 411 646 437 606 427 574 451 536 435 498 453 462 429 426 441 389 418 355 426 328 405 296 408 277 381Z',
  'M252 345 265 313 294 285 333 272 355 245 395 256 430 237 465 253 502 239 530 258 572 248 609 267 646 265 668 291 707 299 728 328 714 352 729 376 704 401 671 408 650 434 612 430 578 450 538 437 500 450 464 431 424 442 389 421 350 429 324 406 293 402 272 380Z',
  'M246 340 264 304 296 292 316 266 352 252 389 258 422 237 461 251 495 235 531 254 570 246 607 263 643 261 670 289 706 296 730 329 714 353 732 381 700 401 670 413 644 437 605 428 574 452 535 436 497 451 461 430 420 441 385 419 348 428 321 405 291 399 273 378Z',
  'M251 344 268 308 302 288 328 260 365 250 399 257 432 237 468 252 507 237 538 257 576 247 611 267 649 262 671 291 706 301 730 331 715 354 729 380 699 403 669 410 647 435 608 430 577 450 539 436 502 451 465 431 427 440 390 420 355 428 325 406 294 404 275 381Z',
  'M247 342 264 305 297 288 321 261 358 250 393 259 427 238 464 252 502 236 535 257 575 245 610 265 649 263 673 291 708 300 730 330 715 355 731 379 701 402 670 411 647 438 607 429 575 452 538 436 500 451 463 430 424 442 389 420 353 429 323 405 293 403 274 379Z',
  'M250 343 264 309 299 291 322 264 359 251 394 258 427 238 466 252 503 237 536 256 575 247 611 265 649 263 672 292 707 300 730 330 714 352 729 379 700 402 670 410 646 436 606 429 575 451 536 436 500 450 463 430 423 441 388 420 353 428 323 405 294 403 274 381Z',
];

const BIOMES = [
  { name: 'reef-cove', shore: '#f4d8a0', rock: '#5d8b82', detail: '#b7e5c8', accent: '#62c3bb' },
  { name: 'pine-highlands', shore: '#ddc99e', rock: '#596a50', detail: '#abc48a', accent: '#809e72' },
  { name: 'sunstone-bay', shore: '#f4d094', rock: '#94705a', detail: '#eedca4', accent: '#d89162' },
  { name: 'misty-marsh', shore: '#c7d2a3', rock: '#506e64', detail: '#b6d0ac', accent: '#79b8a6' },
  { name: 'glacier-coast', shore: '#e0e7dc', rock: '#5e7885', detail: '#d1e9ec', accent: '#9fcdd2' },
  { name: 'volcanic-cliffs', shore: '#d6a785', rock: '#584f55', detail: '#d59b78', accent: '#e5815b' },
  { name: 'wildflower-isle', shore: '#f0d8aa', rock: '#777b57', detail: '#d2d69a', accent: '#d88ba4' },
  { name: 'amber-dunes', shore: '#f0c886', rock: '#8d694a', detail: '#f4dfa8', accent: '#e6aa67' },
];

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return hash >>> 0;
}

function islandScenery(island) {
  const seed = stableHash(`${island.id || ''}|${island.category || ''}|${island.topic || island.title || ''}`);
  const coastIndex = seed % COASTLINES.length;
  const biomeIndex = (seed >>> 8) % BIOMES.length;
  const biome = BIOMES[biomeIndex];
  const coast = COASTLINES[coastIndex];
  const reef = seed & 1
    ? '<path d="m280 387 18-9 14 5-9 7-17 3Zm370-105 12-7 11 5-9 7Z" fill="currentColor" opacity=".65"/>'
    : '<path d="M270 374q18-10 33-4m362 41q15-12 29-10M318 265q11-9 21-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".68"/>';
  const biomeMark = [
    '<path d="M290 356q9-20 19-27m345 25q9-20 19-27" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="311" cy="324" r="3" fill="currentColor"/><circle cx="675" cy="323" r="3" fill="currentColor"/>',
    '<path d="m296 355 8-19 8 19m337 8 8-19 8 19m-326-88 8-19 8 19" fill="currentColor" stroke="currentColor" stroke-linejoin="round" stroke-width="2"/>',
    '<path d="M286 374q18-9 36-3m318 30q19-10 37-6M316 276q16-9 29-4" fill="none" stroke="currentColor" stroke-width="2" opacity=".9"/>',
    '<path d="m290 368 4-16m11 13 1-19m329 32 4-17m12 15 1-20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    '<path d="m289 363 11-14 11 14m330 6 11-14 11 14" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M287 369q16-10 34-5m316 33q17-12 35-9" fill="none" stroke="currentColor" stroke-width="4" opacity=".8"/>',
    '<g fill="currentColor"><circle cx="302" cy="354" r="3"/><circle cx="311" cy="361" r="2"/><circle cx="650" cy="387" r="3"/><circle cx="662" cy="378" r="2.5"/></g>',
    '<path d="M285 377q20-12 40-9m318 33q20-14 40-12m-361-121q13-7 26-4" fill="none" stroke="currentColor" stroke-width="2" opacity=".9"/>',
  ][biomeIndex];
  return `<g class="biome-shoreline" data-biome="${biome.name}" data-coast="${coastIndex}" aria-hidden="true">
    <path d="${coast}" transform="translate(0 9)" fill="#082e3a" opacity=".48"/>
    <path d="${coast}" fill="${biome.shore}" stroke="${biome.detail}" stroke-width="3"/>
    <path d="${coast}" transform="translate(0 5)" fill="none" stroke="${biome.rock}" stroke-width="8" opacity=".52"/>
    <g color="${biome.accent}">${reef}${biomeMark}</g>
  </g>`;
}

function customTerrain(island, stage) {
  let seed = 2166136261;
  for (const character of (island.topic + ' ' + island.objective).toLowerCase()) {
    seed = Math.imul(seed ^ character.codePointAt(0), 16777619);
  }
  const hue = (seed >>> 0) % 360;
  const alternate = (seed & 1) === 1;
  const coast = alternate
    ? 'm280 341 62-43 48-44 105 4 71 26 50-9 55 44 22 38-65 29-80 35-111-5-61-26-58 3Z'
    : 'm277 348 57-24 55-57 82-28 92 21 44 42 65 15 29 33-46 35-55 10-80 37-97-16-49-34-52-3Z';
  const inset = 'm322 345 62-33 36-33 56-19 78 14 41 36 58 20-24 30-76 33-87 7-81-26-49-7Z';
  const icon = Object.hasOwn(CUSTOM_ICONS, island.theme) ? CUSTOM_ICONS[island.theme] : CUSTOM_ICONS.compass;
  return `<g class="wh-island custom-terrain">
    <ellipse cx="484" cy="410" rx="210" ry="36" fill="#142f39" opacity=".4"/>
    <path d="${coast}" fill="hsl(${hue} 30% 36%)" transform="translate(0 12)"/>
    <path d="${coast}" fill="hsl(${hue} 46% 69%)" stroke="hsl(${hue} 46% 81%)" stroke-width="2"/>
    <path d="${inset}" fill="hsl(${hue} 32% 51%)"/>
    <path d="M349 353q83 44 153 29t119-46M378 319q66-45 127-38t79 31" fill="none" stroke="hsl(${hue} 40% 74%)" stroke-width="3" opacity=".67"/>
    <ellipse cx="484" cy="341" rx="67" ry="24" fill="hsl(${hue} 37% 31%)" opacity=".5"/>
    <ellipse cx="484" cy="332" rx="61" ry="22" fill="hsl(${hue} 43% 70%)" stroke="#ffdeb0" stroke-width="2"/>
    <g transform="translate(484 311)" fill="#fff0cc" stroke="#31595a" stroke-width="3" stroke-linejoin="round">${icon}</g>
    ${stage >= 2 ? lodge(408,359,.75,'#cf9670') : ''}
    ${stage >= 3 ? lodge(573,355,.8,'#79a6a2') : ''}
    ${stage >= 4 ? lodge(549,293,.72,'#dbad78') : ''}
    ${stage >= 5 ? tower(620,331,.82) : ''}
  </g>`;
}

function islandTerrain(island, stage) {
  const track = island.category === 'custom' ? island.theme : island.category;
  if (track === 'songwriting') return songwritingTerrain(stage);
  if (track === 'photography') return photographyTerrain(stage);
  if (island.category === 'custom' && track !== 'guitar') return customTerrain(island, stage);
  return guitarTerrain(stage);
}

export function renderIsland(island, stage) {
  const seed = stableHash(`${island.id || ''}|${island.category || ''}|${island.topic || island.title || ''}`);
  const biome = BIOMES[(seed >>> 8) % BIOMES.length];
  const coast = seed % COASTLINES.length;
  return `<svg viewBox="222 165 525 296" aria-hidden="true" focusable="false"><g class="island-biome" data-biome="${biome.name}" data-coast="${coast}">${islandScenery(island)}${islandTerrain(island, stage)}</g></svg>`;
}

const waves = [[114,167],[198,293],[282,203],[359,121],[537,161],[671,224],[813,173],[771,302],[124,424],[227,465],[330,510],[596,484],[720,438],[836,401],[785,511],[413,466],[195,208],[755,115]];

export function renderOcean(backgroundOnly = false) {
  return `<svg class="wh-scene" viewBox="0 0 960 620" xmlns="http://www.w3.org/2000/svg" ${backgroundOnly ? 'aria-hidden="true" preserveAspectRatio="xMidYMid slice"' : `role="img" aria-label="An open ocean awaiting your first island"`}>
    <defs>
      <radialGradient id="wh-sea" cx="50%" cy="42%" r="69%"><stop stop-color="#417f7e"/><stop offset=".6" stop-color="#245959"/><stop offset="1" stop-color="#133740"/></radialGradient>
      <pattern id="wh-grid" width="68" height="40" patternUnits="userSpaceOnUse"><path d="m0 20 34-20 34 20-34 20Z" fill="none" stroke="#cae9d6" stroke-width=".6" opacity=".12"/></pattern>
    </defs>
    <rect width="960" height="620" fill="url(#wh-sea)"/>
    <rect width="960" height="620" fill="url(#wh-grid)" opacity=".6"/>
    <g fill="none" stroke="#99c8b8" opacity=".23"><ellipse cx="481" cy="347" rx="273" ry="103" stroke-dasharray="2 9"/><ellipse cx="481" cy="347" rx="310" ry="129" stroke-dasharray="29 8 3 8"/><ellipse cx="481" cy="347" rx="345" ry="155" opacity=".42"/></g>
    <g fill="none" stroke="#e0f4d3" stroke-width="1.5" opacity=".42">${waves.map(([x, y]) => `<path d="M${x} ${y}q6-3 12 0t12 0m-18 5q6-3 12 0"/>`).join('')}</g>
    <g transform="translate(108 487)" fill="#d8ddad" opacity=".69"><circle r="26" fill="none" stroke="#d8ddad" stroke-width=".7"/><path d="M0-22 4-4 17 0 4 4 0 22-4 4-17 0-4-4Z" fill="none" stroke="#d8ddad"/><path d="M0-22 4-4 0 0Z M0 22-4 4 0 0Z"/><text x="0" y="-34" font-family="sans-serif" font-size="9" text-anchor="middle">N</text></g>
    <path d="M759 219q8-7 14 0 6-7 14 0m-42 10q5-4 9 0 4-4 9 0" fill="none" stroke="#e6efcf" stroke-width="1.4" opacity=".62"/>
    ${backgroundOnly ? '' : '<g opacity=".35" stroke="#c7e3c6" fill="none"><ellipse cx="481" cy="347" rx="102" ry="44" stroke-dasharray="3 5"/><path d="M466 347h30m-15-15v30" stroke-width="1.5"/></g>'}
  </svg>`;
}
