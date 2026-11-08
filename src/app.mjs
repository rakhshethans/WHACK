import { createWorld, createGeneratedIsland, completeGoal, getActiveGoal, getStage, adoptIsland, setDifficulty, getAdaptationRequest, needsRoadmapRevision, canPersonaliseAdoptedRoadmap, reviseIslandRoadmap, needsGeneratedPractice, canQueueGeneratedPractice, appendGeneratedPractice, applyInactivity, plannedPracticeLevel, reviseActiveGoal, setIslandIcon, GOAL_FEEDBACK_LIMIT } from './world.mjs';
import { DAY_MS, PRACTICE_GRACE_DAYS, maintenanceStatus, practiceXp } from './progression.mjs';
import { renderOcean, renderIsland, renderIconPreview } from './scene.mjs';
import { CUSTOM_ICON_LIMIT, LANDMARKS, knownLandmark, readIslandIcon } from './island-art.mjs';
import { SKILLS } from './roadmaps.mjs';
import { generateStarterRoadmap, generateAdaptiveGoal, generateContinuation, generateGoalRevision, warmPlannerModel } from './local-planner.mjs';
import { DIFFICULTIES } from './difficulty.mjs';
import { relatedIslandPairs, relatedSkill } from './skill-connections.mjs';
import { layoutIslands, layoutSeaRoutes } from './map-layout.mjs';
import { connectMap } from './map-camera.mjs';
import { createFixtureSocialClient, mountSocialExplore, toPublicIsland, toAdoptableRoadmap, validateAdoptableRoadmap } from './social/index.mjs';

const app = document.querySelector('#app');
const dialog = document.querySelector('#onboarding');
const form = document.querySelector('#island-form');
const worldTab = document.querySelector('#world-tab');
const exploreTab = document.querySelector('#explore-tab');
const announcement = document.querySelector('#announcement');
const storageKey = 'worldhopper-world-v1';
const testingMode = new URLSearchParams(location.search).get('testing') === '1';
const objectiveField = form.elements.objective;
const topicField = form.elements.topic;
const createLabel = document.querySelector('#create-island-label');
const createButton = form.querySelector('button[type="submit"]');
const planMessage = document.querySelector('#plan-message');
const onboardingTitle = document.querySelector('#onboarding-title');
const nameOption = form.querySelector('.name-option');
let pendingCreation;
let goalRevision;
const plannerWarmup = warmPlannerModel();
let revisingId;
let personalisingRoadmap = false;
const adaptationDrafts = new Map();
const pendingPractice = new Map();
const practiceErrors = new Map();

const PLAN_ERRORS = {
  clarify: 'Name one specific skill or outcome. Try “Bake a sourdough loaf” or “Learn Spanish for a train trip”. Make sure the optional outcome fits that skill.',
  unsuitable: 'WorldHopper couldn’t turn that request into a safe practice plan. Try a different skill or outcome.',
  unavailable: 'This device can’t generate a tailored plan. Try WorldHopper in a compatible desktop browser with built-in AI.',
  retry: 'Gemini Nano returned an incomplete or generic exercise. Try again or add a more concrete outcome.',
  activation: 'Chrome needs another click to finish setting up Gemini Nano. Press the button again.',
  'setup-error': 'Chrome couldn’t start Gemini Nano. Restart desktop Chrome and try again.',
  'setup-timeout': 'Gemini Nano took too long to start. Give Chrome a moment, then try again.',
  'download-timeout': 'Chrome is still preparing Gemini Nano. Keep Chrome open and try again once the download finishes.',
  'generation-timeout': 'Gemini Nano took too long to write this exercise. Try again. The first request can take longer.',
  'model-error': 'Chrome interrupted Gemini Nano while it was writing. Restart Chrome or try again.',
};

function positionIslands(map) {
  const buttons = [...map.querySelectorAll('.map-island')];
  const width = map.clientWidth;
  const { height, positions } = layoutIslands(buttons.map(button => button.dataset.id), width);
  map.style.height = height + 'px';
  buttons.forEach((button, index) => {
    const { left, top, width } = positions[index];
    Object.assign(button.style, { left: left + 'px', top: top + 'px', width: width + 'px' });
  });
  const overlay = map.querySelector('.sea-routes');
  const routes = layoutSeaRoutes(relatedIslandPairs(world.islands), positions, width, height);
  const selected = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
  overlay.innerHTML = routes.map(({ from, to, path }) =>
    `<path d="${path}"${selected === from || selected === to ? ' class="is-selected"' : ''}/>`).join('');
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
const worldCamera = { overview: true };
const socialClient = createFixtureSocialClient();
let socialController;
let disconnectMap;
let storageUnavailable = false;
let animateIsland = false;
let levelUp;
let maintenanceTimer;

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
  socialController?.updateViewerWorld(world);
  scheduleMaintenance();
}

