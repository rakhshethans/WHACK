import { createWorld, createIsland, createGeneratedIsland, completeGoal, getActiveGoal, getStage, adoptIsland, setDifficulty, getAdaptationRequest, needsRoadmapRevision, reviseIslandRoadmap, needsGeneratedPractice, canQueueGeneratedPractice, appendGeneratedPractice } from './world.mjs';
import { renderOcean, renderIsland } from './scene.mjs';
import { SKILLS } from './roadmaps.mjs';
import { generateStarterRoadmap, generateAdaptiveGoal, generateContinuation } from './local-planner.mjs';
import { DIFFICULTIES } from './difficulty.mjs';
import { relatedSkill } from './skill-connections.mjs';
import { layoutIslands } from './map-layout.mjs';
import { connectMap } from './map-camera.mjs';

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
const planMessage = document.querySelector('#plan-message');
const onboardingTitle = document.querySelector('#onboarding-title');
let pendingCreation;
let revisingId;
const adaptationDrafts = new Map();
const pendingPractice = new Map();
const practiceErrors = new Map();

const PLAN_ERRORS = {
  clarify: 'Name one specific skill or outcome. Try “Bake a sourdough loaf” or “Learn Spanish for a train trip”. Make sure the optional outcome fits that skill.',
  unsuitable: 'WorldHopper couldn’t turn that request into a safe practice plan. Try a different skill or outcome.',
  unavailable: 'This device can’t generate a tailored plan. Try WorldHopper in a compatible desktop browser with built-in AI.',
  retry: 'A specific plan couldn’t be generated this time. Try again or add a more concrete outcome.',
};

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
let renderedView = 'world';
let logOpen = false;
const cameras = {
  world: { overview: true },
  explore: { overview: true },
};
let disconnectMap;
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
  if (activeView !== view) logOpen = false;
  activeView = view;
  render();
}

function archipelagoMap(islands, selection, explore = false) {
  const populated = islands.length > 0;
  return `<section class="map-frame archipelago-frame" aria-label="Archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="Pan the archipelago with arrow keys or drag the map">
    <div class="map-scene">
    <div class="map-water">${renderOcean(true)}</div>
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
    </div></div>
    <div class="map-coordinates"><span>✦</span> ${populated ? (explore ? 'SAMPLE ARCHIPELAGO' : 'MY ARCHIPELAGO') : '07° 24′ N &nbsp; / &nbsp; 48° 12′ W'}</div>
    <div class="map-tools" role="group" aria-label="Map controls">
      <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
      <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" data-zoom="reset" aria-label="Reset map view">Reset</button>
    </div>
    <div class="map-footer"><span><i></i> ${populated ? islands.length + (islands.length === 1 ? ' ISLAND' : ' ISLANDS') + ' CHARTED' : 'UNCHARTED WATERS'}</span><span class="map-pan-hint">Pan the map</span><button type="button" data-action="show-log" aria-controls="island-log" aria-expanded="${logOpen}">Island log</button></div>
  </section>`;
}

