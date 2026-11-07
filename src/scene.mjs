import { knownLandmark } from './island-art.mjs';
import { renderGeneratedIcon } from './generated-icons.mjs';

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

function guitarTerrain(stage, [sand, ground, cliff]) {
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
    <path d="M280 347 320 314 388 283 451 265 504 262 575 280 642 307 678 333 694 350 681 373 630 400 557 422 490 431 421 420 348 396 303 374Z" fill="${cliff}"/>
    <path d="M280 338 320 304 388 272 451 255 504 252 575 270 642 297 678 323 694 339 681 360 630 389 557 411 490 419 421 409 348 385 303 363Z" fill="${sand}"/>
    <path d="M280 338 303 363 348 385 421 409 490 419 490 431 421 420 348 396 303 374 280 347Z" fill="#9d7956"/>
    <path d="M490 419 557 411 630 389 681 360 694 339 694 350 681 373 630 400 557 422 490 431Z" fill="#82684f"/>
    <path d="M303 337 342 306 390 286 452 267 504 263 565 279 629 306 668 330 676 341 663 354 619 377 552 399 490 408 424 398 361 377 318 355Z" fill="${ground}" stroke="${sand}" stroke-width="2"/>
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

function songwritingTerrain(stage, [sand, ground, cliff]) {
  return `<g class="wh-island songwriting-terrain">
    <ellipse cx="483" cy="416" rx="210" ry="33" fill="#121e32" opacity=".45"/>
    <path d="m270 358 45-46 83-35 73-35 103 14 92 41 45 48-40 47-114 36-117 9-118-29Z" fill="#b5cad1" opacity=".29"/>
    <path d="m288 351 54-49 98-33 77-17 94 23 77 61-35 44-92 45-110 8-103-29Z" fill="${cliff}"/>
    <path d="m288 340 54-49 98-33 77-17 94 23 77 61-35 44-92 45-110 8-103-29Z" fill="${sand}"/>
    <path d="m348 393 103 29 110-8 92-45 35-44v11l-35 44-92 45-110 8-103-29Z" fill="#a86976"/>
    <path d="m320 337 65-47 129-36 85 25 64 45-31 34-77 38-101 11-89-25Z" fill="${ground}"/>
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

function photographyTerrain(stage, [sand, ground, cliff]) {
  return `<g class="wh-island photography-terrain">
    <ellipse cx="482" cy="408" rx="206" ry="38" fill="#0c233b" opacity=".4"/>
    <path d="m269 350 66-63 130-44 96 17 86 33 64 62-67 46-115 38-117-6-96-33Z" fill="#bbd9de" opacity=".28"/>
    <path d="m293 351 64-61 112-38 94 18 73 31 52 49-53 40-110 39-108-7-92-34Z" fill="${cliff}"/>
    <path d="m293 338 64-61 112-38 94 18 73 31 52 49-53 40-110 39-108-7-92-34Z" fill="${sand}"/>
    <path d="m315 338 49-47 100-39 99 18 59 26 46 43-47 31-98 35-99-10-86-30Z" fill="${ground}"/>
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

const LANDMARK_ART = {
  ...CUSTOM_ICONS,
  speech: CUSTOM_ICONS.speaking,
  camera: '<path d="M-39-19h21l7-10h23l7 10h20v47h-78Z" fill="#213c55" stroke="#d7edf4"/><path d="M-37-16h74v11h-74Z" fill="#a5c5d5"/><circle cy="5" r="17" fill="#112d42" stroke="#c7e5ea"/><circle cy="5" r="9" fill="#57b3ce"/><path d="m-4 2 6-4" stroke="#effaf2"/>',
  guitar: '<path d="M-6-5 7-31l7 4-12 25c8 6 10 18 0 24-9 5-23-1-25-10-2-9 7-17 17-17Z" fill="#df9e59"/><circle cx="-7" cy="8" r="5" fill="#75472f"/><path d="m-8 16 19-44" fill="none" stroke="#fff0cc"/>',
  music: '<path d="M-13 13v-34l36-8v34m-36-14 36-8" fill="none" stroke="#fff0cc" stroke-width="5"/><ellipse cx="-21" cy="15" rx="11" ry="7"/><ellipse cx="15" cy="7" rx="11" ry="7"/>',
  dance: '<circle cx="6" cy="-26" r="8"/><path d="M4-16-5 2l18 8 8 18m-26-26-12 15-14 3m27-31-15-4-11-10m26 15 18 5 13-9" fill="none" stroke="#fff0cc" stroke-width="7" stroke-linecap="round"/>',
  code: '<path d="M-35-23h70v46h-70Z" fill="#263a58" stroke="#c9e9e6"/><path d="m-12-9-12 9 12 9m24-18 12 9-12 9m-8-20-8 22" fill="none" stroke="#f6e7af" stroke-width="4" stroke-linecap="round"/>',
  cooking: '<path d="M-27-5h54v23l-7 7h-40l-7-7ZM-27 1h-9m63 0h9m-64-9h56M-8-11v-7h16v7" fill="#edbd82"/><path d="M-12-25q-5-6 0-11m17 11q-5-6 0-11" fill="none" stroke="#fff0cc"/>',
  plant: '<path d="M0 22V-13M0 5Q-28 6-29-19-4-20 0 5Zm0-7Q5-28 28-25 24-4 0-2Z" fill="#a5d584"/><path d="M-17 14h34l-6 14h-22Z" fill="#e1ab78"/>',
  brush: '<path d="M-28 18c10 1 8-13 17-14l9 8c-4 13-16 15-26 6Zm17-14L20-30q8-7 12 1L-2 12Z" fill="#e8b677"/><path d="m-11 4 9 8" stroke="#f9e8b5"/>',
  fitness: '<path d="M-25 0h50m-30-13v26m10-13v26m-10-26v26m40-26v26" fill="none" stroke="#fff0cc" stroke-width="6" stroke-linecap="round"/>',
  book: '<path d="M0-14q-19-12-35-6v43q17-5 35 5 18-10 35-5v-43q-16-6-35 6Zm0 0v42" fill="#f4d9a4"/><path d="m-26-9 16 2m-16 8 16 3m20-11 16-2m-16 13 16-3" fill="none"/>',
  film: '<rect x="-31" y="-10" width="62" height="36" rx="4" fill="#7ea6a8"/><path d="m-31-11 57-20 5 12-62 21Z"/><path d="m-19-15 9 8m9-14 9 8m9-14 9 8M-21 10h42m-42 8H7" fill="none"/>',
  piano: '<rect x="-36" y="-22" width="72" height="49" rx="4"/><path d="M-24-20v45m12-45v45M0-20v45m12-45v45m12-45v45" fill="none"/><path d="M-27-22h7V6h-7zm12 0h7V6h-7zm24 0h7V6H9zm12 0h7V6h-7z" fill="#31595a"/>',
  drums: '<path d="M-29-10v27q29 23 58 0v-27Z" fill="#d89771"/><ellipse cy="-10" rx="29" ry="11"/><path d="m-27-5 12 22L0 0l15 17L27-5M-24-30 7-13m16-18L-7-13" fill="none" stroke-linecap="round"/>',
  violin: '<path d="M-6-9c-14-9-23 6-13 11 4 3 1 6-5 8-17 11 6 32 22 19 5-4 9-12 2-17-4-3-3-5 1-6 14-1 17-17 3-19l13-21-7-4Z" fill="#d99d64"/><path d="m-15 20 30-53M-17 11l17 9" fill="none"/>',
  breakdance: '<circle cx="-15" cy="12" r="8"/><path d="m-8 3 17-11 13-21 12 4M9-8 18 4 37 6M-8 3 1 17-5 28M-8 3l-19-8-10 10" fill="none" stroke="#fff0cc" stroke-width="7" stroke-linecap="round"/>',
  pottery: '<path d="M-22-15c0 13-10 20-8 32 2 18 58 18 60 0 2-12-8-19-8-32Z" fill="#d39577"/><ellipse cy="-16" rx="22" ry="8"/><path d="M-27 9q27 14 54 0M-29 18q29 14 58 0" fill="none" stroke="#fff0cc"/>',
  woodwork: '<path d="M-34 7 21-17l6 16-7 9-7-3-5 10-8-3-5 10-8-3-6 9-6-3Z"/><path d="m17-19 13-12 13 8-5 13-13 6Z" fill="#d6a475"/><path d="m29-19 7-4" fill="none"/>',
  textiles: '<circle cx="-4" cy="3" r="23" fill="#db9ca2"/><path d="M-24 0Q-7 10 12-13M-22 13Q1 17 18-4m-31 25q19-2 30-13m-30 17q15 7 33-1l10 3M6-16l19-18m-6 25 15-13" fill="none" stroke-linecap="round"/>',
  running: '<path d="M-29-22h17l12 17 14 7 17 3 5 12H-35v-9l7-10Z" fill="#e2aa73"/><path d="M-35 17h71v7h-71Z"/><path d="m-9-12 9-5m-4 12 10-4M-40-17h-8m9 8h-13" fill="none" stroke="#fff0cc" stroke-linecap="round"/>',
  swimming: '<circle cx="21" cy="-12" r="9"/><path d="m-24 5 21-28 22 9M-26 10l24-7 18 7M-37 13q9-7 18 0t18 0 18 0 18 0m-72 11q9-7 18 0t18 0 18 0 18 0" fill="none" stroke="#fff0cc" stroke-width="5" stroke-linecap="round"/>',
  chess: '<path d="M-25 25h50v-8H-25zm6-8C-19 1 9-8 4-15l-19 8-9-8 23-18 14 3c9 9 12 22 7 47Z"/><circle cx="-5" cy="-20" r="2" fill="#31595a"/>',
};

const LANDFORMS = {
  alpine: {
    coast: 'M251 355 299 298 384 274 433 245 524 244 615 278 684 310 722 354 685 397 602 427 494 442 385 431 306 401Z',
    colors: ['#dae9da', '#7e9d9c', '#587486'],
    feature: '<path d="M315 328 385 212 424 270 482 181 550 280 591 226 663 329 556 349 429 340Z" fill="#718fa6"/><path d="m385 212 39 58-34-13-16 15-20-6Zm97-31 48 70-36-12-17 15-31-19Zm109 45 37 54-33-12-15 9-15-9Z" fill="#eaf3e9"/>',
  },
  cove: {
    coast: 'M250 349Q256 292 351 264T560 254Q670 263 711 311L652 304Q598 313 613 348T713 377Q679 425 556 439T334 416Q254 394 250 349Z',
    colors: ['#f4d394', '#74ae91', '#697d61'],
    feature: '<path d="M636 325q45-14 69 5m-71 29q38 18 75 4" fill="none" stroke="#8bddd0" stroke-width="4" stroke-linecap="round"/><path d="M289 362q50 26 84 22m-46-88q34-19 70-23" fill="none" stroke="#e0e9b8" stroke-width="6"/>',
  },
  forest: {
    coast: 'M262 353Q278 304 342 299 352 264 409 248 453 231 499 258 576 231 639 275 692 295 712 342 727 376 666 399 634 436 550 424 474 448 407 429 316 424 262 353Z',
    colors: ['#b9d48d', '#6c9a69', '#52705c'],
    feature: [[333,326,1.15],[375,292,.9],[417,274,1.05],[560,283,1.15],[606,310,.95],[654,346,1.25],[346,369,.7]].map(args => tree(...args)).join(''),
  },
  mesa: {
    coast: 'M262 340 287 305 373 270 460 264 513 237 616 257 696 303 720 341 693 390 619 414 568 412 492 435 395 417 326 395Z',
    colors: ['#efbf94', '#bf886a', '#825d5e'],
    feature: '<path d="m319 322 74-33 62 5 58-30 84 12 56 33-54 21-85-5-63 18-78-10Z" fill="#d7a57e" stroke="#efc9a0" stroke-width="4"/><path d="m313 371 81 31 94 14 73-21 61-3 72-28m-350-43 75-20m151-11 68 26" fill="none" stroke="#f4cfa4" stroke-width="5" opacity=".72"/>',
  },
  archipelago: {
    coast: 'M316 336 356 294 433 260 510 255 580 273 649 310 663 353 618 396 551 425 465 432 384 405 331 375Z',
    colors: ['#c9ddd7', '#73a6a2', '#536982'],
    feature: '<path d="M243 334 268 316 309 317 330 338 302 362 265 358ZM645 384l28-20 39 3 22 20-35 23-32-2ZM591 246l27-19 36 4 17 16-27 17-32 1Z" fill="#aacdc3" stroke="#d2e8d7" stroke-width="4"/><path d="M272 338l15-9 18 7m357 51 20-10 29 8m-100-139 21-9 19 8" fill="none" stroke="#6d9d93" stroke-width="6"/>',
  },
  dunes: {
    coast: 'M242 356Q285 310 354 305 418 298 436 254 510 225 589 263 625 281 629 313 695 320 730 357 680 414 607 418 565 418 529 436 460 450 403 417 297 423 242 356Z',
    colors: ['#f4cf86', '#dba96c', '#996754'],
    feature: '<path d="M300 354q83-23 137-67t139-3m-215 85q82-3 139-50t128 12m-157 70q88-6 131-34t80-6" fill="none" stroke="#f5dba1" stroke-width="7" stroke-linecap="round"/>',
  },
};

const THEMED_LANDFORMS = {
  camera: ['alpine', 'mesa'], guitar: ['forest', 'cove'], music: ['mesa', 'dunes'],
  dance: ['dunes', 'cove'], code: ['archipelago', 'mesa'], cooking: ['cove', 'forest'],
  plant: ['forest', 'cove'], brush: ['dunes', 'mesa'], fitness: ['alpine', 'forest'],
  origami: ['archipelago', 'cove'], board: ['mesa', 'archipelago'], speech: ['mesa', 'cove'],
  language: ['archipelago', 'cove'], people: ['cove', 'forest'], book: ['forest', 'alpine'],
  film: ['alpine', 'mesa'], piano: ['mesa', 'dunes'], drums: ['mesa', 'dunes'], violin: ['mesa', 'dunes'],
  breakdance: ['dunes', 'cove'], pottery: ['mesa', 'dunes'], woodwork: ['forest', 'cove'],
  textiles: ['cove', 'forest'], running: ['alpine', 'forest'], swimming: ['archipelago', 'cove'], chess: ['mesa', 'archipelago'],
};

const PALETTES = [
  ['sage', '#d8e0ac', '#7eae83', '#566d62'],
  ['lagoon', '#c8e1d0', '#65aaa4', '#426e78'],
  ['amber', '#f6d69b', '#d5a15f', '#88654f'],
  ['lavender', '#ded5e8', '#a295bb', '#665e81'],
  ['clay', '#f1c6a2', '#c88576', '#855c5d'],
  ['slate', '#d2e2e5', '#7d9fba', '#4e6480'],
  ['moss', '#dfe0a7', '#a0a769', '#657451'],
  ['rose', '#eed0c8', '#c690a6', '#7c5e74'],
];

function blendTerrain(base, palette) {
  return base.map((color, index) => {
    const accent = palette[index + 1];
    const channels = [1, 3, 5].map(offset => {
      const a = parseInt(color.slice(offset, offset + 2), 16);
      const b = parseInt(accent.slice(offset, offset + 2), 16);
      return Math.round(a * .25 + b * .75);
    });
    return `rgb(${channels.join(' ')})`;
  });
}

function topicSeal(island) {
  const topic = String(island.topic || island.title || '').normalize('NFC').toLowerCase();
  const words = (topic.match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(word => !['a', 'an', 'i', 'to', 'the', 'learn', 'how', 'want', 'improve', 'practice', 'practise'].includes(word));
  const initials = words.length > 1
    ? words.slice(0, 2).map(word => [...word][0]).join('')
    : [...(words[0] ?? '')].slice(0, 2).join('');
  const letters = (initials.toUpperCase().match(/[\p{L}\p{N}]/gu) ?? []).slice(0, 2).join('');
  const seed = stableHash(words.join(' ') || topic);
  const engraving = Array.from({ length: 5 }, (_, index) => {
    const point = (seed >>> (index * 5)) & 31;
    const angle = point * Math.PI / 16;
    return `<circle cx="${(Math.cos(angle) * 23).toFixed(1)}" cy="${(Math.sin(angle) * 23).toFixed(1)}" r="2"/>`;
  }).join('');
  return `<g class="topic-seal">
    <circle r="31" fill="#ebcf9e"/><circle r="26" fill="#f9e8bb" stroke-width="1.5"/>
    <g fill="#31595a" stroke="none">${engraving}<text text-anchor="middle" y="8" font-size="22" font-family="system-ui, sans-serif" font-weight="800">${letters || '✦'}</text></g>
  </g>`;
}

function landmarkArt(island, landmark) {
  if (!landmark || landmark === 'compass') return topicSeal(island);
  return LANDMARK_ART[landmark];
}

function themedTerrain(island, stage, palette, icon) {
  const { landmark: savedLandmark } = island;
  const known = knownLandmark(island);
  const generated = !knownLandmark({ topic: island.topic }) && renderGeneratedIcon(icon);
  const landmark = known ?? savedLandmark;
  const choices = Object.hasOwn(THEMED_LANDFORMS, savedLandmark) ? THEMED_LANDFORMS[savedLandmark] : Object.keys(LANDFORMS);
  const seed = stableHash(`${island.id}|${island.topic ?? island.title}`);
  const landform = choices[seed % choices.length];
  const { coast, colors, feature } = LANDFORMS[landform];
  const [sand, ground, cliff] = blendTerrain(colors, palette);
  return `<g class="wh-island themed-terrain" data-landform="${landform}" data-landmark="${landmark}">
    <path d="${coast}" transform="translate(0 15)" fill="#163c4b" opacity=".55"/>
    <path d="${coast}" transform="translate(0 9)" fill="${cliff}"/>
    <path d="${coast}" fill="${sand}" stroke="#e6ecc6" stroke-width="3"/>
    <path d="${coast}" transform="translate(484 342) scale(.9 .8) translate(-484 -342)" fill="${ground}"/>
    ${feature}
    ${stage >= 2 ? lodge(388,357,.68) : ''}
    ${stage >= 3 ? lodge(560,363,.7,'#8ab3ac') : ''}
    ${stage >= 4 ? lodge(415,395,.6,'#d4aa68') : ''}
    ${stage >= 5 ? tower(579,304,.72) : ''}
    <ellipse cx="485" cy="337" rx="61" ry="19" fill="${cliff}" opacity=".72"/>
    <ellipse cx="485" cy="329" rx="60" ry="19" fill="${sand}" stroke="#fff0cc" stroke-width="2.5"/>
    <g transform="translate(485 291) scale(1.25)" fill="#fff0cc" stroke="#31595a" stroke-width="3" stroke-linejoin="round">
      ${generated || landmarkArt(island, landmark)}
      ${!generated && !known && landmark !== 'compass' ? `<g transform="translate(43 20) scale(.4)">${topicSeal(island)}</g>` : ''}
    </g>
  </g>`;
}

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

function islandScenery(island, palette) {
  const seed = stableHash(`${island.id || ''}|${island.category || ''}|${island.topic || island.title || ''}`);
  const coastIndex = seed % COASTLINES.length;
  const biomeIndex = (seed >>> 8) % BIOMES.length;
  const biome = BIOMES[biomeIndex];
  const [shore, , rock] = blendTerrain([biome.shore, biome.detail, biome.rock], palette);
  const coast = COASTLINES[coastIndex];
  return `<g class="biome-shoreline" data-biome="${biome.name}" data-coast="${coastIndex}" aria-hidden="true">
    <path d="${coast}" transform="translate(0 9)" fill="#082e3a" opacity=".48"/>
    <path d="${coast}" fill="${shore}" stroke="${biome.detail}" stroke-width="3"/>
    <path d="${coast}" transform="translate(0 5)" fill="none" stroke="${rock}" stroke-width="8" opacity=".52"/>
  </g>`;
}

function islandBiomeDetails(island) {
  const seed = stableHash(`${island.id || ''}|${island.category || ''}|${island.topic || island.title || ''}`);
  const biomeIndex = (seed >>> 8) % BIOMES.length;
  const details = [
    '<ellipse cx="307" cy="370" rx="25" ry="10" fill="#52c4bd" stroke="#d0f2d0" stroke-width="3"/><path d="m294 367 13-4 11 3m334 10 23-9 13 6-21 10Z" fill="#62c3bb" stroke="#d0f2d0" stroke-width="3"/>',
    '<path d="m286 362 13-32 13 32Zm31 6 12-29 12 29Zm317-2 13-34 13 34Zm34 4 12-27 12 27Z" fill="#52734e" stroke="#c4d39b" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M281 379q22-18 48-12m300 47q25-20 52-12M310 271q20-18 44-14" fill="none" stroke="#e9c58c" stroke-width="5" stroke-linecap="round"/><path d="m637 296 5-23 9 14 13-19" fill="none" stroke="#d89162" stroke-width="4"/>',
    '<path d="m286 372 1-24m10 20 5-31m-2 35 12-26m326 45 3-28m8 23 8-34m-1 39 12-24" stroke="#8fc2a4" stroke-width="4" stroke-linecap="round"/><path d="M296 397q22-9 40-5m284 16q21-11 39-8" fill="none" stroke="#70a89a" stroke-width="4"/>',
    '<path d="M280 390q26-13 51-7m299 17q26-13 53-9m-364-111q20-13 40-9" fill="none" stroke="#d6edf0" stroke-width="4" stroke-linecap="round"/><circle cx="316" cy="385" r="5" fill="#a3d9df"/><circle cx="648" cy="406" r="5" fill="#a3d9df"/>',
    '<path d="m585 329 25-44 17 16 23-39 25 68-29 17-31-5Z" fill="#574b52" stroke="#dc9a72" stroke-width="3"/><path d="m614 297 13 13 20-33 13 42m-50 3 10 4 10-6" fill="none" stroke="#ed9667" stroke-width="4" stroke-linecap="round"/>',
    '<g stroke="#708153" stroke-width="3" stroke-linecap="round"><path d="m295 378 6-20m-6 20-8-9m8 9 9-10m339 20 5-19m-5 19-8-9m8 9 10-11"/></g><g fill="#e1a0b1" stroke="#fff0cf" stroke-width="2"><circle cx="301" cy="355" r="6"/><circle cx="641" cy="376" r="6"/></g>',
    '<path d="M280 382q25-15 51-8m295 37q26-18 53-12m-365-119q19-13 41-8" fill="none" stroke="#f1d08d" stroke-width="5" stroke-linecap="round"/><path d="M285 391q23-11 43-7m299 37q22-13 46-11" fill="none" stroke="#fff0c0" stroke-width="2" stroke-linecap="round"/>',
  ][biomeIndex];
  return `<g class="biome-details" aria-hidden="true">${details}</g>`;
}

function customTerrain(island, stage, [, sand, ground, cliff], generatedIcon) {
  const seed = stableHash((island.topic + ' ' + island.objective).toLowerCase());
  const alternate = (seed & 1) === 1;
  const coast = alternate
    ? 'm280 341 62-43 48-44 105 4 71 26 50-9 55 44 22 38-65 29-80 35-111-5-61-26-58 3Z'
    : 'm277 348 57-24 55-57 82-28 92 21 44 42 65 15 29 33-46 35-55 10-80 37-97-16-49-34-52-3Z';
  const inset = 'm322 345 62-33 36-33 56-19 78 14 41 36 58 20-24 30-76 33-87 7-81-26-49-7Z';
  const landmark = knownLandmark(island);
  const generated = !knownLandmark({ topic: island.topic }) && renderGeneratedIcon(generatedIcon);
  const icon = generated || (landmark ? landmarkArt(island, landmark)
    : island.theme !== 'compass' && Object.hasOwn(CUSTOM_ICONS, island.theme) ? CUSTOM_ICONS[island.theme] : topicSeal(island));
  return `<g class="wh-island custom-terrain">
    <ellipse cx="484" cy="410" rx="210" ry="36" fill="#142f39" opacity=".4"/>
    <path d="${coast}" fill="${cliff}" transform="translate(0 12)"/>
    <path d="${coast}" fill="${sand}" stroke="#e6ecc6" stroke-width="2"/>
    <path d="${inset}" fill="${ground}"/>
    <path d="M349 353q83 44 153 29t119-46M378 319q66-45 127-38t79 31" fill="none" stroke="${sand}" stroke-width="3" opacity=".67"/>
    <ellipse cx="484" cy="341" rx="67" ry="24" fill="${cliff}" opacity=".5"/>
    <ellipse cx="484" cy="332" rx="61" ry="22" fill="${sand}" stroke="#ffdeb0" stroke-width="2"/>
    <g transform="translate(484 311)" fill="#fff0cc" stroke="#31595a" stroke-width="3" stroke-linejoin="round">${icon}</g>
    ${stage >= 2 ? lodge(408,359,.75,'#cf9670') : ''}
    ${stage >= 3 ? lodge(573,355,.8,'#79a6a2') : ''}
    ${stage >= 4 ? lodge(549,293,.72,'#dbad78') : ''}
    ${stage >= 5 ? tower(620,331,.82) : ''}
  </g>`;
}

function islandTerrain(island, stage, palette, icon) {
  const track = island.category === 'custom' ? island.theme : island.category;
  if (track === 'songwriting') return songwritingTerrain(stage, blendTerrain(['#e7a687', '#ae7497', '#724e64'], palette));
  if (track === 'photography') return photographyTerrain(stage, blendTerrain(['#a7c6d3', '#6d8ca9', '#4f637e'], palette));
  if (island.category === 'custom' && (icon || track !== 'guitar')) return customTerrain(island, stage, palette, icon);
  return guitarTerrain(stage, blendTerrain(['#d3ae74', '#92ac72', '#615947'], palette));
}

function laterBuildings(stage) {
  if (stage < 6) return '';
  return `<g class="late-stage-buildings" data-stage="${stage}">
    ${lodge(360,375,.62,'#659d9d')}
    ${stage >= 7 ? lodge(594,384,.67,'#ddb16a') : ''}
    ${stage >= 8 ? tower(414,362,.75) : ''}
    ${stage >= 9 ? `<path d="m438 394 32 12 39-12v-12l-39 12-32-12Z" fill="#bbc6b0" stroke="#617a73" stroke-width="2"/>${tower(444,388,.55)}${tower(506,388,.55)}` : ''}
    ${stage === 10 ? `<path d="m477 338 14 19-14 19-14-19Z" fill="#ffe2a0" stroke="#8c6740" stroke-width="2"/><path d="M477 345v24m-8-12h16" stroke="#fff8e2" stroke-width="2"/>` : ''}
  </g>`;
}

export function renderIsland(island, stage, icon) {
  const buildings = laterBuildings(stage);
  const seed = stableHash(`${island.id || ''}|${island.category || ''}|${island.topic || island.title || ''}`);
  const palette = PALETTES[(stableHash(`palette|${seed}`) >>> 16) % PALETTES.length];
  const open = `<svg viewBox="222 165 525 296" aria-hidden="true" focusable="false" data-palette="${palette[0]}">`;
  if (typeof island.landmark === 'string' && Object.hasOwn(LANDMARK_ART, island.landmark)) {
    return `${open}${themedTerrain(island, stage, palette, icon)}${buildings}</svg>`;
  }
  const biome = BIOMES[(seed >>> 8) % BIOMES.length];
  const coast = seed % COASTLINES.length;
  return `${open}<g class="island-biome" data-biome="${biome.name}" data-coast="${coast}">${islandScenery(island, palette)}${islandTerrain(island, stage, palette, icon)}${islandBiomeDetails(island)}${buildings}</g></svg>`;
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