function announce(message) {
  announcement.textContent = message;
}

function changeView(view) {
  if (activeView !== view) {
    logOpen = false;
    discardGoalRevision();
  }
  activeView = view;
  render();
}

function archipelagoMap(islands, selection) {
  const populated = islands.length > 0;
  return `<section class="map-frame archipelago-frame" aria-label="Archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="Archipelago. Scroll to zoom. Drag or use the arrow keys to pan.">
    <div class="map-scene">
    <div class="map-water">${renderOcean(true)}</div>
    <div class="island-water">
      <svg class="sea-routes" aria-hidden="true" focusable="false"></svg>
      ${islands.map(island => {
        const selected = island.id === selection;
        const { level } = getStage(island.xp);
        const skill = island.topic || (Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill');
        return `<button type="button" class="map-island${selected && animateIsland ? ' animate-island' : ''}${island.id === levelUp?.islandId ? ' level-up-island' : ''}"
          data-action="select" data-id="${escapeHtml(island.id)}" aria-pressed="${selected}">
          <span class="island-art">${renderIsland(island, level)}</span>
          <span class="island-pin" title="${escapeHtml(island.title)}"><strong>${escapeHtml(island.title)}</strong><small>${skill === island.title ? '' : escapeHtml(skill) + ' · '}Lv ${level}</small></span>
        </button>`;
      }).join('')}
    </div>
    </div></div>
    <div class="map-coordinates"><span>✦</span> ${populated ? 'MY ARCHIPELAGO' : '07° 24′ N &nbsp; / &nbsp; 48° 12′ W'}</div>
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
    ${island.roadmap.checkpoint ? `<p><strong>Roadmap checkpoint</strong><span>${escapeHtml(island.roadmap.checkpoint)}</span></p>` : ''}
    ${island.roadmap.next ? `<p><strong>Beyond this roadmap</strong><span>${escapeHtml(island.roadmap.next)}</span></p>` : ''}
  </details>`;
}

function writtenFeedbackMarkup(island, goal, editor) {
  if (!island.roadmap?.onDevice) return '';
  const pending = Boolean(editor?.controller);
  return `<details class="written-feedback" ${editor ? 'open' : ''}>
    <summary>Give feedback</summary>
    <form data-goal-revision data-island-id="${escapeHtml(island.id)}" data-goal-id="${escapeHtml(goal.id)}">
      <label for="goal-note">What should this goal focus on?</label>
      <textarea id="goal-note" name="note" rows="3" maxlength="${GOAL_FEEDBACK_LIMIT}" required ${pending ? 'readonly' : ''}
        placeholder="Example: Practise ordering at a café.">${escapeHtml(editor?.note ?? island.practicePreference)}</textarea>
      <p>This revises the current goal and guides future practice on this island.</p>
      ${pending ? '<p role="status">Rewriting your goal…</p><button type="button" class="small-action" data-action="cancel-goal-revision">Cancel rewrite</button>' :
        '<button class="small-action" type="submit">Revise goal</button>'}
      ${editor?.error ? `<p role="alert">${escapeHtml(editor.error)}</p>` : ''}
    </form>
  </details>`;
}