function logPanel(content) {
  return `<aside class="field-notes map-log" id="island-log" aria-label="Island log" ${logOpen ? '' : 'hidden'}>
    <button type="button" class="icon log-close" data-action="close-log" aria-label="Close island log">×</button>
    ${content}</aside>`;
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

function currentPracticeMarkup(island, goal, number) {
  if (needsRoadmapRevision(island)) return `<section class="active-goal">
    <h3>This roadmap needs more detail</h3><p>Generate a plan for your exact skill. Your island and earned XP will stay.</p>
    <button class="primary" data-action="revise-plan">Update roadmap</button></section>`;
  if (needsGeneratedPractice(island)) return `<section class="active-goal">
    <h3>Ready for your next goal</h3><p>Generate a new exercise that builds on what you’ve already completed.</p>
    <button class="primary" data-action="generate-practice" data-id="${escapeHtml(island.id)}" ${pendingPractice.has(island.id) ? 'disabled' : ''}>${pendingPractice.has(island.id) ? 'Preparing your next goal…' : 'Generate next goal'}</button>
    ${practiceErrors.has(island.id) ? `<p role="status">${escapeHtml(practiceErrors.get(island.id))}</p>` : ''}</section>`;
  return goalMarkup(goal, number, island.category === 'custom' ? island.goalFeedback?.rating : island.difficulty ?? 'standard', island.objective);
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
  return `<div class="intro"><div><h1>Your archipelago<span>.</span></h1><p class="lede">${subheading}</p></div>
    <button class="primary" data-action="new">+ New island</button></div>
    <div class="workspace">${archipelagoMap(world.islands, island?.id)}
      ${logPanel(`
        ${island ? `<p class="eyebrow">ISLAND LOG / LEVEL ${stage.level}</p>
          <h2>${escapeHtml(island.title)}</h2>${island.attribution ? `<p class="caption">Roadmap by ${escapeHtml(island.attribution)}</p>` : ''}<p class="stage-name">${escapeHtml(stage.name)} · ${island.xp} XP</p>
          <progress value="${levelXp}" max="${levelTarget}" aria-label="XP toward Level ${stage.level + 1}"></progress>
          <p class="caption">${levelXp} / ${levelTarget} XP toward Level ${stage.level + 1}</p>
          ${currentPracticeMarkup(island, activeGoal, goalsCompleted + 1)}
          ${roadmapSummary(island)}
          ${connectionMarkup(island)}` :
          `<p class="eyebrow">ISLAND LOG / 00</p><h2>Open waters</h2>
          <p>Choose a skill, an objective and how much practice time you have.</p>
          <button class="small-action" data-action="new">Chart your first island ↗</button>`}
      `)}</div>`;
}

function discoverWorlds() {
  const demo = demoIslands[activeDemo];
  const stage = getStage(demo.xp);
  return `<div class="intro"><div><p class="eyebrow">THE PERSONAL ATLAS / EXPLORE</p><h1>Beyond your shore<span>.</span></h1>
    <p class="lede">Explore sample worlds and bring a roadmap back to your own.</p></div></div>
    <div class="workspace">${archipelagoMap(demoIslands.map(item => item.source), demo.source.id, true)}
      ${logPanel(`<p class="eyebrow">PUBLIC ATLAS / SAMPLE PROFILE</p><h2>${escapeHtml(demo.title)}</h2>
      <p class="stage-name">${escapeHtml(demo.creator)} · Level ${stage.level}</p>
      <p>${escapeHtml(demo.objective)}.</p>
      <p><strong>First goal</strong><br>${escapeHtml(getActiveGoal(demo.source)?.title)}</p>
      <button class="primary" data-action="adopt">Adopt roadmap <span aria-hidden="true">↗</span></button>
      <p class="caption">Your island starts at Level 1. The original roadmap keeps its attribution.</p>`)}</div>`;
}

function render() {
  disconnectMap?.();
  const previous = app.querySelector('.map-viewport');
  const previousLog = app.querySelector('.map-log');
  const sameView = renderedView === activeView;
  const opening = logOpen && (!previousLog || previousLog.hidden || !sameView);
  const logScroll = sameView && !opening ? previousLog?.scrollTop : 0;
  if (previous) {
    cameras[renderedView].left = previous.scrollLeft;
    cameras[renderedView].top = previous.scrollTop;
  }
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
  const viewport = app.querySelector('.map-viewport');
  disconnectMap = connectMap(viewport, cameras[activeView]);
  const log = app.querySelector('.map-log');
  if (opening) log.classList.add('log-enter');
  if (logScroll) log.scrollTop = logScroll;
  if (animateIsland) {
    const pin = map.querySelector('[aria-pressed="true"]');
    if (pin) {
      const bounds = viewport.getBoundingClientRect();
      const target = pin.getBoundingClientRect();
      viewport.scrollBy(target.left - bounds.left - (bounds.width - target.width) / 2,
        target.top - bounds.top - (bounds.height - target.height) / 2);
    }
  }
  renderedView = activeView;
  animateIsland = false;
}

function focusLog() {
  const heading = app.querySelector('.map-log h2');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function closeLog() {
  logOpen = false;
  render();
  app.querySelector('[data-action="show-log"]').focus({ preventScroll: true });
}

app.addEventListener('keydown', event => {
  if (event.key === 'Escape' && logOpen && !dialog.open) closeLog();
});

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
  if (action === 'close-log') {
    closeLog();
    return;
  }
  if (action === 'show-log') {
    logOpen = true;
    render();
    focusLog();
    if (activeView === 'world') void preparePractice(selectedId, true);
    return;
  }
  if (action === 'new') {
    openOnboarding();
    return;
  }
  if (action === 'revise-plan') {
    const island = world.islands.find(item => item.id === selectedId);
    if (island) openOnboarding(island.topic, island.objective === island.topic ? '' : island.objective, island);
    return;
  }
  if (action === 'generate-practice') {
    void preparePractice(id);
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
  if (action === 'select' || action === 'demo') logOpen = true;
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
      + (nextGoal?.adapted ? 'Next goal adapted to your feedback.' : nextGoal ? 'Next goal ready.' : 'Generate your next goal when you’re ready.'));
  }
  if (action === 'adopt') {
    const demo = demoIslands[activeDemo];
    persist(adoptIsland(world, demo.source));
    selectedId = world.islands.at(-1).id;
    activeView = 'world';
    logOpen = true;
    animateIsland = true;
    announce(demo.title + ' added to your world.');
  }
  render();
  const nextFocus = app.querySelector(action === 'complete' ? '#active-goal-title' : '.field-notes h2');
  if (nextFocus) {
    if (nextFocus.matches('h2, h3')) nextFocus.tabIndex = -1;
    nextFocus.focus({ preventScroll: true });
  }
  if (action === 'complete' || action === 'select') void preparePractice(selectedId, true);
});

