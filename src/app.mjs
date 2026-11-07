import { createWorld, createIsland, completeGoal, getActiveGoal, getStage, adoptIsland, setDifficulty, getAdaptationRequest } from './world.mjs';
import { renderOcean, renderIsland } from './scene.mjs';
import { SKILLS } from './roadmaps.mjs';
import { generateCustomRoadmap, generateAdaptiveGoal } from './local-planner.mjs';
import { DIFFICULTIES } from './difficulty.mjs';
import { relatedSkill } from './skill-connections.mjs';
import { layoutIslands } from './map-layout.mjs';

const app = document.querySelector('#app');
const dialog = document.querySelector('#onboarding');
const form = document.querySelector('#island-form');
const worldTab = document.querySelector('#world-tab');
const exploreTab = document.querySelector('#explore-tab');
const announcement = document.querySelector('#announcement');
const storageKey = 'worldhopper-world-v1';
const objectiveField = form.elements.objective;
const topicField = form.elements.topic;
const createLabel = document.querySelector('#create-island-label');
const createButton = form.querySelector('button[type="submit"]');
let pendingCreation;
const adaptationDrafts = new Map();

function positionIslands(map) {
  const buttons = [...map.querySelectorAll('.map-island')];
  const { height, positions } = layoutIslands(buttons.map(button => button.dataset.id), map.clientWidth);
  map.style.height = height + 'px';
  buttons.forEach((button, index) => {
    const { left, top, width } = positions[index];
    Object.assign(button.style, { left: left + 'px', top: top + 'px', width: width + 'px' });
  });
}

