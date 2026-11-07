import { createWorld, createIsland, completeGoal, getActiveGoal, getStage, adoptIsland } from './world.mjs';
import { renderOcean, renderIsland } from './scene.mjs';
import { SKILLS } from './roadmaps.mjs';

const app = document.querySelector('#app');
const dialog = document.querySelector('#onboarding');
const form = document.querySelector('#island-form');
const worldTab = document.querySelector('#world-tab');
const exploreTab = document.querySelector('#explore-tab');
const announcement = document.querySelector('#announcement');
const storageKey = 'worldhopper-world-v1';
const skillField = form.elements.category;
const titleField = form.elements.title;
const objectiveField = form.elements.objective;

function loadWorld() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved?.islands) && saved.islands.every(island => Array.isArray(island.goals))) {
      return saved;
    }
  } catch {
    // A blocked browser store or an invalid record can be replaced by a fresh world.
  }
  return createWorld();
}

let world = loadWorld();
let selectedId = world.islands[0]?.id;
let activeView = 'world';
let activeDemo = 0;
let storageUnavailable = false;
let animateIsland = false;

const demoIslands = [
  { title: 'The Chord Coast', category: 'guitar', objective: 'Play a song from start to finish', creator: 'Maya Chen', xp: 250, experience: 'beginner', minutes: 20 },
  { title: 'Verse Dunes', category: 'songwriting', objective: 'Write and record an original song', creator: 'Noah Silva', xp: 500, experience: 'intermediate', minutes: 30 },
  { title: 'Silver Lens', category: 'photography', objective: 'Make a portfolio of mountain landscapes', creator: 'Ari Patel', xp: 250, experience: 'beginner', minutes: 20 },
].map((demo, index) => ({
  ...demo,
  source: { ...createIsland(createWorld(), demo).islands[0], id: String(index), attribution: demo.creator, xp: demo.xp },
}));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function persist(nextWorld) {
  world = nextWorld;
  try {
    localStorage.setItem(storageKey, JSON.stringify(world));
  } catch {
    storageUnavailable = true;
  }
}

function announce(message) {
  announcement.textContent = message;
}

function changeView(view) {
  activeView = view;
  render();
}

function emptyMap() {
  return `<section class="map-frame" aria-label="Island map">
    <div class="map-coordinates"><span>✦</span> 07° 24′ N &nbsp; / &nbsp; 48° 12′ W</div>
    <div class="map-art">${renderOcean()}</div>
    <div class="map-footer"><span><i></i> UNCHARTED WATERS</span><span class="map-scale">└────┘ <b>1 NM</b></span></div>
  </section>`;
}

function archipelagoMap(islands, selection, explore = false) {
  if (!islands.length) return emptyMap();
  return `<section class="map-frame archipelago-frame" aria-label="Archipelago map">
    <div class="map-water">${renderOcean(true)}</div>
    <div class="map-coordinates"><span>✦</span> ${explore ? 'SAMPLE ARCHIPELAGO' : 'MY ARCHIPELAGO'}</div>
    <div class="archipelago-grid${islands.length === 1 ? ' single-island' : ''}">
      ${islands.map(island => {
        const selected = island.id === selection;
        const { level } = getStage(island.xp);
        const skill = Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill';
        return `<button type="button" class="map-island${selected && animateIsland ? ' animate-island' : ''}"
          data-action="${explore ? 'demo' : 'select'}" data-id="${escapeHtml(island.id)}" aria-pressed="${selected}">
          <span class="island-art">${renderIsland(island, level)}</span>
          <span class="island-pin"><strong>${escapeHtml(island.title)}</strong><small>${skill} · Lv ${level}</small></span>
        </button>`;
      }).join('')}
    </div>
    <div class="map-footer"><span><i></i> ${islands.length} ${islands.length === 1 ? 'ISLAND' : 'ISLANDS'} CHARTED</span><span class="map-scale">SELECT AN ISLAND</span></div>
  </section>`;
}