async function preparePractice(id, ahead = false) {
  const island = world.islands.find(item => item.id === id);
  if (!island || pendingPractice.has(id) || dialog.open) return;
  const waiting = needsGeneratedPractice(island);
  if (ahead ? !canQueueGeneratedPractice(island) || pendingPractice.size : !waiting) return;
  const controller = new AbortController();
  pendingPractice.set(id, { controller, ahead });
  practiceErrors.delete(id);
  if (waiting) {
    render();
    if (!ahead) announce('Preparing your next goal.');
  }
  const activeGoal = getActiveGoal(island);
  const context = activeGoal?.adapted ? { ...island, goals: [...island.goals.slice(0, -1), activeGoal] } : island;
  const result = await generateContinuation(context, { signal: controller.signal, allowDownload: !ahead });
  if (pendingPractice.get(id)?.controller !== controller) return;
  pendingPractice.delete(id);
  const current = world.islands.find(item => item.id === id);
  const needsGoal = current && needsGeneratedPractice(current);
  if (result.status === 'ready') {
    const updated = appendGeneratedPractice(world, id, result.goal, { ahead });
    if (updated !== world) {
      persist(updated);
      if (!needsGoal && current?.goalFeedback) draftNextGoal(updated.islands.find(item => item.id === id), current.goalFeedback.id);
    }
  } else if (needsGoal) {
    practiceErrors.set(id, result.status === 'unavailable' ? PLAN_ERRORS.unavailable : 'Couldn’t generate a specific next goal. Try again when you’re ready.');
  }
  if (needsGoal && activeView === 'world' && selectedId === id && logOpen && !dialog.open) {
    render();
    app.querySelector(result.status === 'ready' ? '#active-goal-title' : '[data-action="generate-practice"]')?.focus({ preventScroll: true });
    if (result.status === 'ready') announce('Your next goal is ready.');
  }
}

function setPlanMessage(message = '', error = false) {
  planMessage.textContent = message;
  planMessage.toggleAttribute('data-error', error);
  if (error && message === PLAN_ERRORS.clarify) topicField.setAttribute('aria-invalid', 'true');
  else topicField.removeAttribute('aria-invalid');
}

function openOnboarding(topic = '', objective = '', island) {
  let refreshWaitingGoal = false;
  for (const [id, task] of pendingPractice) {
    if (!task.ahead) continue;
    pendingPractice.delete(id);
    task.controller.abort();
    const current = world.islands.find(item => item.id === id);
    if (id === selectedId && current && needsGeneratedPractice(current)) refreshWaitingGoal = true;
  }
  if (refreshWaitingGoal) render();
  form.reset();
  setPlanMessage();
  revisingId = island?.id;
  onboardingTitle.textContent = island ? 'Update your roadmap' : 'Chart a new island';
  form.querySelector('.name-option').open = false;
  topicField.value = topic;
  objectiveField.value = objective;
  if (island) {
    form.elements.title.value = island.title === island.topic ? '' : island.title;
    form.elements.experience.value = island.experience || 'beginner';
    form.elements.minutes.value = [10, 20, 30].includes(island.sessionMinutes) ? island.sessionMinutes : 20;
  }
  setCreating(false);
  dialog.showModal();
}

function setCreating(creating) {
  createButton.disabled = creating;
  for (const field of form.querySelectorAll('input, select')) field.disabled = creating;
  createLabel.textContent = creating ? 'Building your practice plan…' : revisingId ? 'Update my roadmap' : 'Create my island';
}

form.addEventListener('input', () => setPlanMessage());

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
  const previous = world.islands.find(item => item.id === revisingId);
  const recent = previous?.goals.filter(goal => goal.completed).slice(-3).map(({ title, description }) => ({ title, description }));
  const planInput = { ...input, topic, objective: input.objective.trim() || topic, minutes: Number(input.minutes), recent };
  const controller = new AbortController();
  pendingCreation = controller;
  setCreating(true);
  setPlanMessage('Preparing your tailored plan on this device…');
  const result = await generateStarterRoadmap(planInput, {
    signal: controller.signal, allowDownload: true,
    onStatus(status, progress) {
      if (status === 'downloading') setPlanMessage('Downloading this browser’s AI model' + (progress === undefined ? '…' : ' (' + progress + '%)…'));
      else setPlanMessage('Writing your first tailored exercise…');
    },
  });
  if (pendingCreation !== controller) return;
  pendingCreation = undefined;
  setCreating(false);
  if (!dialog.open) return;
  if (result.status !== 'ready') {
    setPlanMessage(PLAN_ERRORS[result.status], true);
    if (result.status === 'clarify') topicField.focus();
    else createButton.focus();
    return;
  }
  const inputWithPlan = { ...planInput, localRoadmap: result.plan };
  const next = revisingId ? reviseIslandRoadmap(world, revisingId, inputWithPlan) : createGeneratedIsland(world, inputWithPlan);
  if (next === world) {
    setPlanMessage(PLAN_ERRORS.retry, true);
    return;
  }
  persist(next);
  selectedId = revisingId ?? world.islands.at(-1).id;
  dialog.close();
  form.reset();
  animateIsland = !revisingId;
  activeView = 'world';
  logOpen = true;
  render();
  focusLog();
  announce(revisingId ? 'Your updated roadmap is ready.' : 'Your island is ready.');
  void preparePractice(selectedId, true);
});

render();
