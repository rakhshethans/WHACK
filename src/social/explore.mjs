import { renderOcean, renderIsland } from '../scene.mjs';
import { getStage } from '../world.mjs';
import { SKILLS } from '../roadmaps.mjs';
import { connectMap } from '../map-camera.mjs';
import { toAdoptableRoadmap, validateAdoptableRoadmap } from './contracts.mjs';
import { createFixtureSocialClient } from './fixtures.mjs';
import { recommendExplorers } from './recommendations.mjs';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

const OCEAN_WIDTH = 2400;
const OCEAN_HEIGHT = 1680;
const HOME_CLUSTER_POS = { left: 890, top: 560, width: 620, centerX: 1200, centerY: 800 };

const NEIGHBOR_SECTORS = [
  { left: 140, top: 100, width: 620, centerX: 450, centerY: 340, compass: '↖ NW', coords: '14° 20′ N / 22° 10′ W', beaconX: 770, beaconY: 520 },
  { left: 1640, top: 100, width: 620, centerX: 1950, centerY: 340, compass: '↗ NE', coords: '16° 05′ N / 19° 40′ E', beaconX: 1510, beaconY: 520 },
  { left: 1640, top: 1060, width: 620, centerX: 1950, centerY: 1300, compass: '↘ SE', coords: '11° 45′ S / 24° 15′ E', beaconX: 1510, beaconY: 1040 },
  { left: 140, top: 1060, width: 620, centerX: 450, centerY: 1300, compass: '↙ SW', coords: '15° 10′ S / 18° 50′ W', beaconX: 770, beaconY: 1040 },
  { left: 1690, top: 580, width: 620, centerX: 2000, centerY: 820, compass: '→ E', coords: '02° 30′ N / 31° 00′ E', beaconX: 1545, beaconY: 785 },
  { left: 90, top: 580, width: 620, centerX: 400, centerY: 820, compass: '← W', coords: '03° 15′ N / 29° 50′ W', beaconX: 735, beaconY: 785 },
];

function sectorForIndex(index) {
  if (index < NEIGHBOR_SECTORS.length) return NEIGHBOR_SECTORS[index];
  const angle = (index * 1.15) % (Math.PI * 2);
  const left = Math.round(890 + Math.cos(angle) * 760);
  const top = Math.round(560 + Math.sin(angle) * 480);
  return {
    left,
    top,
    width: 620,
    centerX: left + 310,
    centerY: top + 220,
    compass: '◈',
    coords: '09° 00′ N / 15° 00′ E',
    beaconX: 1200,
    beaconY: 520,
  };
}

function renderHomeCluster(viewerWorld, activeCluster, selectedHomeIslandId) {
  const islands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  const isHomeSelected = activeCluster === 'home';

  return `<div class="archipelago-cluster home-cluster${isHomeSelected ? ' is-active-cluster' : ''}"
    data-cluster-id="home"
    style="left:${HOME_CLUSTER_POS.left}px;top:${HOME_CLUSTER_POS.top}px;width:${HOME_CLUSTER_POS.width}px;">
    <button type="button" class="cluster-banner home-cluster-banner" data-social-action="open-home" aria-pressed="${isHomeSelected}">
      <span class="cluster-banner-title"><span>✦</span> YOUR ARCHIPELAGO · HOME WATERS</span>
      <span class="cluster-banner-meta">${islands.length} ${islands.length === 1 ? 'island' : 'islands'} · Drag map in any direction to explore neighbours</span>
    </button>
    <div class="cluster-islands${islands.length <= 1 ? ' single-cluster-island' : ''}">
      ${islands.length > 0 ? islands.map(island => {
        const { level } = getStage(island.xp ?? 0);
        const selected = isHomeSelected && island.id === selectedHomeIslandId;
        const skill = island.topic || (Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill');
        return `<button type="button" class="map-island cluster-island-btn"
          data-social-action="select-home-island"
          data-island-id="${escapeHtml(island.id)}"
          aria-pressed="${selected}">
          <span class="island-art">${renderIsland(island, level)}</span>
          <span class="island-pin" title="${escapeHtml(island.title)}"><strong>${escapeHtml(island.title)}</strong><small>${skill === island.title ? '' : escapeHtml(skill) + ' · '}Lv ${level}</small></span>
        </button>`;
      }).join('') : `
        <button type="button" class="map-island cluster-island-btn" data-social-action="open-home" aria-pressed="${isHomeSelected}">
          <span class="island-art">${renderIsland({ category: 'guitar', title: 'Home Waters' }, 1)}</span>
          <span class="island-pin"><strong>Your Home Waters</strong><small>Drag the ocean to discover nearby worlds</small></span>
        </button>
      `}
    </div>
  </div>`;
}