function roadmapSummary(island) {
  if (!island.roadmap) return '';
  return `<details class="roadmap-summary"><summary>Long-term plan</summary>
    ${island.objective ? `<p><strong>Your ambition</strong><span>${escapeHtml(island.objective)}</span></p>` : ''}
    <p><strong>Focus</strong><span>${escapeHtml(island.roadmap.focus)}</span></p>
    <p><strong>Roadmap checkpoint</strong><span>${escapeHtml(island.roadmap.checkpoint)}</span></p>
    ${island.roadmap.next ? `<p><strong>Beyond this roadmap</strong><span>${escapeHtml(island.roadmap.next)}</span></p>` : ''}
  </details>`;
}

function goalMarkup(goal, number) {
  if (!goal) return '<p>Complete the prerequisite for the next practice goal.</p>';
  return `<section class="active-goal" aria-labelledby="active-goal-title">
    <div class="goal-card-top"><p class="eyebrow">CURRENT GOAL / ${number}</p><span class="goal-reward">+${escapeHtml(goal.xp)} XP</span></div>
    <h3 id="active-goal-title">${escapeHtml(goal.title)}</h3>
    <p>${escapeHtml(goal.description)}</p>
    ${goal.finish ? `<p class="goal-finish"><strong>Done when</strong> ${escapeHtml(goal.finish)}</p>` : ''}
    <p class="goal-meta">${escapeHtml(goal.minutes)} MIN${goal.finish ? ' / SESSION' : ''}</p>
    <button class="primary" data-action="complete" data-id="${escapeHtml(goal.id)}">Complete goal <span aria-hidden="true">✓</span></button>
  </section>`;
}

function currentWorld() {
  const island = world.islands.find(item => item.id === selectedId) ?? world.islands[0];
  const stage = getStage(island?.xp ?? 0);
  const activeGoal = island && getActiveGoal(island);
  const goalsCompleted = island?.goals.filter(goal => goal.completed).length ?? 0;
  const levelXp = (island?.xp ?? 0) - stage.threshold;
  const levelTarget = stage.nextThreshold - stage.threshold;
  const subheading = island ? 'Select any island on the map to see its roadmap and progress.' :
    'Choose a skill you want to develop. As you practise, its island grows.';
  return `<div class="intro"><div><p class="eyebrow">THE PERSONAL ATLAS / MY WORLD</p><h1>Your archipelago<span>.</span></h1><p class="lede">${subheading}</p></div>
    <button class="primary" data-action="new">+ New island</button></div>
    <div class="workspace">${archipelagoMap(world.islands, island?.id)}
      <aside class="field-notes">
        ${island ? `<p class="eyebrow">ISLAND LOG / LEVEL ${stage.level}</p>
          <h2>${escapeHtml(island.title)}</h2>${island.attribution ? `<p class="caption">Roadmap by ${escapeHtml(island.attribution)}</p>` : ''}<p class="stage-name">${escapeHtml(stage.name)} · ${island.xp} XP</p>
          <progress value="${levelXp}" max="${levelTarget}" aria-label="XP toward Level ${stage.level + 1}"></progress>
          <p class="caption">${levelXp} / ${levelTarget} XP toward Level ${stage.level + 1}</p>
          ${goalMarkup(activeGoal, goalsCompleted + 1)}
          ${roadmapSummary(island)}` :
          `<p class="eyebrow">ISLAND LOG / 00</p><h2>Open waters</h2>
          <p>Choose a skill, an objective and how much practice time you have.</p>
          <button class="small-action" data-action="new">Chart your first island ↗</button>`}
      </aside></div>`;
}

