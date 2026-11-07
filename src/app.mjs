import { createWorld, createIsland, completeGoal, getStage, adoptIsland } from './world.mjs';
import { renderScene } from './scene.mjs';

const app = document.querySelector('#app');
const dialog = document.querySelector('#onboarding');
const form = document.querySelector('#island-form');
const worldTab = document.querySelector('#world-tab');
const exploreTab = document.querySelector('#explore-tab');
const announcement = document.querySelector('#announcement');
const storageKey = 'worldhopper-world-v1';

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
  { title: 'The Chord Coast', objective: 'Play a song from start to finish', creator: 'Maya Chen', initials: 'MC', xp: 240, experience: 'beginner', minutes: 20 },
  { title: 'Resonance Bay', objective: 'Build a fingerstyle practice routine', creator: 'Noah Silva', initials: 'NS', xp: 440, experience: 'intermediate', minutes: 30 }
].map((demo, index) => ({
  ...demo,
  source: { ...createIsland(createWorld(), { ...demo, category: 'guitar' }).islands[0], id: 'demo-guitar-' + index, creator: demo.creator, creatorName: demo.creator, ownerName: demo.creator, attribution: demo.creator, xp: demo.xp }
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

function sceneMarkup(island, stage) {
  return `<section class="map-frame" aria-label="Island map">
    <div class="map-coordinates"><span>✦</span> 07° 24′ N &nbsp; / &nbsp; 48° 12′ W</div>
    <div class="map-art${animateIsland ? ' animate-island' : ''}">${renderScene(island, stage)}</div>
    <div class="map-footer"><span><i></i> ${island ? 'ISLAND IN VIEW' : 'UNCHARTED WATERS'}</span><span class="map-scale">└────┘ <b>1 NM</b></span></div>
  </section>`;
}

function goalMarkup(goal, island) {
  const completedIds = new Set(island.goals.filter(item => item.completed).map(item => item.id));
  const locked = !goal.prerequisites.every(id => completedIds.has(id));
  const action = goal.completed ? '<span class="complete-label">✓ Complete</span>' :
    locked ? '<span class="lock-label">Prerequisite required</span>' :
      `<button class="small-action" data-action="complete" data-id="${escapeHtml(goal.id)}">Mark complete</button>`;
  return `<li class="goal ${goal.completed ? 'done' : ''}"><div><h3>${escapeHtml(goal.title)}</h3>
    <p>${escapeHtml(goal.description)}</p><span class="goal-meta">${escapeHtml(goal.minutes)} MIN · +${escapeHtml(goal.xp)} XP</span></div>
    ${action}</li>`;
}

function currentWorld() {
  const island = world.islands.find(item => item.id === selectedId) ?? world.islands[0];
  const stage = getStage(island?.xp ?? 0);
  const progress = stage.nextThreshold == null ? 100 :
    Math.max(0, Math.min(100, 100 * (island?.xp - stage.threshold) / (stage.nextThreshold - stage.threshold)));
  const subheading = island ? 'Each completed goal adds XP and changes the island.' :
    'Start with guitar. As you practise, your island grows.';
  return `<div class="intro"><div><p class="eyebrow">THE PERSONAL ATLAS / MY WORLD</p><h1>Your archipelago<span>.</span></h1><p class="lede">${subheading}</p></div>
    <button class="primary" data-action="new">+ New island</button></div>
    ${world.islands.length > 1 ? `<div class="island-list" aria-label="Your islands">${world.islands.map(item =>
      `<button data-action="select" data-id="${escapeHtml(item.id)}" aria-pressed="${item.id === island.id}">${escapeHtml(item.title)}</button>`).join('')}</div>` : ''}
    <div class="workspace">${sceneMarkup(island, stage.level)}
      <aside class="field-notes">
        ${island ? `<p class="eyebrow">ISLAND LOG / LEVEL ${stage.level}</p>
          <h2>${escapeHtml(island.title)}</h2>${island.attribution ? `<p class="caption">Roadmap by ${escapeHtml(island.attribution)}</p>` : ''}<p class="stage-name">${escapeHtml(stage.name)} · ${island.xp} XP</p>
          <progress value="${progress}" max="100" aria-label="Progress to next level"></progress>
          <p class="caption">${stage.nextThreshold == null ? 'Final stage reached' : (stage.nextThreshold - island.xp) + ' XP to the next level'}</p>
          <h3 class="section-title">Your roadmap</h3><ol class="goal-list">${island.goals.map(goal => goalMarkup(goal, island)).join('')}</ol>` :
          `<p class="eyebrow">ISLAND LOG / 00</p><h2>Open waters</h2>
          <p>Choose a guitar objective and how much time you have, then follow your island’s roadmap.</p>
          <button class="small-action" data-action="new">Chart your first island ↗</button>`}
      </aside></div>`;
}

function discoverWorlds() {
  const demo = demoIslands[activeDemo];
  const stage = getStage(demo.xp);
  return `<div class="intro"><div><p class="eyebrow">THE PERSONAL ATLAS / EXPLORE</p><h1>Beyond your shore<span>.</span></h1>
    <p class="lede">Explore sample worlds and bring a roadmap back to your own.</p></div></div>
    <div class="island-list" aria-label="Sample islands">${demoIslands.map((item, index) =>
      `<button data-action="demo" data-id="${index}" aria-pressed="${index === activeDemo}">${escapeHtml(item.title)}</button>`).join('')}</div>
    <div class="workspace">${sceneMarkup(demo.source, stage.level)}
      <aside class="field-notes"><p class="eyebrow">PUBLIC ATLAS / SAMPLE PROFILE</p><h2>${escapeHtml(demo.title)}</h2>
      <p class="stage-name">${escapeHtml(demo.creator)} · Level ${stage.level}</p>
      <p>${escapeHtml(demo.objective)}.</p>
      <h3 class="section-title">Roadmap preview</h3>
      <ol class="preview-list">${demo.source.goals.slice(0, 3).map(goal => `<li>${escapeHtml(goal.title)}</li>`).join('')}</ol>
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
    dialog.showModal();
    return;
  }
  if (action === 'select') selectedId = id;
  if (action === 'demo') activeDemo = Number(id);
  if (action === 'complete') {
    const island = world.islands.find(item => item.id === selectedId);
    if (!island) return;
    const next = completeGoal(world, island.id, id);
    if (next === world) return;
    const updated = next.islands.find(item => item.id === island.id);
    const newLevel = getStage(updated.xp).level;
    persist(next);
    animateIsland = newLevel > getStage(island.xp).level;
    announce(animateIsland ? 'Island advanced to level ' + newLevel : 'Goal complete. XP added.');
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
    app.querySelector('[aria-pressed="true"]') : app.querySelector('.field-notes h2');
  if (nextFocus) {
    if (nextFocus.tagName === 'H2') nextFocus.tabIndex = -1;
    nextFocus.focus({ preventScroll: true });
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  if (!input.title.trim() || !input.objective.trim()) {
    const field = form.elements[input.title.trim() ? 'objective' : 'title'];
    field.value = '';
    field.reportValidity();
    return;
  }
  persist(createIsland(world, { ...input, minutes: Number(input.minutes), category: 'guitar' }));
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