function renderNeighborClusters(profiles, activeCluster, selectedIslandId) {
  return profiles.map((profile, index) => {
    const sector = sectorForIndex(index);
    const isClusterSelected = activeCluster === profile.id;
    const islands = profile.publicIslands ?? [];

    return `<div class="archipelago-cluster neighbor-cluster${isClusterSelected ? ' is-active-cluster' : ''}"
      data-cluster-id="${escapeHtml(profile.id)}"
      style="left:${sector.left}px;top:${sector.top}px;width:${sector.width}px;">
      <button type="button" class="cluster-banner"
        data-social-action="open-profile"
        data-profile-id="${escapeHtml(profile.id)}"
        aria-pressed="${isClusterSelected}">
        <span class="cluster-banner-title">
          <span>◈</span> ${escapeHtml(profile.displayName)} <small>@${escapeHtml(profile.handle)}</small>
        </span>
        <span class="cluster-banner-meta">
          ${escapeHtml(sector.compass)} · ${islands.length} ${islands.length === 1 ? 'island' : 'islands'} · ${profile.followerCount} ${profile.followerCount === 1 ? 'follower' : 'followers'}${profile.isFollowing ? ' · Following ✓' : ''}
        </span>
      </button>
      <div class="cluster-islands${islands.length === 1 ? ' single-cluster-island' : ''}">
        ${islands.map(island => {
          const selected = isClusterSelected && island.id === selectedIslandId;
          const level = island.level ?? 1;
          const skill = island.topic || (Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill');
          return `<button type="button" class="map-island cluster-island-btn"
            data-social-action="select-island"
            data-profile-id="${escapeHtml(profile.id)}"
            data-id="${escapeHtml(island.id)}"
            data-island-id="${escapeHtml(island.id)}"
            aria-pressed="${selected}">
            <span class="island-art">${renderIsland(island, level)}</span>
            <span class="island-pin" title="${escapeHtml(island.title)}">
              <strong>${escapeHtml(island.title)}</strong>
              <small>${skill === island.title ? '' : escapeHtml(skill) + ' · '}Lv ${level}</small>
            </span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderDirectionalBeacons(profiles, activeCluster) {
  return profiles.slice(0, NEIGHBOR_SECTORS.length).map((profile, index) => {
    const sector = sectorForIndex(index);
    const active = activeCluster === profile.id;
    return `<button type="button" class="ocean-wayfinder${active ? ' is-active' : ''}"
      style="left:${sector.beaconX}px;top:${sector.beaconY}px;"
      data-social-action="open-profile"
      data-profile-id="${escapeHtml(profile.id)}"
      title="Pan to ${escapeHtml(profile.displayName)}’s islands (${escapeHtml(sector.compass)})">
      <span>${escapeHtml(sector.compass)}</span> <strong>${escapeHtml(profile.displayName)}</strong>
    </button>`;
  }).join('');
}

function renderSharedOceanMap({ viewerWorld, profiles, activeCluster, selectedProfile, selectedIsland, selectedHomeIslandId, logOpen }) {
  const totalPublicIslands = profiles.reduce((sum, p) => sum + (p.publicIslands?.length ?? 0), 0);
  const coordLabel = activeCluster === 'home'
    ? 'YOUR ARCHIPELAGO · DRAG TO EXPLORE NEARBY WORLDS'
    : selectedProfile
      ? `${escapeHtml(selectedProfile.displayName.toUpperCase())} (@${escapeHtml(selectedProfile.handle)}) · ${selectedProfile.isSample ? 'SAMPLE ARCHIPELAGO' : 'PUBLIC ARCHIPELAGO'}`
      : 'SHARED OCEAN ATLAS';

  return `<section class="map-frame archipelago-frame social-ocean-frame" aria-label="Shared ocean archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="Click and drag the ocean map to explore nearby groups of islands">
      <div class="map-scene social-ocean-scene" style="width:${OCEAN_WIDTH}px;height:${OCEAN_HEIGHT}px;">
        <div class="map-water">${renderOcean(true)}</div>
        <div class="island-water social-cluster-water" style="width:${OCEAN_WIDTH}px;height:${OCEAN_HEIGHT}px;">
          ${renderHomeCluster(viewerWorld, activeCluster, selectedHomeIslandId)}
          ${renderDirectionalBeacons(profiles, activeCluster)}
          ${renderNeighborClusters(profiles, activeCluster, selectedIsland?.id)}
        </div>
      </div>
    </div>
    <div class="map-coordinates"><span>✦</span> ${coordLabel}</div>
    <div class="map-tools" role="group" aria-label="Map controls">
      <button type="button" data-social-action="center-home" title="Return to your islands">My islands</button>
      <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
      <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" data-zoom="reset" aria-label="Overview all archipelagos">All worlds</button>
    </div>
    <div class="map-footer">
      <span><i></i> ${profiles.length} NEARBY ${profiles.length === 1 ? 'ARCHIPELAGO' : 'ARCHIPELAGOS'} (${totalPublicIslands} ISLANDS)</span>
      <span class="map-pan-hint">Click &amp; drag to nearby island groups</span>
      <button type="button" data-social-action="show-log" aria-controls="social-island-log" aria-expanded="${logOpen}">
        ${activeCluster === 'home' ? 'My visibility & matches' : 'Explorer log'}
      </button>
    </div>
  </section>`;
}

function renderGoalRoadmapList(goals = []) {
  if (!goals.length) return '<p class="caption">No starter goals published.</p>';
  return `<ol class="social-goal-list" aria-label="Starter roadmap goals">
    ${goals.map((goal, idx) => {
      const prereqLabel = Array.isArray(goal.prerequisites) && goal.prerequisites.length > 0
        ? `Requires ${goal.prerequisites.join(', ')}`
        : 'Starter step';
      return `<li class="social-goal-item">
        <div class="social-goal-header">
          <strong>${idx + 1}. ${escapeHtml(goal.title)}</strong>
          <span class="goal-meta">${escapeHtml(goal.minutes)} MIN · ${escapeHtml(prereqLabel)}</span>
        </div>
        <p class="social-goal-practice">${escapeHtml(goal.practice || goal.description)}</p>
        <p class="goal-finish"><strong>Done when</strong> ${escapeHtml(goal.finish)}</p>
      </li>`;
    }).join('')}
  </ol>`;
}

function renderRecommendationsSection(matches = [], selectedProfileId) {
  if (!matches.length) return '';
  return `<details class="roadmap-summary social-compass-details" open>
    <summary>Social compass (${matches.slice(0, 3).length} explainable matches)</summary>
    <div class="social-match-grid">
      ${matches.slice(0, 3).map(match => {
        const { profile, category, reason, featuredIsland } = match;
        const isCurrent = profile.id === selectedProfileId;
        return `<article class="social-match-card${isCurrent ? ' is-selected' : ''}" data-match-category="${escapeHtml(category)}">
          <div class="social-match-top">
            <span class="eyebrow">${escapeHtml(category.toUpperCase())}</span>
            <span class="social-badge">${profile.isSample ? 'Sample profile' : 'Explorer'}</span>
          </div>
          <h3>${escapeHtml(profile.displayName)} <small>@${escapeHtml(profile.handle)}</small></h3>
          <p class="social-match-reason">${escapeHtml(reason)}</p>
          <div class="social-match-actions">
            <button type="button" class="small-action" data-social-action="open-profile" data-profile-id="${escapeHtml(profile.id)}" aria-pressed="${isCurrent}">
              ${isCurrent ? 'Viewing island group' : `Pan to ${escapeHtml(profile.displayName)}’s islands ↗`}
            </button>
            ${featuredIsland ? `<span class="caption">Featured: ${escapeHtml(featuredIsland.title)} (Lv ${escapeHtml(featuredIsland.level)})</span>` : ''}
          </div>
        </article>`;
      }).join('')}
    </div>
  </details>`;
}

function renderViewerSharingSection(viewerWorld, publishedMap, onTogglePublish, openByDefault = false) {
  const islands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  if (!islands.length && !onTogglePublish) return '';
  return `<details class="roadmap-summary social-sharing-details"${openByDefault ? ' open' : ''}>
    <summary>Your island visibility (opt-in)</summary>
    <p class="caption">Islands are private by default. Publishing shares only the island title, stage, public summary, and starter roadmap—never your email, private objectives, or completion log.</p>
    ${islands.length ? `<div class="social-sharing-list">
      ${islands.map(island => {
        const isPublic = Boolean(publishedMap.get(island.id) ?? island.isPublic);
        return `<div class="social-share-item">
          <span><strong>${escapeHtml(island.title)}</strong> <small>(${isPublic ? 'Public opt-in' : 'Private'})</small></span>
          <button type="button" class="small-action" data-social-action="toggle-island-visibility" data-island-id="${escapeHtml(island.id)}" aria-pressed="${isPublic}">
            ${isPublic ? 'Make private' : 'Publish roadmap'}
          </button>
        </div>`;
      }).join('')}
    </div>` : '<p class="caption">Create an island in My world to publish its roadmap whenever you are ready.</p>'}
  </details>`;
}

/**
 * Mounts the WorldHopper Social Explore experience inside `container`.
 */
export function mountSocialExplore(container, {
  client = createFixtureSocialClient(),
  onAdopt,
  viewerWorld = { islands: [] },
  onAnnounce,
  onTogglePublish,
} = {}) {
  if (!container) {
    throw new Error('mountSocialExplore requires a target container element.');
  }

  let currentViewerWorld = viewerWorld;
  let disconnectMap;
  let cameraInitialized = false;
  let pendingCameraTarget = 'home'; // 'home' | profileId | null
  const camera = { overview: false, zoom: 1, left: 600, top: 400 };

  const state = {
    status: 'loading', // 'loading' | 'ready' | 'empty' | 'error'
    errorMessage: '',
    filter: 'all',
    profiles: [],
    matches: [],
    activeCluster: 'home', // 'home' | profileId
    selectedProfileId: null,
    selectedIslandId: null,
    selectedHomeIslandId: currentViewerWorld?.islands?.[0]?.id ?? null,
    logOpen: false, // Default view shows only the ocean map centered on current user's islands
    statusBanner: '',
    publishedIslands: new Map(),
  };

  for (const island of currentViewerWorld?.islands ?? []) {
    state.publishedIslands.set(island.id, Boolean(island.isPublic));
  }

  function announce(message) {
    state.statusBanner = message;
    if (typeof onAnnounce === 'function') {
      onAnnounce(message);
    }
  }

  function getSelectedProfile() {
    return state.profiles.find(profile => profile.id === state.selectedProfileId) ?? state.profiles[0] ?? null;
  }

  function getSelectedIsland(profile) {
    if (!profile || !Array.isArray(profile.publicIslands) || !profile.publicIslands.length) {
      return null;
    }
    return profile.publicIslands.find(island => island.id === state.selectedIslandId) ?? profile.publicIslands[0];
  }

  function cleanupMapBindings() {
    disconnectMap?.();
    disconnectMap = undefined;
  }

  function centerViewportOn(viewport, targetClusterId) {
    if (!viewport || typeof viewport.scrollTo !== 'function') return;
    const vw = viewport.clientWidth || 960;
    const vh = viewport.clientHeight || 600;

    let targetCenter = { x: HOME_CLUSTER_POS.centerX, y: HOME_CLUSTER_POS.centerY };
    if (targetClusterId && targetClusterId !== 'home') {
      const idx = state.profiles.findIndex(p => p.id === targetClusterId);
      if (idx >= 0) {
        const sector = sectorForIndex(idx);
        targetCenter = { x: sector.centerX, y: sector.centerY };
      }
    }

    camera.overview = false;
    camera.zoom = Math.max(0.85, Math.min(1, vw / 760));
    camera.left = Math.max(0, Math.round(targetCenter.x * camera.zoom - vw / 2));
    camera.top = Math.max(0, Math.round(targetCenter.y * camera.zoom - vh / 2));
  }

  function bindInteractiveMap() {
    if (typeof container.querySelector !== 'function') return;
    const viewport = container.querySelector('.map-viewport');
    if (!viewport || typeof ResizeObserver === 'undefined') return;

    if (!cameraInitialized || pendingCameraTarget) {
      centerViewportOn(viewport, pendingCameraTarget || 'home');
      cameraInitialized = true;
      pendingCameraTarget = null;
    }

    disconnectMap = connectMap(viewport, camera);
    const frame = viewport.closest('.map-frame');
    const hint = frame?.querySelector('.map-pan-hint');
    if (hint && !camera.overview) {
      hint.textContent = 'Click & drag to nearby island groups';
    }
  }

  function render() {
    cleanupMapBindings();

    const filterButtons = [
      ['all', 'All worlds'],
      ['following', 'Following'],
      ['guitar', 'Guitar'],
      ['songwriting', 'Songwriting'],
      ['photography', 'Photography'],
      ['custom', 'Custom skills'],
    ];

    const filterNav = `<div class="social-filter-bar" role="toolbar" aria-label="Filter nearby archipelagos">
      ${filterButtons.map(([value, label]) => (
        `<button type="button" class="social-filter-chip" data-social-action="filter" data-filter="${value}" aria-pressed="${state.filter === value}">${escapeHtml(label)}</button>`
      )).join('')}
    </div>`;

    const introHeader = `<div class="intro social-intro">
      <div>
        <h1>Beyond your shore<span>.</span></h1>
        <p class="lede">Start at your own islands, then click and drag across the ocean to discover nearby island groups owned by other explorers.</p>
      </div>
      ${filterNav}
    </div>`;

    if (state.status === 'loading') {
      container.setAttribute('aria-busy', 'true');
      container.innerHTML = `<div class="social-explore" data-social-state="loading">
        ${introHeader}
        <div class="workspace">
          <section class="field-notes social-state-card" role="status" aria-live="polite">
            <p class="eyebrow">LOADING PUBLIC ATLAS</p>
            <h2>Scanning nearby waters…</h2>
            <p>Charting neighbouring archipelagos and public skill roadmaps.</p>
          </section>
        </div>
      </div>`;
      return;
    }

    container.setAttribute('aria-busy', 'false');

    if (state.status === 'error') {
      container.innerHTML = `<div class="social-explore" data-social-state="error">
        ${introHeader}
        <div class="workspace">
          <section class="field-notes social-state-card social-error-card" role="alert">
            <p class="eyebrow">CONNECTION INTERRUPTED</p>
            <h2>Unable to load public worlds</h2>
            <p>${escapeHtml(state.errorMessage || 'Could not reach the public atlas service.')}</p>
            <button type="button" class="primary" data-social-action="retry">Try again ↻</button>
          </section>
        </div>
      </div>`;
      return;
    }

    if (state.status === 'empty' || state.profiles.length === 0) {
      const emptyReason = state.filter === 'following'
        ? 'You are not following any explorers yet. Click any nearby island group on the map to follow its creator.'
        : 'No public worlds match this filter yet.';
      container.innerHTML = `<div class="social-explore" data-social-state="empty">
        ${introHeader}
        <div class="workspace">
          <section class="field-notes social-state-card" role="status">
            <p class="eyebrow">OPEN WATERS / 0 PUBLIC WORLDS</p>
            <h2>No public worlds in sight</h2>
            <p>${escapeHtml(emptyReason)}</p>
            ${state.filter !== 'all' ? '<button type="button" class="small-action" data-social-action="filter" data-filter="all">Show all public worlds ↗</button>' : ''}
            ${renderViewerSharingSection(currentViewerWorld, state.publishedIslands, onTogglePublish, true)}
          </section>
        </div>
      </div>`;
      return;
    }

    const activeProfile = getSelectedProfile();
    const activeIsland = getSelectedIsland(activeProfile);
    const firstGoal = activeIsland?.goals?.[0];
    const viewingHome = state.activeCluster === 'home';

    const logDrawerContent = viewingHome ? `
      <p class="eyebrow">HOME ARCHIPELAGO / YOUR ISLANDS</p>
      <h2>Your waters</h2>
      <p>Your islands sit at the centre of the shared ocean. Drag the map in any direction—or pick a match below—to inspect another explorer’s island group.</p>
      ${renderViewerSharingSection(currentViewerWorld, state.publishedIslands, onTogglePublish, true)}
      ${renderRecommendationsSection(state.matches, null)}
    ` : activeProfile && activeIsland ? `
      <p class="eyebrow">EXPLORER ARCHIPELAGO / ${activeProfile.isSample ? 'SAMPLE PROFILE' : 'PUBLIC PROFILE'}</p>
      <h2>${escapeHtml(activeProfile.displayName)}</h2>
      <p class="stage-name">@${escapeHtml(activeProfile.handle)} · ${activeProfile.publicIslandCount} public ${activeProfile.publicIslandCount === 1 ? 'island' : 'islands'} · ${activeProfile.followerCount} ${activeProfile.followerCount === 1 ? 'follower' : 'followers'}</p>
      ${activeProfile.bio ? `<p class="caption">${escapeHtml(activeProfile.bio)}</p>` : ''}
      <div class="social-profile-actions">
        <button type="button" class="small-action" data-social-action="${activeProfile.isFollowing ? 'unfollow' : 'follow'}" data-profile-id="${escapeHtml(activeProfile.id)}" aria-pressed="${activeProfile.isFollowing}">
          ${activeProfile.isFollowing ? 'Following ✓' : '+ Follow ' + escapeHtml(activeProfile.displayName)} (${activeProfile.followerCount})
        </button>
        <span class="social-badge">${activeProfile.isSample ? 'Sample profile' : 'Opt-in Public'}</span>
      </div>

      <div class="social-cluster-island-tabs" role="group" aria-label="${escapeHtml(activeProfile.displayName)}’s islands">
        <p class="eyebrow">ISLANDS IN THIS GROUP</p>
        <div class="social-cluster-tab-row">
          ${activeProfile.publicIslands.map(island => (
            `<button type="button" class="social-filter-chip" data-social-action="select-island" data-profile-id="${escapeHtml(activeProfile.id)}" data-island-id="${escapeHtml(island.id)}" aria-pressed="${island.id === activeIsland.id}">
              ${escapeHtml(island.title)} · Lv ${escapeHtml(island.level)}
            </button>`
          )).join('')}
        </div>
      </div>

      <section class="social-selected-island-card" aria-label="Selected island details">
        <p class="eyebrow">SELECTED ISLAND / LEVEL ${escapeHtml(activeIsland.level)} ${escapeHtml(activeIsland.stageName.toUpperCase())}</p>
        <h3>${escapeHtml(activeIsland.title)}</h3>
        <p class="social-island-summary">${escapeHtml(activeIsland.publicSummary)}.</p>
        ${activeIsland.sharedMilestone ? `<p class="caption"><strong>Shared milestone:</strong> ${escapeHtml(activeIsland.sharedMilestone)}</p>` : ''}
        ${firstGoal ? `<p><strong>First goal</strong><br>${escapeHtml(firstGoal.title)}</p>` : ''}
        <button type="button" class="primary social-adopt-btn" data-social-action="adopt" data-island-id="${escapeHtml(activeIsland.id)}" data-profile-id="${escapeHtml(activeProfile.id)}">
          Adopt roadmap <span aria-hidden="true">↗</span>
        </button>
        <p class="caption">Starts at Level 1 with 0 XP in your archipelago. Attribution to ${escapeHtml(activeProfile.displayName)} is preserved.</p>
      </section>

      <details class="roadmap-summary" open>
        <summary>Starter roadmap (${activeIsland.goals.length} goals)</summary>
        <p><strong>Focus</strong><span>${escapeHtml(activeIsland.roadmap?.focus)}</span></p>
        ${activeIsland.roadmap?.checkpoint ? `<p><strong>Checkpoint</strong><span>${escapeHtml(activeIsland.roadmap.checkpoint)}</span></p>` : ''}
        ${renderGoalRoadmapList(activeIsland.goals)}
      </details>
      ${renderRecommendationsSection(state.matches, activeProfile.id)}
    ` : `<p class="eyebrow">PUBLIC ATLAS</p><h2>Select an island group</h2><p>Click any group of islands on the ocean map to inspect the user and their roadmaps.</p>`;

    const logDrawer = `<aside class="field-notes map-log" id="social-island-log" aria-label="Explorer and island details" ${state.logOpen ? '' : 'hidden'}>
      <button type="button" class="icon log-close" data-social-action="close-log" aria-label="Close island log">×</button>
      ${logDrawerContent}
      ${state.statusBanner ? `<p class="caption social-status-banner" role="status">${escapeHtml(state.statusBanner)}</p>` : ''}
    </aside>`;

    container.innerHTML = `<div class="social-explore" data-social-state="ready">
      ${introHeader}
      <div class="workspace">
        ${renderSharedOceanMap({
          viewerWorld: currentViewerWorld,
          profiles: state.profiles,
          activeCluster: state.activeCluster,
          selectedProfile: activeProfile,
          selectedIsland: activeIsland,
          selectedHomeIslandId: state.selectedHomeIslandId,
          logOpen: state.logOpen,
        })}
        ${logDrawer}
      </div>
    </div>`;

    bindInteractiveMap();
  }

  async function load({ filter = state.filter, preserveSelection = true } = {}) {
    state.filter = filter;
    state.status = 'loading';
    state.errorMessage = '';
    render();

    try {
      const profiles = await client.listPublicProfiles({ filter });
      state.profiles = Array.isArray(profiles) ? profiles : [];

      if (typeof client.recommendPeople === 'function') {
        state.matches = await client.recommendPeople({ viewerWorld: currentViewerWorld });
      } else {
        state.matches = recommendExplorers(currentViewerWorld, state.profiles);
      }

      if (state.profiles.length === 0) {
        state.status = 'empty';
        state.selectedProfileId = null;
        state.selectedIslandId = null;
      } else {
        state.status = 'ready';
        const stillExists = preserveSelection && state.profiles.some(p => p.id === state.selectedProfileId);
        const activeProfile = stillExists
          ? state.profiles.find(p => p.id === state.selectedProfileId)
          : state.profiles[0];
        state.selectedProfileId = activeProfile.id;

        const islandExists = preserveSelection && activeProfile.publicIslands.some(i => i.id === state.selectedIslandId);
        state.selectedIslandId = islandExists
          ? state.selectedIslandId
          : activeProfile.publicIslands[0]?.id ?? null;

        if (!preserveSelection) {
          state.activeCluster = 'home';
          state.logOpen = false;
          pendingCameraTarget = 'home';
        }
      }
    } catch (error) {
      state.status = 'error';
      state.errorMessage = error?.message || 'Unable to load public worlds.';
    }

    render();
  }

  async function handleAction(event) {
    const button = event.target.closest('button[data-social-action]');
    if (!button) return;

    const action = button.dataset.socialAction;
    const profileId = button.dataset.profileId;
    const islandId = button.dataset.islandId || button.dataset.id;

    if (action === 'close-log') {
      state.logOpen = false;
      render();
      return;
    }

    if (action === 'show-log') {
      state.logOpen = !state.logOpen;
      render();
      return;
    }

    if (action === 'center-home') {
      state.activeCluster = 'home';
      pendingCameraTarget = 'home';
      announce('Centered on your home archipelago.');
      render();
      return;
    }

    if (action === 'open-home' || action === 'select-home-island') {
      state.activeCluster = 'home';
      if (islandId) state.selectedHomeIslandId = islandId;
      state.logOpen = true;
      pendingCameraTarget = 'home';
      announce('Viewing your home archipelago and visibility settings.');
      render();
      return;
    }

    if (action === 'retry') {
      await load({ filter: state.filter, preserveSelection: true });
      return;
    }

    if (action === 'filter') {
      const nextFilter = button.dataset.filter || 'all';
      await load({ filter: nextFilter, preserveSelection: true });
      return;
    }

    if (action === 'open-profile') {
      state.logOpen = true;
      const targetProfile = state.profiles.find(p => p.id === profileId);
      if (targetProfile) {
        state.activeCluster = targetProfile.id;
        state.selectedProfileId = targetProfile.id;
        state.selectedIslandId = targetProfile.publicIslands[0]?.id ?? null;
        pendingCameraTarget = targetProfile.id;
        announce(`Opened ${targetProfile.displayName}’s island group.`);
        render();
      } else if (typeof client.getPublicWorld === 'function') {
        try {
          const worldData = await client.getPublicWorld(profileId);
          if (worldData?.profile) {
            const exists = state.profiles.some(p => p.id === worldData.profile.id);
            if (!exists) state.profiles = [worldData.profile, ...state.profiles];
            state.activeCluster = worldData.profile.id;
            state.selectedProfileId = worldData.profile.id;
            state.selectedIslandId = worldData.islands?.[0]?.id ?? null;
            state.status = 'ready';
            pendingCameraTarget = worldData.profile.id;
            announce(`Opened ${worldData.profile.displayName}’s island group.`);
            render();
          }
        } catch (error) {
          announce(error?.message || 'Could not open that public world.');
          render();
        }
      }
      return;
    }

    if (action === 'select-island') {
      if (profileId) {
        state.selectedProfileId = profileId;
        state.activeCluster = profileId;
      } else {
        const owner = state.profiles.find(p => p.publicIslands.some(i => i.id === islandId));
        if (owner) {
          state.selectedProfileId = owner.id;
          state.activeCluster = owner.id;
        }
      }
      state.selectedIslandId = islandId;
      state.logOpen = true;
      const activeProfile = getSelectedProfile();
      const activeIsland = getSelectedIsland(activeProfile);
      if (activeIsland && activeProfile) {
        announce(`Inspecting ${activeIsland.title} in ${activeProfile.displayName}’s archipelago.`);
      }
      render();
      return;
    }

    if (action === 'follow' || action === 'unfollow') {
      try {
        const result = action === 'follow'
          ? await client.followProfile(profileId)
          : await client.unfollowProfile(profileId);

        state.profiles = state.profiles.map(profile => (
          profile.id === profileId
            ? { ...profile, isFollowing: result.isFollowing, followerCount: result.followerCount }
            : profile
        ));
        state.matches = state.matches.map(match => (
          match.profile.id === profileId
            ? { ...match, profile: { ...match.profile, isFollowing: result.isFollowing, followerCount: result.followerCount } }
            : match
        ));

        const target = state.profiles.find(p => p.id === profileId);
        if (state.filter === 'following' && !result.isFollowing) {
          state.profiles = state.profiles.filter(p => p.isFollowing);
          if (state.profiles.length === 0) {
            state.status = 'empty';
          } else if (state.selectedProfileId === profileId) {
            state.selectedProfileId = state.profiles[0].id;
            state.selectedIslandId = state.profiles[0].publicIslands[0]?.id ?? null;
          }
        }

        announce(
          result.isFollowing
            ? `Now following ${target?.displayName ?? 'explorer'}.`
            : `Unfollowed ${target?.displayName ?? 'explorer'}.`,
        );
        render();
      } catch (error) {
        announce(error?.message || 'Unable to update follow status.');
        render();
      }
      return;
    }

    if (action === 'adopt') {
      const activeProfile = state.profiles.find(p => p.id === profileId) ?? getSelectedProfile();
      const activeIsland = activeProfile?.publicIslands.find(i => i.id === islandId) ?? getSelectedIsland(activeProfile);
      if (!activeIsland) return;

      const template = toAdoptableRoadmap(activeIsland, activeProfile);
      const validation = validateAdoptableRoadmap(template);
      if (!validation.valid) {
        announce(`Cannot adopt roadmap: ${validation.errors.join(' ')}`);
        render();
        return;
      }

      if (typeof onAdopt === 'function') {
        onAdopt(template, { island: activeIsland, profile: activeProfile });
      }
      announce(`${template.title} by ${template.attribution} adopted at Level 1 with 0 XP.`);
      render();
      return;
    }

    if (action === 'toggle-island-visibility') {
      const current = Boolean(state.publishedIslands.get(islandId));
      const nextPublic = !current;
      state.publishedIslands.set(islandId, nextPublic);
      if (typeof onTogglePublish === 'function') {
        await onTogglePublish(islandId, { isPublic: nextPublic });
      } else if (typeof client.setIslandVisibility === 'function') {
        try {
          await client.setIslandVisibility(islandId, { isPublic: nextPublic });
        } catch {
          // Local viewer islands may not be in remote fixture records yet; keep local opt-in state
        }
      }
      announce(nextPublic ? 'Island roadmap published (opt-in).' : 'Island set to private.');
      render();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && state.logOpen) {
      state.logOpen = false;
      render();
      if (typeof container.querySelector === 'function') {
        container.querySelector('[data-social-action="show-log"]')?.focus?.({ preventScroll: true });
      }
    }
  }

  container.addEventListener('click', handleAction);
  if (typeof container.addEventListener === 'function') {
    container.addEventListener('keydown', handleKeydown);
  }

  const initialLoadPromise = load({ filter: 'all', preserveSelection: false });

  return {
    ready: initialLoadPromise,
    async refresh({ viewerWorld: nextWorld, filter } = {}) {
      if (nextWorld) {
        currentViewerWorld = nextWorld;
        for (const island of currentViewerWorld?.islands ?? []) {
          if (!state.publishedIslands.has(island.id)) {
            state.publishedIslands.set(island.id, Boolean(island.isPublic));
          }
        }
      }
      await load({ filter: filter ?? state.filter, preserveSelection: true });
    },
    getState() {
      return {
        status: state.status,
        filter: state.filter,
        profiles: state.profiles,
        matches: state.matches,
        activeCluster: state.activeCluster,
        selectedProfileId: state.selectedProfileId,
        selectedIslandId: state.selectedIslandId,
        logOpen: state.logOpen,
        publishedIslands: Object.fromEntries(state.publishedIslands),
      };
    },
    destroy() {
      cleanupMapBindings();
      container.removeEventListener('click', handleAction);
      container.removeEventListener?.('keydown', handleKeydown);
    },
  };
}