function discoverWorlds() {
  const demo = demoIslands[activeDemo];
  const stage = getStage(demo.xp);
  return `<div class="intro"><div><p class="eyebrow">THE PERSONAL ATLAS / EXPLORE</p><h1>Beyond your shore<span>.</span></h1>
    <p class="lede">Explore sample worlds and bring a roadmap back to your own.</p></div></div>
    <div class="workspace">${archipelagoMap(demoIslands.map(item => item.source), demo.source.id, true)}
      <aside class="field-notes"><p class="eyebrow">PUBLIC ATLAS / SAMPLE PROFILE</p><h2>${escapeHtml(demo.title)}</h2>
      <p class="stage-name">${escapeHtml(demo.creator)} · Level ${stage.level}</p>
      <p>${escapeHtml(demo.objective)}.</p>
      <p><strong>First goal</strong><br>${escapeHtml(getActiveGoal(demo.source)?.title)}</p>
      <button class="primary" data-action="adopt">Adopt roadmap <span aria-hidden="true">↗</span></button>
      <p class="caption">Your island starts at Level 1. The original roadmap keeps its attribution.</p></aside></div>`;
}

function render() {
  worldTab.setAttribute('aria-pressed', String(activeView === 'world'));
  exploreTab.setAttribute('aria-pressed', String(activeView === 'explore'));
  app.innerHTML = (activeView === 'world' ? currentWorld() : discoverWorlds()) +
    (storageUnavailable ? '<p class="storage-note">This browser blocked storage. Progress is available until you close or reload the page.</p>' : '') +
    '<footer><span>WORLDHOPPER</span><span>WARWICKHACK 2026 / NEW WORLDS</span></footer>';
  animateIsland = false;
}

worldTab.addEventListener('click', () => changeView('world'));
exploreTab.addEventListener('click', () => changeView('explore'));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === 'new') {
    updateSkillHints();
    dialog.showModal();
    return;
  }
  if (action === 'select') selectedId = id;
  if (action === 'demo') activeDemo = Number(id);
  if (action === 'complete') {
    const island = world.islands.find(item => item.id === selectedId);
    if (!island) return;
    const goal = getActiveGoal(island);
    const next = completeGoal(world, island.id, id);
    if (next === world) return;
    const updated = next.islands.find(item => item.id === island.id);
    const newLevel = getStage(updated.xp).level;
    persist(next);
    animateIsland = newLevel > getStage(island.xp).level;
    const reward = goal.xp + ' XP earned. ';
    announce(reward + (animateIsland ? 'Island advanced to Level ' + newLevel + '. ' : '') + 'Next goal ready.');
  }
  if (action === 'adopt') {
    const demo = demoIslands[activeDemo];
    persist(adoptIsland(world, demo.source));
    selectedId = world.islands.at(-1).id;
    activeView = 'world';
    animateIsland = true;
    announce(demo.title + ' added to your world.');
  }
  render();
  const nextFocus = action === 'select' || action === 'demo' ?
    app.querySelector('[data-action="' + action + '"][aria-pressed="true"]') :
    app.querySelector(action === 'complete' ? '#active-goal-title' : '.field-notes h2');
  if (nextFocus) {
    if (nextFocus.matches('h2, h3')) nextFocus.tabIndex = -1;
    nextFocus.focus({ preventScroll: true });
  }
});

function updateSkillHints() {
  const skill = SKILLS[skillField.value];
  titleField.placeholder = 'e.g. ' + skill.label + ' Island';
  objectiveField.placeholder = skill.objective;
}

skillField.addEventListener('change', updateSkillHints);

form.addEventListener('submit', event => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  if (!input.objective.trim()) {
    objectiveField.value = '';
    objectiveField.reportValidity();
    return;
  }
  const title = input.title.trim() || SKILLS[input.category].label + ' Island';
  persist(createIsland(world, { ...input, title, minutes: Number(input.minutes) }));
  selectedId = world.islands.at(-1).id;
  dialog.close();
  form.reset();
  animateIsland = true;
  changeView('world');
  const heading = app.querySelector('.field-notes h2');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  announce('Your island is ready.');
});

render();