function goalMarkup(island, goal, number, difficulty, xp) {
  if (!goal) return '<p>Complete the prerequisite for the next practice goal.</p>';
  const editor = goalRevision?.islandId === island.id && goalRevision.goalId === goal.id ? goalRevision : undefined;
  const disabled = editor?.controller ? 'disabled' : '';
  return `<section class="active-goal" aria-labelledby="active-goal-title">
    <div class="goal-card-top"><p class="eyebrow">CURRENT GOAL / ${number}</p><span class="goal-reward">${xp ? '+' + xp + ' XP' : 'Maintain mastery'}</span></div>
    <h3 id="active-goal-title" tabindex="-1">${escapeHtml(goal.title)}</h3>
    ${goal.adapted ? `<p class="goal-adaptation">${goal.adapted === 'support' ? 'Smaller next step based on your feedback' : 'Stretch goal based on your feedback'}</p>` : ''}
    <p>${escapeHtml(goal.description)}</p>
    ${goal.levelPractice ? `<p class="practice-adjustment"><strong>Level ${goal.practiceLevel} practice</strong> ${escapeHtml(goal.levelPractice)}</p>` : ''}
    ${goal.practiceAdjustment ? `<p class="practice-adjustment"><strong>${difficulty === 'support' ? 'Start here' : 'Stretch practice'}</strong> ${escapeHtml(goal.practiceAdjustment)}</p>` : ''}
    ${goal.levelPractice && goal.practiceLevel <= 3 ? `<p class="goal-finish"><strong>Done when</strong> You can repeat the part you practised once with control.</p>` : ''}
    ${goal.finish ? `<p class="goal-finish"><strong>${goal.levelPractice && goal.practiceLevel <= 3 ? 'Full exercise target' : 'Done when'}</strong> ${escapeHtml(goal.finish)}</p>` : ''}
    ${island.objective ? `<p class="goal-ambition"><strong>Working toward</strong> ${escapeHtml(island.objective)}</p>` : ''}
    <p class="goal-meta">${escapeHtml(goal.minutes)} MIN${goal.finish ? ' / SESSION' : ''}</p>
    <button class="primary" data-action="complete" data-id="${escapeHtml(goal.id)}" ${disabled}>Complete goal <span aria-hidden="true">✓</span></button>
    ${writtenFeedbackMarkup(island, goal, editor)}
    <div class="goal-feedback" role="group" aria-label="Practice difficulty">
      <p class="caption">Adjust your practice</p>
      <div class="difficulty-options">${DIFFICULTIES.map(option => `<button type="button" data-action="difficulty" data-id="${escapeHtml(goal.id)}"
        data-rating="${option.value}" aria-pressed="${option.value === difficulty}" ${disabled}>${option.label}</button>`).join('')}</div>
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
  const reward = goal ? practiceXp(island.xp, goal.xp) - island.xp : 0;
  return goalMarkup(island, goal, number, island.category === 'custom' || island.roadmap?.onDevice
    ? island.goalFeedback?.rating : island.difficulty ?? 'standard', reward);
}

function maintenanceMessage(island, now = Date.now()) {
  const status = maintenanceStatus(island, now);
  if (!status) return 'Complete a goal to start your ' + PRACTICE_GRACE_DAYS + '-day practice window.';
  const remaining = status.nextLossAt - now;
  const days = Math.ceil(remaining / DAY_MS);
  const hours = Math.ceil(remaining / (DAY_MS / 24));
  const minutes = Math.ceil(remaining / 60000);
  const countdown = remaining <= 0 ? 'now' : 'in ' + (
    days > 1 ? days + ' days' : hours === 24 ? '1 day' :
      hours > 1 ? hours + ' hours' : minutes > 1 ? minutes + ' minutes' : 'under a minute'
  );
  return 'Next XP loss ' + countdown + ' · −' + status.xpLoss + ' XP';
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
  return `<div class="intro"><h1>Your archipelago<span>.</span></h1>
    <button class="primary intro-action" data-action="new">+ New island</button>
    <p class="lede">${subheading}</p></div>
    <div class="workspace">${archipelagoMap(world.islands, island?.id)}
      ${levelUp && island?.id === levelUp.islandId ? `<div class="level-up-banner" aria-hidden="true">
        <span class="level-up-preview island-art">${renderIsland(island, stage.level)}</span>
        <div><strong>✦ Level up</strong> Level ${stage.level} · ${escapeHtml(stage.name)}</div>
      </div>` : ''}
      ${logPanel(`
        ${island ? `<p class="eyebrow">ISLAND LOG / LEVEL ${stage.level}</p>
          <h2>${escapeHtml(island.title)}</h2>${island.attribution ? `<p class="caption">Roadmap by ${escapeHtml(island.attribution)}</p>` : ''}<p class="stage-name">${escapeHtml(stage.name)} · ${island.xp} XP</p>
          ${stage.nextThreshold === null ? '<p class="caption">Max level · Keep practising to maintain mastery.</p>' : `
            <progress value="${levelXp}" max="${levelTarget}" aria-label="XP toward Level ${stage.level + 1}"></progress>
            <p class="caption">${levelXp} / ${levelTarget} XP toward Level ${stage.level + 1}</p>`}
          <p class="xp-maintenance" data-maintenance>${maintenanceMessage(island)}</p>
          ${iconPickerMarkup(island)}
          ${island.xp ? `<p class="caption">Completing a goal gives you ${PRACTICE_GRACE_DAYS} days before XP starts dropping daily.</p>` : ''}
          ${canPersonaliseAdoptedRoadmap(island) && !needsRoadmapRevision(island) ? '<button type="button" class="small-action" data-action="revise-plan">Personalise roadmap</button>' : ''}
          ${currentPracticeMarkup(island, activeGoal, goalsCompleted + 1)}
          ${roadmapSummary(island)}
          ${connectionMarkup(island)}` :
          `<p class="eyebrow">ISLAND LOG / 00</p><h2>Open waters</h2>
          <p>Choose a skill and tell us what you’d like to achieve.</p>
          <button class="small-action" data-action="new">Chart your first island ↗</button>`}
      `)}</div>`;
}

const ICON_OPTIONS = LANDMARKS.filter(symbol => symbol !== 'compass').sort();
const ICON_LABELS = { driving: 'Car (driving)', aviation: 'Plane (aviation)' };
function iconPickerMarkup(island) {
  const saved = readIslandIcon(island.iconOverride);
  if (!saved && (island.category !== 'custom' || knownLandmark(island))) return '';
  const current = saved?.symbol ?? (saved?.text ? 'label' : '');
  return `<details class="roadmap-summary island-icon-picker">
    <summary>${saved ? 'Change island icon' : 'Choose an island icon'}</summary>
    <form data-icon-picker data-island-id="${escapeHtml(island.id)}">
      <div class="island-icon-preview">${renderIconPreview(island)}</div>
      <div>
        <label>Icon<select name="symbol">
          <option value="">Automatic</option>
          <option value="label"${current === 'label' ? ' selected' : ''}>Custom label</option>
          ${ICON_OPTIONS.map(symbol => `<option value="${symbol}"${current === symbol ? ' selected' : ''}>${ICON_LABELS[symbol] ?? symbol[0].toUpperCase() + symbol.slice(1).replaceAll('-', ' ')}</option>`).join('')}
        </select></label>
        <div data-icon-label${current === 'label' ? '' : ' hidden'}>
          <label>Custom label <small>(up to ${CUSTOM_ICON_LIMIT} characters)</small>
            <input name="label" maxlength="${CUSTOM_ICON_LIMIT * 2}" value="${escapeHtml(saved?.text ?? '')}" required${current === 'label' ? '' : ' disabled'} placeholder="e.g. KNOT">
          </label>
        </div>
        <button type="submit" class="small-action">Save icon</button>
      </div>
    </form>
  </details>`;
}

function iconChoice(picker) {
  const symbol = picker.elements.symbol.value;
  return symbol === 'label' ? { text: picker.elements.label.value } : symbol ? { symbol } : undefined;
}

app.addEventListener('input', event => {
  const picker = event.target.closest('[data-icon-picker]');
  if (!picker) return;
  const island = world.islands.find(item => item.id === picker.dataset.islandId);
  if (!island) return;
  const choice = iconChoice(picker);
  const valid = readIslandIcon(choice);
  const label = picker.elements.label;
  label.disabled = picker.elements.symbol.value !== 'label';
  picker.querySelector('[data-icon-label]').hidden = label.disabled;
  label.setCustomValidity(!label.disabled && label.value && !valid ? `Enter 1–${CUSTOM_ICON_LIMIT} characters.` : '');
  picker.querySelector('.island-icon-preview').innerHTML = renderIconPreview({ ...island, iconOverride: valid });
});

function adoptRoadmap(template) {
  if (!validateAdoptableRoadmap(template).valid) return false;
  const controller = socialController;
  socialController = undefined;
  controller?.destroy();
  persist(adoptIsland(world, template));
  selectedId = world.islands.at(-1).id;
  activeView = 'world';
  logOpen = true;
  animateIsland = true;
  render();
  focusLog();
  announce(`${template.title} by ${template.attribution} adopted at Level 1 with 0 XP.`);
  void preparePractice(selectedId, true);
  return true;
}

function changeDemoVisibility(id, { isPublic }, persona) {
  if (!persona.isLocalViewer) return socialClient.setIslandVisibility(id, { isPublic });
  const island = world.islands.find(item => item.id === id);
  if (!island) throw new Error('This island is no longer available.');
  const shares = Array.isArray(world.demoShares) ? world.demoShares.filter(item => item.id !== id) : [];
  if (isPublic) {
    const share = toPublicIsland({ ...island, isPublic: true, shareObjective: false });
    if (!validateAdoptableRoadmap(toAdoptableRoadmap(share)).valid) {
      throw new Error('This island needs a complete starter exercise before it can be shared.');
    }
    shares.push(share);
  }
  persist({ ...world, demoShares: shares });
}

function render() {
  if (activeView === 'explore' && socialController) return;
  socialController?.destroy();
  socialController = undefined;
  disconnectMap?.();
  disconnectMap = undefined;
  const previousLog = app.querySelector('.map-log');
  const sameView = renderedView === activeView;
  const opening = logOpen && (!previousLog || previousLog.hidden || !sameView);
  const logScroll = sameView && !opening ? previousLog?.scrollTop : 0;
  mapResize.disconnect();
  worldTab.setAttribute('aria-pressed', String(activeView === 'world'));
  exploreTab.setAttribute('aria-pressed', String(activeView === 'explore'));
  const resetControl = world.islands?.length
    ? '<button type="button" class="testing-reset reset-islands-btn" data-action="reset-islands" title="Remove personal islands and reset your world">Reset personal islands</button>' : '';
  app.innerHTML = (activeView === 'world' ? currentWorld() : '<div class="explore-mount"></div>') +
    (storageUnavailable ? '<p class="storage-note">This browser blocked storage. Progress is available until you close or reload the page.</p>' : '') +
    `<footer><span>WORLDHOPPER</span>${resetControl}<span>WARWICKHACK 2026 / NEW WORLDS</span></footer>`;
  if (activeView === 'explore') {
    renderedView = 'explore';
    socialController = mountSocialExplore(app.querySelector('.explore-mount'), {
      client: socialClient, viewerWorld: world, onAdopt: adoptRoadmap, onAnnounce: announce,
      onTogglePublish: changeDemoVisibility,
    });
    return;
  }
  const map = app.querySelector('.island-water');
  if (map) {
    positionIslands(map);
    mapResize.observe(map);
  }
  const viewport = app.querySelector('.map-viewport');
  disconnectMap = connectMap(viewport, worldCamera);
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
  discardGoalRevision();
  logOpen = false;
  render();
  app.querySelector('[data-action="show-log"]').focus({ preventScroll: true });
}

app.addEventListener('keydown', event => {
  if (event.key === 'Escape' && logOpen && !dialog.open) closeLog();
});

app.addEventListener('toggle', event => {
  if (event.target.matches('.written-feedback[open]')) {
    event.target.scrollIntoView({ block: 'nearest' });
  }
}, true);

worldTab.addEventListener('click', () => changeView('world'));
exploreTab.addEventListener('click', () => changeView('explore'));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());

function discardDraft(islandId) {
  const draft = adaptationDrafts.get(islandId);
  adaptationDrafts.delete(islandId);
  draft?.controller.abort();
  return draft;
}

function discardGoalRevision() {
  const task = goalRevision;
  goalRevision = undefined;
  task?.controller?.abort();
}

function syncProgress(now = Date.now()) {
  const next = applyInactivity(world, now);
  if (next === world) return false;
  next.islands.forEach((island, index) => {
    const previous = world.islands[index];
    if (island.xp === previous.xp) return;
    const { id } = island;
    if (goalRevision?.islandId === id && getStage(island.xp).level !== getStage(previous.xp).level) discardGoalRevision();
    discardDraft(id);
    pendingPractice.get(id)?.controller.abort();
    pendingPractice.delete(id);
    practiceErrors.delete(id);
    const { level } = getStage(island.xp);
    if (id === selectedId && activeView === 'world' && logOpen) {
      announce((previous.xp - island.xp) + ' XP lost to inactivity.' +
        (level < getStage(previous.xp).level ? ' Island dropped to Level ' + level + '.' : ''));
    }
  });
  persist(next);
  return true;
}

function refreshMaintenance() {
  if (syncProgress()) {
    render();
    if (activeView === 'world' && logOpen && !dialog.open) void preparePractice(selectedId, true);
  } else {
    const countdown = app.querySelector('[data-maintenance]');
    const island = world.islands.find(item => item.id === selectedId);
    if (countdown && island) countdown.textContent = maintenanceMessage(island);
  }
  scheduleMaintenance();
}

function scheduleMaintenance() {
  clearTimeout(maintenanceTimer);
  const now = Date.now();
  const delay = world.islands.reduce((shortest, island) =>
    island.xp > 0 ? Math.min(shortest, island.nextXpLossAt - now) : shortest, 60000);
  maintenanceTimer = setTimeout(refreshMaintenance, Math.max(1, delay));
}

function resetIslandsForTesting() {
  if (!world.islands?.length) return;
  if (!window.confirm('Remove all your personal islands and progress from this browser? This cannot be undone.')) return;

  discardGoalRevision();
  for (const id of adaptationDrafts.keys()) discardDraft(id);
  for (const task of pendingPractice.values()) task.controller.abort();
  pendingPractice.clear();
  practiceErrors.clear();
  pendingCreation?.abort();
  pendingCreation = undefined;
  selectedId = undefined;
  revisingId = undefined;
  logOpen = false;
  animateIsland = false;
  levelUp = undefined;
  worldCamera.overview = true;
  persist(createWorld());
  render();
  app.querySelector('[data-action="new"]').focus({ preventScroll: true });
  announce('All local islands and progress cleared.');
}

function draftNextGoal(island, goalId) {
  discardDraft(island.id);
  if (!globalThis.LanguageModel) return;
  const request = getAdaptationRequest(island, goalId);
  if (!request) return;
  const controller = new AbortController();
  const draft = { goalId, controller, candidate: null };
  adaptationDrafts.set(island.id, draft);
  generateAdaptiveGoal(request, { signal: controller.signal, warmup: plannerWarmup }).then(candidate => {
    if (!controller.signal.aborted) draft.candidate = candidate;
  }).catch(() => {
    if (adaptationDrafts.get(island.id) === draft) discardDraft(island.id);
  });
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const { action, id, rating } = button.dataset;
  const now = Date.now();
  const previous = world.islands.find(island => island.id === selectedId);
  if (syncProgress(now)) {
    render();
    const current = world.islands.find(island => island.id === selectedId);
    if ((action === 'complete' || action === 'difficulty') && current &&
      (getStage(previous.xp).level !== getStage(current.xp).level || getActiveGoal(current)?.id !== id)) {
      void preparePractice(selectedId, true);
      return;
    }
  }
  if (action === 'reset-islands') {
    resetIslandsForTesting();
    return;
  }
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
    if (island) {
      const topic = island.topic || SKILLS[island.category]?.label || island.title;
      openOnboarding(topic, island.objective === topic ? '' : island.objective, island);
    }
    return;
  }
  if (action === 'generate-practice') {
    void preparePractice(id);
    return;
  }
  if (action === 'cancel-goal-revision') {
    const editor = goalRevision;
    discardGoalRevision();
    if (editor) goalRevision = { ...editor, controller: undefined };
    render();
    app.querySelector('#goal-note')?.focus({ preventScroll: true });
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
  if (action === 'select') {
    if (id !== selectedId) discardGoalRevision();
    selectedId = id;
    logOpen = true;
  }
  if (action === 'complete') {
    const island = world.islands.find(item => item.id === selectedId);
    if (!island) return;
    const goal = getActiveGoal(island);
    if (goal?.id !== id) return;
    discardGoalRevision();
    const draft = discardDraft(island.id);
    const next = completeGoal(world, island.id, id, draft?.goalId === id ? draft.candidate : null, now);
    if (next === world) return;
    const updated = next.islands.find(item => item.id === island.id);
    const newLevel = getStage(updated.xp).level;
    persist(next);
    const levelIncreased = newLevel > getStage(island.xp).level;
    if (levelIncreased) {
      const celebration = { islandId: island.id };
      levelUp = celebration;
      setTimeout(() => {
        if (levelUp !== celebration) return;
        levelUp = undefined;
        app.querySelector('.level-up-banner')?.remove();
        app.querySelector('.level-up-island')?.classList.remove('level-up-island');
      }, 2400);
    }
    const reward = updated.xp > island.xp ? (updated.xp - island.xp) + ' XP earned. ' : 'Mastery maintained. ';
    const nextGoal = getActiveGoal(updated);
    announce(reward + (levelIncreased ? 'Island advanced to Level ' + newLevel + '. ' : '')
      + (nextGoal?.adapted ? 'Next goal adapted to your feedback.' : nextGoal ? 'Next goal ready.' : 'Generate your next goal when you’re ready.'));
  }
  render();
  const nextFocus = app.querySelector(action === 'complete' ? '#active-goal-title' : '.field-notes h2');
  if (nextFocus) {
    if (nextFocus.matches('h2, h3')) nextFocus.tabIndex = -1;
    nextFocus.focus({ preventScroll: true });
  }
  if (action === 'complete' || action === 'select') void preparePractice(selectedId, true);
});

app.addEventListener('submit', async event => {
  const picker = event.target.closest('[data-icon-picker]');
  if (picker) {
    event.preventDefault();
    const updated = setIslandIcon(world, picker.dataset.islandId, iconChoice(picker));
    if (updated === world) return;
    persist(updated);
    render();
    app.querySelector('.island-icon-picker > summary')?.focus({ preventScroll: true });
    announce('Island icon saved.');
    return;
  }
  const editor = event.target.closest('[data-goal-revision]');
  if (!editor) return;
  event.preventDefault();
  if (goalRevision?.controller) return;
  const { islandId, goalId } = editor.dataset;
  const note = editor.elements.note.value.trim();
  if (!note || note.length > GOAL_FEEDBACK_LIMIT) {
    goalRevision = { islandId, goalId, note, error: `Describe what should change in 1–${GOAL_FEEDBACK_LIMIT} characters.` };
    render();
    app.querySelector('#goal-note')?.focus();
    return;
  }
  refreshMaintenance();
  const island = world.islands.find(item => item.id === islandId);
  const goal = island?.roadmap?.onDevice && getActiveGoal(island);
  if (islandId !== selectedId || goal?.id !== goalId) return;

  discardDraft(islandId);
  const prefetch = pendingPractice.get(islandId);
  pendingPractice.delete(islandId);
  prefetch?.controller.abort();
  const controller = new AbortController();
  const task = { islandId, goalId, note, controller };
  goalRevision = task;
  render();
  app.querySelector('[data-action="cancel-goal-revision"]')?.focus({ preventScroll: true });
  const result = await generateGoalRevision(island, goal, note, {
    warmup: plannerWarmup,
    skillLevel: getStage(island.xp).level, signal: controller.signal, allowDownload: true,
  }).catch(() => ({ status: 'retry' }));
  if (goalRevision !== task) return;
  refreshMaintenance();
  if (goalRevision !== task) return;
  const revised = result.status === 'ready' ? reviseActiveGoal(world, islandId, goalId, note, result.goal) : world;
  if (revised === world) {
    const error = result.status === 'clarify' ? 'Describe one specific change you’d like in this exercise.' :
      result.status === 'unsuitable' ? 'Try a safe practice change that fits this island’s skill.' :
      result.status === 'retry' ? 'Couldn’t write a different exercise. Try rephrasing your feedback.' :
      PLAN_ERRORS[result.status] ?? 'Couldn’t revise this goal. Try again.';
    goalRevision = { islandId, goalId, note, error };
    render();
    app.querySelector('#goal-note')?.focus();
    return;
  }
  goalRevision = undefined;
  persist(revised);
  render();
  app.querySelector('#active-goal-title')?.focus();
  announce('Goal revised. Your practice preference was saved.');
  void preparePractice(islandId, true);
});

async function preparePractice(id, ahead = false) {
  const island = world.islands.find(item => item.id === id);
  if (!island || pendingPractice.has(id) || dialog.open || goalRevision?.controller) return;
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
  const practiceLevel = plannedPracticeLevel(island, ahead);
  const result = await generateContinuation(context, {
    signal: controller.signal, allowDownload: !ahead, skillLevel: practiceLevel, warmup: plannerWarmup,
  });
  refreshMaintenance();
  if (pendingPractice.get(id)?.controller !== controller) return;
  pendingPractice.delete(id);
  const current = world.islands.find(item => item.id === id);
  const needsGoal = current && needsGeneratedPractice(current);
  if (result.status === 'ready') {
    const updated = appendGeneratedPractice(world, id, result.goal, { ahead, practiceLevel });
    if (updated !== world) {
      persist(updated);
      if (!needsGoal && current?.goalFeedback) draftNextGoal(updated.islands.find(item => item.id === id), current.goalFeedback.id);
    }
  } else if (needsGoal) {
    practiceErrors.set(id, PLAN_ERRORS[result.status] ?? 'Couldn’t generate a specific next goal. Try again when you’re ready.');
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
  let refreshWaitingGoal = Boolean(goalRevision);
  discardGoalRevision();
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
  personalisingRoadmap = canPersonaliseAdoptedRoadmap(island);
  onboardingTitle.textContent = personalisingRoadmap ? 'Personalise your roadmap' : island ? 'Update your roadmap' : 'Chart a new island';
  nameOption.open = false;
  nameOption.hidden = personalisingRoadmap;
  topicField.readOnly = personalisingRoadmap;
  topicField.value = topic;
  objectiveField.value = objective;
  if (island) {
    form.elements.title.value = island.title === island.topic ? '' : island.title;
    form.elements.experience.value = island.experience || 'beginner';
  }
  setCreating(false);
  dialog.showModal();
  if (personalisingRoadmap) form.elements.experience.focus();
}

function setCreating(creating) {
  createButton.disabled = creating;
  for (const field of form.querySelectorAll('input, select')) field.disabled = creating;
  createLabel.textContent = creating ? 'Building your practice plan…' :
    personalisingRoadmap ? 'Personalise my roadmap' : revisingId ? 'Update my roadmap' : 'Create my island';
}

form.addEventListener('input', () => setPlanMessage());

dialog.addEventListener('close', () => {
  if (dialog.open) return;
  pendingCreation?.abort();
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
  refreshMaintenance();
  const previous = world.islands.find(item => item.id === revisingId);
  const recent = previous?.goals.filter(goal => goal.completed).slice(-3).map(({ title, description }) => ({ title, description }));
  const skillLevel = getStage(previous?.xp ?? 0).level;
  const sourceGoal = personalisingRoadmap && previous?.goals.find(goal => !goal.completed);
  const adoptedRoadmap = personalisingRoadmap ? {
    objective: previous.objective,
    checkpoint: previous.roadmap?.checkpoint,
    exercise: sourceGoal ? { title: sourceGoal.title, practice: sourceGoal.description, finish: sourceGoal.finish } : undefined,
  } : undefined;
  const planInput = { ...input, topic, objective: input.objective.trim() || topic, minutes: previous?.sessionMinutes ?? 20, recent, adoptedRoadmap, skillLevel };
  const controller = new AbortController();
  pendingCreation = controller;
  setCreating(true);
  setPlanMessage('Preparing your tailored plan on this device…');
  const result = await generateStarterRoadmap(planInput, {
    signal: controller.signal, allowDownload: true, warmup: plannerWarmup,
    onStatus(status, progress) {
      if (status === 'downloading') setPlanMessage('Downloading this browser’s AI model' + (progress === undefined ? '…' : ' (' + progress + '%)…'));
      else if (status === 'starting') setPlanMessage('Starting Gemini Nano in Chrome…');
      else setPlanMessage('Writing your first tailored exercise…');
    },
  });
  if (pendingCreation !== controller) return;
  pendingCreation = undefined;
  setCreating(false);
  if (!dialog.open) return;
  if (result.status === 'cancelled') return;
  if (result.status !== 'ready') {
    setPlanMessage(PLAN_ERRORS[result.status], true);
    if (result.status === 'clarify') topicField.focus();
    else createButton.focus();
    return;
  }
  refreshMaintenance();
  if (previous && getStage(world.islands.find(item => item.id === previous.id)?.xp ?? 0).level !== skillLevel) {
    setPlanMessage('Your island changed levels while this goal was being prepared. Generate it again at your current level.', true);
    return;
  }
  const inputWithPlan = { ...planInput, localRoadmap: result.plan };
  const next = revisingId ? reviseIslandRoadmap(world, revisingId, inputWithPlan) : createGeneratedIsland(world, inputWithPlan);
  if (next === world) {
    setPlanMessage(PLAN_ERRORS.retry, true);
    return;
  }
  if (previous) {
    discardDraft(previous.id);
    pendingPractice.get(previous.id)?.controller.abort();
    pendingPractice.delete(previous.id);
    practiceErrors.delete(previous.id);
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
  announce(personalisingRoadmap ? 'Your personalised roadmap is ready.' : revisingId ? 'Your updated roadmap is ready.' : 'Your island is ready.');
  void preparePractice(selectedId, true);
});

syncProgress();
render();
window.addEventListener('focus', refreshMaintenance);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshMaintenance();
});
scheduleMaintenance();