const mapResize = new ResizeObserver(entries => {
  for (const { target } of entries) positionIslands(target);
});

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
    ${explore ? '' : '<a class="map-goal-jump" href="#active-goal-title">Current goal ↓</a>'}
    <div class="island-water">
      ${islands.map(island => {
        const selected = island.id === selection;
        const { level } = getStage(island.xp);
        const skill = island.topic || (Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill');
        return `<button type="button" class="map-island${selected && animateIsland ? ' animate-island' : ''}"
          data-action="${explore ? 'demo' : 'select'}" data-id="${escapeHtml(island.id)}" aria-pressed="${selected}">
          <span class="island-art">${renderIsland(island, level)}</span>
          <span class="island-pin" title="${escapeHtml(island.title)}"><strong>${escapeHtml(island.title)}</strong><small>${skill === island.title ? '' : escapeHtml(skill) + ' · '}Lv ${level}</small></span>
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
    ${island.roadmap.onDevice ? '<p class="caption">Initial plan generated on this device.</p>' : ''}
    <p><strong>Roadmap checkpoint</strong><span>${escapeHtml(island.roadmap.checkpoint)}</span></p>
    ${island.roadmap.next ? `<p><strong>Beyond this roadmap</strong><span>${escapeHtml(island.roadmap.next)}</span></p>` : ''}
  </details>`;
}

function goalMarkup(goal, number, difficulty, ambition) {
  if (!goal) return '<p>Complete the prerequisite for the next practice goal.</p>';
  return `<section class="active-goal" aria-labelledby="active-goal-title">
    <div class="goal-card-top"><p class="eyebrow">CURRENT GOAL / ${number}</p><span class="goal-reward">+${escapeHtml(goal.xp)} XP</span></div>
    <h3 id="active-goal-title" tabindex="-1">${escapeHtml(goal.title)}</h3>
    ${goal.adapted ? `<p class="goal-adaptation">${goal.adapted === 'support' ? 'Smaller next step based on your feedback' : 'Stretch goal based on your feedback'}</p>` : ''}
    <p>${escapeHtml(goal.description)}</p>
    ${goal.practiceAdjustment ? `<p class="practice-adjustment"><strong>${difficulty === 'support' ? 'Start here' : 'Stretch practice'}</strong> ${escapeHtml(goal.practiceAdjustment)}</p>` : ''}
    ${goal.finish ? `<p class="goal-finish"><strong>Done when</strong> ${escapeHtml(goal.finish)}</p>` : ''}
    ${ambition ? `<p class="goal-ambition"><strong>Working toward</strong> ${escapeHtml(ambition)}</p>` : ''}
    <p class="goal-meta">${escapeHtml(goal.minutes)} MIN${goal.finish ? ' / SESSION' : ''}</p>
    <button class="primary" data-action="complete" data-id="${escapeHtml(goal.id)}">Complete goal <span aria-hidden="true">✓</span></button>
    <div class="goal-feedback" role="group" aria-label="Practice difficulty">
      <p class="caption">Adjust your practice</p>
      <div class="difficulty-options">${DIFFICULTIES.map(option => `<button type="button" data-action="difficulty" data-id="${escapeHtml(goal.id)}"
        data-rating="${option.value}" aria-pressed="${option.value === difficulty}">${option.label}</button>`).join('')}</div>
    </div>
  </section>`;
}

function connectionMarkup(island) {
  const recommendation = relatedSkill(island, world.islands);
  if (!recommendation) return '';
  const { name, reason, islandId } = recommendation;
  return `<section class="skill-connection" aria-labelledby="connection-title">
    <p class="eyebrow">RELATED SKILL</p>
    <h3 id="connection-title">${escapeHtml(name)}</h3>
    <p>${escapeHtml(reason)}</p>
    <button type="button" class="small-action" data-action="${islandId ? 'select' : 'start-connection'}"
      data-id="${escapeHtml(islandId)}">${islandId ? 'Open island' : 'Start ' + escapeHtml(name)} ↗</button>
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
          ${goalMarkup(activeGoal, goalsCompleted + 1, island.category === 'custom' ? island.goalFeedback?.rating : island.difficulty ?? 'standard', island.objective)}
          ${roadmapSummary(island)}
          ${connectionMarkup(island)}` :
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
  mapResize.disconnect();
  worldTab.setAttribute('aria-pressed', String(activeView === 'world'));
  exploreTab.setAttribute('aria-pressed', String(activeView === 'explore'));
  app.innerHTML = (activeView === 'world' ? currentWorld() : discoverWorlds()) +
    (storageUnavailable ? '<p class="storage-note">This browser blocked storage. Progress is available until you close or reload the page.</p>' : '') +
    '<footer><span>WORLDHOPPER</span><span>WARWICKHACK 2026 / NEW WORLDS</span></footer>';
  const map = app.querySelector('.island-water');
  if (map) {
    positionIslands(map);
    mapResize.observe(map);
  }
  animateIsland = false;
}

worldTab.addEventListener('click', () => changeView('world'));
exploreTab.addEventListener('click', () => changeView('explore'));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

function discardDraft(islandId) {
  const draft = adaptationDrafts.get(islandId);
  adaptationDrafts.delete(islandId);
  draft?.controller.abort();
  return draft;
}

function draftNextGoal(island, goalId) {
  discardDraft(island.id);
  if (!globalThis.LanguageModel) return;
  const request = getAdaptationRequest(island, goalId);
  if (!request) return;
  const controller = new AbortController();
  const draft = { goalId, controller, candidate: null };
  adaptationDrafts.set(island.id, draft);
  generateAdaptiveGoal(request, { signal: controller.signal }).then(candidate => {
    if (!controller.signal.aborted) draft.candidate = candidate;
  }).catch(() => {
    if (adaptationDrafts.get(island.id) === draft) discardDraft(island.id);
  });
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id, rating } = button.dataset;
  if (action === 'new') {
    openOnboarding();
    return;
  }
  if (action === 'start-connection') {
    const island = world.islands.find(item => item.id === selectedId);
    const recommendation = island && relatedSkill(island, world.islands);
    if (!recommendation) return;
    openOnboarding(recommendation.topic ?? recommendation.name, recommendation.objective);
    return;
  }
  if (action === 'difficulty') {
    const updated = setDifficulty(world, selectedId, id, rating);
    if (updated === world) return;
    persist(updated);
    const island = world.islands.find(item => item.id === selectedId);
    draftNextGoal(island, id);
    render();
    app.querySelector('[data-action="difficulty"][aria-pressed="true"]')?.focus({ preventScroll: true });
    announce('Practice difficulty updated for this island.');
    return;
  }
  if (action === 'select') selectedId = id;
  if (action === 'demo') activeDemo = Number(id);
  if (action === 'complete') {
    const island = world.islands.find(item => item.id === selectedId);
    if (!island) return;
    const goal = getActiveGoal(island);
    if (goal?.id !== id) return;
    const draft = discardDraft(island.id);
    const next = completeGoal(world, island.id, id, draft?.goalId === id ? draft.candidate : null);
    if (next === world) return;
    const updated = next.islands.find(item => item.id === island.id);
    const newLevel = getStage(updated.xp).level;
    persist(next);
    animateIsland = newLevel > getStage(island.xp).level;
    const reward = goal.xp + ' XP earned. ';
    const nextGoal = getActiveGoal(updated);
    announce(reward + (animateIsland ? 'Island advanced to Level ' + newLevel + '. ' : '')
      + (nextGoal?.adapted ? 'Next goal adapted to your feedback.' : 'Next goal ready.'));
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

function openOnboarding(topic = '', objective = '') {
  form.reset();
  form.querySelector('.name-option').open = false;
  topicField.value = topic;
  objectiveField.value = objective;
  dialog.showModal();
}

function setCreating(creating) {
  createButton.disabled = creating;
  createLabel.textContent = creating ? 'Building your practice plan…' : 'Create my island';
}

dialog.addEventListener('close', () => {
  if (dialog.open || !pendingCreation) return;
  pendingCreation.abort();
  pendingCreation = undefined;
  setCreating(false);
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pendingCreation) return;
  const input = Object.fromEntries(new FormData(form));
  const topic = input.topic.trim();
  if (!topic) {
    topicField.value = '';
    topicField.reportValidity();
    return;
  }
  const planInput = { ...input, topic, objective: input.objective.trim() || topic, minutes: Number(input.minutes) };
  if (globalThis.LanguageModel) {
    const controller = new AbortController();
    pendingCreation = controller;
    setCreating(true);
    planInput.localRoadmap = await generateCustomRoadmap(planInput, { signal: controller.signal });
    if (pendingCreation !== controller) return;
    pendingCreation = undefined;
    setCreating(false);
    if (!dialog.open) return;
  }
  persist(createIsland(world, planInput));
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
