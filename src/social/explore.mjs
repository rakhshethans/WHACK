import { renderOcean, renderIsland } from '../scene.mjs';
import { getStage } from '../world.mjs';
import { SKILLS } from '../roadmaps.mjs';
import { layoutIslands } from '../map-layout.mjs';
import { connectMap } from '../map-camera.mjs';
import { toAdoptableRoadmap, toPublicIsland, validateAdoptableRoadmap } from './contracts.mjs';
import { createFixtureSocialClient } from './fixtures.mjs';
import { rankNeighborsByGraph, normalizeIslandSkill } from './graph.mjs';
import { recommendExplorers } from './recommendations.mjs';
import { iconForTopic } from '../generated-icons.mjs';

const SAMPLE_ROADMAPS = [
  ['user-maya', 'island-chord-coast', 'The Chord Coast'],
  ['user-noah', 'island-verse-dunes', 'Verse Dunes'],
  ['user-ari', 'island-silver-lens', 'Silver Lens'],
];

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

export const OCEAN_WIDTH = 2800;
export const OCEAN_HEIGHT = 1960;
export const HOME_CLUSTER_POS = {
  left: 1090,
  top: 760,
  width: 620,
  height: 360,
  centerX: 1400,
  centerY: 940,
};

/**
 * 8 collision-free compass sectors around Home Waters (`HOME_CLUSTER_POS`).
 * Every sector has >= 240px vertical clearance and >= 310px horizontal clearance from
 * Home Waters and every other sector.
 */
export const NEIGHBOR_SECTORS = [
  { index: 0, left: 180, top: 140, width: 600, height: 360, centerX: 480, centerY: 320, compass: '↖ NW', beaconX: 980, beaconY: 690 },
  { index: 1, left: 1100, top: 70, width: 600, height: 360, centerX: 1400, centerY: 250, compass: '↑ N', beaconX: 1400, beaconY: 660 },
  { index: 2, left: 2020, top: 140, width: 600, height: 360, centerX: 2320, centerY: 320, compass: '↗ NE', beaconX: 1820, beaconY: 690 },
  { index: 3, left: 2060, top: 760, width: 600, height: 360, centerX: 2360, centerY: 940, compass: '→ E', beaconX: 1840, beaconY: 940 },
  { index: 4, left: 2020, top: 1380, width: 600, height: 360, centerX: 2320, centerY: 1560, compass: '↘ SE', beaconX: 1820, beaconY: 1190 },
  { index: 5, left: 1100, top: 1450, width: 600, height: 360, centerX: 1400, centerY: 1630, compass: '↓ S', beaconX: 1400, beaconY: 1220 },
  { index: 6, left: 180, top: 1380, width: 600, height: 360, centerX: 480, centerY: 1560, compass: '↙ SW', beaconX: 980, beaconY: 1190 },
  { index: 7, left: 140, top: 760, width: 600, height: 360, centerX: 440, centerY: 940, compass: '← W', beaconX: 960, beaconY: 940 },
];

function renderHomeCluster(viewerWorld, activePersona, activeCluster, selectedHomeIslandId) {
  const islands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  const isHomeSelected = activeCluster === 'home';
  const bannerLabel = activePersona && !activePersona.isLocalViewer
    ? `${escapeHtml(activePersona.displayName.toUpperCase())}’S ARCHIPELAGO · HOME WATERS`
    : 'YOUR ARCHIPELAGO · HOME WATERS';

  return `<div class="archipelago-cluster home-cluster${isHomeSelected ? ' is-active-cluster' : ''}"
    data-cluster-id="home"
    style="left:${HOME_CLUSTER_POS.left}px;top:${HOME_CLUSTER_POS.top}px;width:${HOME_CLUSTER_POS.width}px;">
    <button type="button" class="cluster-banner home-cluster-banner" data-social-action="open-home" aria-pressed="${isHomeSelected}">
      <span class="cluster-banner-title"><span>✦</span> ${bannerLabel}</span>
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
          <span class="island-art">${renderIsland(island, level, iconForTopic(
            Array.isArray(viewerWorld.islandIcons) ? viewerWorld.islandIcons : [], island.topic,
          ))}</span>
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

function renderNeighborClusters(neighborEntries, activeCluster, selectedIslandId) {
  return neighborEntries.map(entry => {
    const { profile, sector, reasonLabel } = entry;
    const isClusterSelected = activeCluster === profile.id;
    const islands = profile.publicIslands ?? [];

    return `<div class="archipelago-cluster neighbor-cluster${isClusterSelected ? ' is-active-cluster' : ''}"
      data-cluster-id="${escapeHtml(profile.id)}"
      data-sector-index="${sector.index}"
      style="left:${sector.left}px;top:${sector.top}px;width:${sector.width}px;">
      <button type="button" class="cluster-banner"
        data-social-action="open-profile"
        data-profile-id="${escapeHtml(profile.id)}"
        aria-pressed="${isClusterSelected}">
        <span class="cluster-banner-title">
          <span>◈</span> ${escapeHtml(profile.displayName)} <small>@${escapeHtml(profile.handle)}</small>
        </span>
        <span class="cluster-affinity-badge">${escapeHtml(reasonLabel)}</span>
        <span class="cluster-banner-meta">
          ${escapeHtml(sector.compass)} · ${islands.length} ${islands.length === 1 ? 'island' : 'islands'} · ${profile.followerCount} ${profile.followerCount === 1 ? 'follower' : 'followers'}${profile.isFollowing ? ' · Following ✓' : ''}
        </span>
      </button>
      <div class="cluster-islands${islands.length === 1 ? ' single-cluster-island' : ''}">
        ${islands.map(island => {
          const selected = isClusterSelected && island.id === selectedIslandId;
          const level = island.level ?? 1;
          const { skillLabel } = normalizeIslandSkill(island);
          return `<button type="button" class="map-island cluster-island-btn"
            data-social-action="select-island"
            data-profile-id="${escapeHtml(profile.id)}"
            data-id="${escapeHtml(island.id)}"
            data-island-id="${escapeHtml(island.id)}"
            aria-pressed="${selected}">
            <span class="island-art">${renderIsland(island, level)}</span>
            <span class="island-pin" title="${escapeHtml(island.title)}">
              <strong>${escapeHtml(island.title)}</strong>
              <small>${skillLabel === island.title ? '' : escapeHtml(skillLabel) + ' · '}Lv ${level}</small>
            </span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderDirectionalBeacons(neighborEntries, activeCluster) {
  return neighborEntries.map(({ profile, sector, reasonLabel }) => {
    const active = activeCluster === profile.id;
    return `<button type="button" class="ocean-wayfinder${active ? ' is-active' : ''}"
      style="left:${sector.beaconX}px;top:${sector.beaconY}px;"
      data-social-action="open-profile"
      data-profile-id="${escapeHtml(profile.id)}"
      title="${escapeHtml(profile.displayName)} (${escapeHtml(sector.compass)}) — ${escapeHtml(reasonLabel)}">
      <span>${escapeHtml(sector.compass)}</span> <strong>${escapeHtml(profile.displayName)}</strong>
    </button>`;
  }).join('');
}

function renderNeighborhoodOceanMap({
  viewerWorld,
  activePersona,
  neighborEntries,
  activeCluster,
  selectedProfile,
  selectedIsland,
  selectedHomeIslandId,
  logOpen,
}) {
  const totalPublicIslands = neighborEntries.reduce((sum, entry) => sum + (entry.profile.publicIslands?.length ?? 0), 0);
  const viewerTitle = activePersona && !activePersona.isLocalViewer
    ? `${escapeHtml(activePersona.displayName.toUpperCase())}’S ARCHIPELAGO`
    : 'YOUR ARCHIPELAGO';
  const coordLabel = activeCluster === 'home'
    ? `${viewerTitle} · GRAPH-MATCHED NEIGHBOURS AROUND YOU`
    : selectedProfile
      ? `${escapeHtml(selectedProfile.displayName.toUpperCase())} (@${escapeHtml(selectedProfile.handle)}) · ${selectedProfile.isSample ? 'SAMPLE ARCHIPELAGO' : 'PUBLIC ARCHIPELAGO'}`
      : 'SHARED OCEAN ATLAS';

  return `<section class="map-frame archipelago-frame social-ocean-frame" data-map-mode="neighborhood" aria-label="Shared ocean archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="Click and drag the ocean map to explore nearby groups of islands">
      <div class="map-scene social-ocean-scene" style="width:${OCEAN_WIDTH}px;height:${OCEAN_HEIGHT}px;">
        <div class="map-water">${renderOcean(true)}</div>
        <div class="island-water social-cluster-water" style="width:${OCEAN_WIDTH}px;height:${OCEAN_HEIGHT}px;">
          ${renderHomeCluster(viewerWorld, activePersona, activeCluster, selectedHomeIslandId)}
          ${renderDirectionalBeacons(neighborEntries, activeCluster)}
          ${renderNeighborClusters(neighborEntries, activeCluster, selectedIsland?.id)}
        </div>
      </div>
    </div>
    <div class="map-coordinates"><span>✦</span> ${coordLabel}</div>
    <div class="map-tools" role="group" aria-label="Map controls">
      <button type="button" data-social-action="center-home" title="Return to home islands">Home islands</button>
      <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
      <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" data-zoom="reset" aria-label="Overview all archipelagos">All worlds</button>
    </div>
    <div class="map-footer">
      <span><i></i> ${neighborEntries.length > 0
        ? `${neighborEntries.length} SHARED-INTEREST ${neighborEntries.length === 1 ? 'NEIGHBOUR' : 'NEIGHBOURS'} (${totalPublicIslands} ISLANDS)`
        : 'NO SHARED-INTEREST NEIGHBOURS YET'}</span>
      <span class="map-pan-hint">Click &amp; drag to nearby island groups</span>
      <button type="button" data-social-action="show-log" aria-controls="social-island-log" aria-expanded="${logOpen}">
        ${activeCluster === 'home' ? 'Connections & matches' : 'Explorer log'}
      </button>
    </div>
  </section>`;
}

function renderSoloArchipelagoMap({
  profile,
  islands,
  selectedIsland,
  logOpen,
}) {
  const safeIslands = Array.isArray(islands) ? islands : [];
  const soloWidth = 980;
  const { height, positions } = layoutIslands(
    safeIslands.length ? safeIslands.map(i => String(i.id || 'island')) : ['placeholder'],
    soloWidth,
  );
  const coordLabel = `${escapeHtml(profile.displayName.toUpperCase())} (@${escapeHtml(profile.handle)}) · SOLO ARCHIPELAGO VIEW`;

  return `<section class="map-frame archipelago-frame social-ocean-frame" data-map-mode="solo" data-solo-profile-id="${escapeHtml(profile.id)}" aria-label="${escapeHtml(profile.displayName)}’s individual archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="${escapeHtml(profile.displayName)}’s archipelago">
      <div class="map-scene" style="min-height:${Math.max(540, height + 120)}px">
        <div class="map-water">${renderOcean(safeIslands.length > 0)}</div>
        <div class="island-water" style="width:${soloWidth}px;height:${height}px;margin-inline:auto;">
          ${safeIslands.length > 0 ? safeIslands.map((island, index) => {
            const pos = positions[index] || { left: 120, top: 80, width: 220 };
            const selected = selectedIsland && island.id === selectedIsland.id;
            const level = island.level ?? 1;
            const { skillLabel } = normalizeIslandSkill(island);
            return `<button type="button" class="map-island"
              data-social-action="select-island"
              data-profile-id="${escapeHtml(profile.id)}"
              data-id="${escapeHtml(island.id)}"
              data-island-id="${escapeHtml(island.id)}"
              aria-pressed="${selected}"
              style="left:${pos.left}px;top:${pos.top}px;width:${pos.width}px;">
              <span class="island-art">${renderIsland(island, level)}</span>
              <span class="island-pin" title="${escapeHtml(island.title)}">
                <strong>${escapeHtml(island.title)}</strong>
                <small>${skillLabel === island.title ? '' : escapeHtml(skillLabel) + ' · '}Lv ${level}</small>
              </span>
            </button>`;
          }).join('') : `
            <div class="solo-empty-ocean" role="status">
              <p class="eyebrow">OPEN WATERS / NO PUBLISHED ISLANDS</p>
              <h3>${escapeHtml(profile.displayName)} hasn’t published any public islands yet</h3>
              <p>${escapeHtml(profile.displayName)}’s islands are currently private. You can still follow their profile or return to the neighbourhood map.</p>
            </div>
          `}
        </div>
      </div>
    </div>
    <div class="map-coordinates"><span>✦</span> ${coordLabel}</div>
    <div class="map-tools" role="group" aria-label="Map controls">
      <button type="button" class="solo-map-return-btn" data-social-action="exit-solo">← Back to neighbourhood</button>
      <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
      <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" data-zoom="reset" aria-label="Overview archipelago">Overview</button>
    </div>
    <div class="map-footer">
      <span><i></i> ${safeIslands.length} PUBLIC ${safeIslands.length === 1 ? 'ISLAND' : 'ISLANDS'} · @${escapeHtml(profile.handle)}</span>
      <span class="map-pan-hint">Viewing individual archipelago</span>
      <button type="button" data-social-action="show-log" aria-controls="social-island-log" aria-expanded="${logOpen}">Explorer log</button>
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

function renderFollowingFollowersSection({
  network,
  networkTab = 'following',
  selectedProfileId,
  mapMode,
  openByDefault = true,
}) {
  const followingList = network?.following ?? [];
  const followersList = network?.followers ?? [];
  const activeList = networkTab === 'followers' ? followersList : followingList;

  return `<details class="roadmap-summary social-network-panel" ${openByDefault ? 'open' : ''}>
    <summary>Following (${followingList.length}) &amp; Followers (${followersList.length})</summary>
    <p class="caption">Click any explorer below to open their individual archipelago on the map.</p>
    <div class="social-network-tabs" role="tablist" aria-label="Following and followers">
      <button type="button" class="social-filter-chip" role="tab" data-social-action="network-tab" data-network-tab="following" aria-selected="${networkTab === 'following'}" aria-pressed="${networkTab === 'following'}">
        Following (${followingList.length})
      </button>
      <button type="button" class="social-filter-chip" role="tab" data-social-action="network-tab" data-network-tab="followers" aria-selected="${networkTab === 'followers'}" aria-pressed="${networkTab === 'followers'}">
        Followers (${followersList.length})
      </button>
    </div>
    ${activeList.length > 0 ? `<div class="social-network-list" role="list">
      ${activeList.map(person => {
        const isViewingSolo = mapMode === 'solo' && selectedProfileId === person.id;
        const relationLabel = person.isFollowing && person.followsViewer
          ? 'Mutual'
          : person.followsViewer
            ? 'Follows you'
            : 'Following';
        const islandCountText = person.publicIslandCount > 0
          ? `${person.publicIslandCount} public ${person.publicIslandCount === 1 ? 'island' : 'islands'}`
          : 'No public islands yet';
        return `<div class="social-person-row${isViewingSolo ? ' is-selected' : ''}" role="listitem" data-network-person-id="${escapeHtml(person.id)}">
          <div class="social-person-info">
            <div class="social-person-header">
              <strong>${escapeHtml(person.displayName)}</strong>
              <small>@${escapeHtml(person.handle)}</small>
              <span class="social-badge">${escapeHtml(relationLabel)}</span>
            </div>
            <span class="caption">${escapeHtml(islandCountText)}</span>
          </div>
          <div class="social-person-actions">
            <button type="button" class="small-action" data-social-action="view-solo-archipelago" data-profile-id="${escapeHtml(person.id)}" aria-pressed="${isViewingSolo}">
              ${isViewingSolo ? 'Viewing solo map' : 'View archipelago ↗'}
            </button>
            <button type="button" class="small-action" data-social-action="${person.isFollowing ? 'unfollow' : 'follow'}" data-profile-id="${escapeHtml(person.id)}" aria-pressed="${person.isFollowing}">
              ${person.isFollowing ? 'Following ✓' : '+ Follow'}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>` : `<p class="caption">${networkTab === 'followers' ? 'No followers yet.' : 'You are not following anyone yet. Follow any explorer to bookmark their archipelago here.'}</p>`}
  </details>`;
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

function renderViewerSharingSection(viewerWorld, publishedMap, onTogglePublish, openByDefault = false, demo = false) {
  const islands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  if (!islands.length && !onTogglePublish) return '';
  return `<details class="roadmap-summary social-sharing-details"${openByDefault ? ' open' : ''}>
    <summary>Your island visibility (opt-in)</summary>
    <p class="caption">${demo ? 'Try roadmap sharing with sample explorers in this browser. This is a local demo.' :
      'Islands are private by default. Publishing shares the island title, stage, public summary, and starter roadmap.'}</p>
    ${islands.length ? `<div class="social-sharing-list">
      ${islands.map(island => {
        const isPublic = Boolean(publishedMap.get(island.id) ?? island.isPublic);
        const preview = demo && !isPublic ? toPublicIsland({ ...island, isPublic: true, shareObjective: false }) : null;
        return `<div class="social-share-item">
          <span><strong>${escapeHtml(island.title)}</strong> <small>(${isPublic ? 'Public opt-in' : 'Private'})</small></span>
          ${preview ? `<details class="roadmap-summary social-share-preview"><summary>Preview demo share</summary>
            <p><strong>Shared summary</strong><span>${escapeHtml(preview.publicSummary)}</span></p>
            ${preview.roadmap.checkpoint ? `<p><strong>Checkpoint</strong><span>${escapeHtml(preview.roadmap.checkpoint)}</span></p>` : ''}
            ${renderGoalRoadmapList(preview.goals)}
            <button type="button" class="small-action" data-social-action="toggle-island-visibility" data-island-id="${escapeHtml(island.id)}">Share in demo</button>
          </details>` : `<button type="button" class="small-action" data-social-action="toggle-island-visibility" data-island-id="${escapeHtml(island.id)}" aria-pressed="${isPublic}">
            ${isPublic ? 'Make private' : 'Publish roadmap'}
          </button>`}
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
  neighborLimit = 8,
} = {}) {
  if (!container) {
    throw new Error('mountSocialExplore requires a target container element.');
  }

  let localViewerWorld = viewerWorld;
  let activePersona = client.listDummyPersonas?.().find(persona => persona.id === client.viewerId) ?? {
    id: client.viewerId ?? 'user-local-explorer',
    displayName: 'You (My world)',
    handle: 'you',
    isLocalViewer: true,
    world: null,
  };
  let disconnectMap;
  let cameraInitialized = false;
  let pendingCameraTarget = 'home'; // 'home' | profileId | null
  let savedNeighborhoodCamera = null;
  let savedFocusSelector = null;
  let requestSeq = 0;

  const camera = { overview: false, zoom: 1, left: 700, top: 480 };
  const soloCamera = { overview: true, zoom: 1, left: 0, top: 0 };
  const sectorAssignments = new Map(); // profileId -> sectorIndex (0..7) for stable sector positions

  function getActiveViewerWorld() {
    if (activePersona && !activePersona.isLocalViewer && activePersona.world) {
      return activePersona.world;
    }
    return localViewerWorld;
  }

  const state = {
    status: 'loading', // 'loading' | 'ready' | 'empty' | 'error'
    errorMessage: '',
    filter: 'all',
    mapMode: 'neighborhood', // 'neighborhood' | 'solo'
    networkTab: 'following', // 'following' | 'followers'
    profiles: [],
    neighborEntries: [], // [{ profile, sector, reasonLabel, reasonDetail, score, ... }]
    network: { following: [], followers: [] },
    soloWorld: null, // { profile, islands }
    matches: [],
    activeCluster: 'home', // 'home' | profileId
    selectedProfileId: null,
    selectedIslandId: null,
    selectedHomeIslandId: getActiveViewerWorld()?.islands?.[0]?.id ?? null,
    logOpen: false, // Default view shows only the ocean map centered on current user's islands
    statusBanner: '',
    publishedIslands: new Map(),
  };

  function syncDemoShares() {
    if (client.mode !== 'fixture' || !onTogglePublish) return;
    const shares = Array.isArray(localViewerWorld.demoShares) ? localViewerWorld.demoShares : [];
    client.setLocalPublicIslands?.(shares);
    for (const island of localViewerWorld.islands) {
      state.publishedIslands.set(island.id, shares.some(share => share.id === island.id));
    }
  }

  for (const island of localViewerWorld?.islands ?? []) {
    state.publishedIslands.set(island.id, Boolean(island.isPublic));
  }
  syncDemoShares();

  function announce(message) {
    state.statusBanner = message;
    if (typeof onAnnounce === 'function') {
      onAnnounce(message);
    }
  }

  function assignStableSectors(rankedEntries) {
    const capped = rankedEntries.slice(0, NEIGHBOR_SECTORS.length);
    const activeIds = new Set(capped.map(e => e.profile.id));

    // Release sectors for profiles no longer in the visible neighbour set
    for (const [id] of sectorAssignments.entries()) {
      if (!activeIds.has(id)) {
        sectorAssignments.delete(id);
      }
    }

    const usedIndices = new Set(sectorAssignments.values());
    return capped.map(entry => {
      let sectorIdx = sectorAssignments.get(entry.profile.id);
      if (sectorIdx === undefined) {
        sectorIdx = NEIGHBOR_SECTORS.findIndex((_, idx) => !usedIndices.has(idx));
        if (sectorIdx < 0) sectorIdx = 0;
        sectorAssignments.set(entry.profile.id, sectorIdx);
        usedIndices.add(sectorIdx);
      }
      return {
        ...entry,
        sector: NEIGHBOR_SECTORS[sectorIdx],
      };
    });
  }

  function recomputeNeighborhood() {
    const ranked = rankNeighborsByGraph(getActiveViewerWorld(), state.profiles, {
      viewerId: client.viewerId ?? activePersona.id,
      limit: Math.min(NEIGHBOR_SECTORS.length, neighborLimit),
    });
    state.neighborEntries = assignStableSectors(ranked);
  }

  function getSelectedProfile() {
    if (state.mapMode === 'solo' && state.soloWorld?.profile) {
      return state.soloWorld.profile;
    }
    return state.profiles.find(profile => profile.id === state.selectedProfileId)
      ?? state.neighborEntries[0]?.profile
      ?? state.profiles[0]
      ?? null;
  }

  function getSelectedIsland(profile) {
    if (!profile) return null;
    const islands = state.mapMode === 'solo' && state.soloWorld?.profile?.id === profile.id
      ? state.soloWorld.islands
      : profile.publicIslands;
    if (!Array.isArray(islands) || !islands.length) return null;
    return islands.find(island => island.id === state.selectedIslandId) ?? islands[0];
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
      const entry = state.neighborEntries.find(e => e.profile.id === targetClusterId);
      if (entry?.sector) {
        targetCenter = { x: entry.sector.centerX, y: entry.sector.centerY };
      }
    }

    camera.overview = false;
    camera.zoom = Math.max(0.45, Math.min(1, (vw - 24) / HOME_CLUSTER_POS.width));
    camera.left = Math.max(0, Math.round(targetCenter.x * camera.zoom - vw / 2));
    camera.top = Math.max(0, Math.round(targetCenter.y * camera.zoom - vh / 2));
  }

  function bindInteractiveMap() {
    if (typeof container.querySelector !== 'function') return;
    const viewport = container.querySelector('.map-viewport');
    if (!viewport || typeof ResizeObserver === 'undefined') return;

    if (state.mapMode === 'solo') {
      disconnectMap = connectMap(viewport, soloCamera);
      return;
    }

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

  function renderPersonaSwitcher() {
    if (typeof client.listDummyPersonas !== 'function') return '';
    const personas = client.listDummyPersonas();
    if (!Array.isArray(personas) || personas.length <= 1) return '';

    return `<div class="social-persona-switcher" role="group" aria-label="Switch demo account perspective">
      <span class="persona-switcher-label">Viewing as dummy account:</span>
      <div class="persona-switcher-pills">
        ${personas.map(p => {
          const isCurrent = p.id === activePersona.id;
          return `<button type="button" class="social-filter-chip persona-pill" data-social-action="switch-viewer" data-viewer-id="${escapeHtml(p.id)}" aria-pressed="${isCurrent}">
            <strong>${escapeHtml(p.displayName)}</strong>${p.summary ? ` <small>· ${escapeHtml(p.summary)}</small>` : ''}
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }

  function render() {
    const sharingOpen = container.querySelector?.('.social-sharing-details')?.open ?? false;
    const samplesOpen = container.querySelector?.('.social-samples')?.open ?? false;
    cleanupMapBindings();

    const followingCount = state.network.following.length;
    const followersCount = state.network.followers.length;
    const activeViewerWorld = getActiveViewerWorld();
    const demoSharing = client.mode === 'fixture' && Boolean(onTogglePublish) && activePersona.isLocalViewer;

    const filterButtons = [
      ['all', 'All worlds'],
      ['following', 'Following on map'],
      ['guitar', 'Guitar'],
      ['songwriting', 'Songwriting'],
      ['photography', 'Photography'],
      ['custom', 'Custom skills'],
    ];

    const filterNav = `<div class="social-toolbar-stack">
      ${renderPersonaSwitcher()}
      <div class="social-filter-bar" role="toolbar" aria-label="Filter nearby archipelagos">
        ${filterButtons.map(([value, label]) => (
          `<button type="button" class="social-filter-chip" data-social-action="filter" data-filter="${value}" aria-pressed="${state.mapMode === 'neighborhood' && state.filter === value}">${escapeHtml(label)}</button>`
        )).join('')}
        <button type="button" class="social-filter-chip social-network-trigger" data-social-action="open-network" data-network-tab="following" aria-pressed="${state.logOpen && state.activeCluster === 'home'}">
          Following (${followingCount}) · Followers (${followersCount})
        </button>
        <button type="button" class="social-filter-chip" data-social-action="open-compass">Social Compass</button>
      </div>
      ${client.mode === 'fixture' ? `<details class="social-samples"${samplesOpen ? ' open' : ''}><summary>Sample roadmaps</summary>
        <div class="social-filter-bar">${SAMPLE_ROADMAPS.map(([profileId, islandId, title]) =>
          `<button type="button" class="social-filter-chip" data-social-action="view-solo-archipelago"
            data-profile-id="${profileId}" data-island-id="${islandId}">${title}</button>`).join('')}</div>
      </details>` : ''}
    </div>`;

    const introHeader = `<div class="intro social-intro">
      <div>
        <h1>Beyond your shore<span>.</span></h1>
        <p class="lede">Pan to explore nearby islands with shared skills, or switch demo accounts to see other matches.</p>
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

    if (state.mapMode === 'neighborhood' && state.status === 'empty') {
      const emptyReason = state.filter === 'following'
        ? 'You are not following any explorers with public islands yet. Click any nearby island group on the map to follow its creator.'
        : 'No public worlds match this filter yet.';
      container.innerHTML = `<div class="social-explore" data-social-state="empty">
        ${introHeader}
        <div class="workspace">
          <section class="field-notes social-state-card" role="status">
            <p class="eyebrow">OPEN WATERS / 0 PUBLIC WORLDS</p>
            <h2>No public worlds in sight</h2>
            <p>${escapeHtml(emptyReason)}</p>
            ${state.filter !== 'all' ? '<button type="button" class="small-action" data-social-action="filter" data-filter="all">Show all public worlds ↗</button>' : ''}
            ${renderFollowingFollowersSection({
              network: state.network,
              networkTab: state.networkTab,
              selectedProfileId: state.selectedProfileId,
              mapMode: state.mapMode,
              openByDefault: true,
            })}
            ${renderViewerSharingSection(activeViewerWorld, state.publishedIslands, onTogglePublish, true, demoSharing)}
          </section>
        </div>
      </div>`;
      return;
    }

    const activeProfile = getSelectedProfile();
    const activeIsland = getSelectedIsland(activeProfile);
    const activeNeighborEntry = state.neighborEntries.find(e => e.profile.id === activeProfile?.id);
    const firstGoal = activeIsland?.goals?.[0];
    const viewingHome = state.mapMode === 'neighborhood' && state.activeCluster === 'home';

    const logDrawerContent = viewingHome ? `
      <p class="eyebrow">HOME ARCHIPELAGO / ${activePersona.isLocalViewer ? 'YOUR NETWORK & ISLANDS' : escapeHtml(activePersona.displayName.toUpperCase()) + '’S NETWORK'}</p>
      <h2>${activePersona.isLocalViewer ? 'Your waters' : escapeHtml(activePersona.displayName) + '’s waters'}</h2>
      ${state.neighborEntries.length > 0
        ? `<p>Surrounded by ${state.neighborEntries.length} ${state.neighborEntries.length === 1 ? 'explorer who shares' : 'explorers who share'} your interests, ranked to favour mentor-style level gaps (${state.neighborEntries.slice(0, 3).map(e => `${escapeHtml(e.profile.displayName)}: ${escapeHtml(e.reasonLabel)}`).join(' · ')}).</p>`
        : '<p class="social-no-neighbours">No explorers share your interests yet. Create or adopt an island in My world and matching neighbours will appear around your home waters.</p>'}
      ${renderFollowingFollowersSection({
        network: state.network,
        networkTab: state.networkTab,
        selectedProfileId: state.selectedProfileId,
        mapMode: state.mapMode,
        openByDefault: true,
      })}
      ${renderRecommendationsSection(state.matches, null)}
      ${renderViewerSharingSection(activeViewerWorld, state.publishedIslands, onTogglePublish, sharingOpen, demoSharing)}
    ` : activeProfile ? `
      <p class="eyebrow">${state.mapMode === 'solo' ? 'SOLO ARCHIPELAGO VIEW' : 'EXPLORER ARCHIPELAGO'} / ${activeProfile.isSample ? 'SAMPLE PROFILE' : 'PUBLIC PROFILE'}</p>
      <h2>${escapeHtml(activeProfile.displayName)}</h2>
      <p class="stage-name">@${escapeHtml(activeProfile.handle)} · ${activeProfile.publicIslandCount} public ${activeProfile.publicIslandCount === 1 ? 'island' : 'islands'} · ${activeProfile.followerCount} ${activeProfile.followerCount === 1 ? 'follower' : 'followers'}</p>
      ${activeNeighborEntry ? `<p class="caption"><strong>Graph link:</strong> ${escapeHtml(activeNeighborEntry.reasonLabel)} — ${escapeHtml(activeNeighborEntry.reasonDetail)}</p>` : ''}
      ${activeProfile.bio ? `<p class="caption">${escapeHtml(activeProfile.bio)}</p>` : ''}
      <div class="social-profile-actions">
        <button type="button" class="small-action" data-social-action="${activeProfile.isFollowing ? 'unfollow' : 'follow'}" data-profile-id="${escapeHtml(activeProfile.id)}" aria-pressed="${activeProfile.isFollowing}">
          ${activeProfile.isFollowing ? 'Following ✓' : '+ Follow ' + escapeHtml(activeProfile.displayName)} (${activeProfile.followerCount})
        </button>
        ${state.mapMode === 'solo' ? `
          <button type="button" class="small-action solo-map-return-btn" data-social-action="exit-solo">
            ← Back to neighbourhood
          </button>
        ` : `
          <button type="button" class="small-action" data-social-action="view-solo-archipelago" data-profile-id="${escapeHtml(activeProfile.id)}">
            Solo archipelago view ↗
          </button>
        `}
      </div>

      ${activeIsland ? `
        <div class="social-cluster-island-tabs" role="group" aria-label="${escapeHtml(activeProfile.displayName)}’s islands">
          <p class="eyebrow">ISLANDS IN THIS ARCHIPELAGO</p>
          <div class="social-cluster-tab-row">
            ${(state.mapMode === 'solo' ? state.soloWorld?.islands ?? [] : activeProfile.publicIslands).map(island => (
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
      ` : `
        <section class="social-selected-island-card" aria-label="No public islands">
          <p class="eyebrow">NO PUBLISHED ISLANDS</p>
          <h3>Private archipelago</h3>
          <p class="caption">${escapeHtml(activeProfile.displayName)} has not published any public islands yet.</p>
        </section>
      `}

      ${renderFollowingFollowersSection({
        network: state.network,
        networkTab: state.networkTab,
        selectedProfileId: activeProfile.id,
        mapMode: state.mapMode,
        openByDefault: false,
      })}
    ` : `<p class="eyebrow">PUBLIC ATLAS</p><h2>Select an island group</h2><p>Click any group of islands on the ocean map to inspect the user and their roadmaps.</p>`;

    const logDrawer = `<aside class="field-notes map-log" id="social-island-log" aria-label="Explorer and island details" ${state.logOpen ? '' : 'hidden'}>
      <button type="button" class="icon log-close" data-social-action="close-log" aria-label="Close island log">×</button>
      ${logDrawerContent}
      ${state.statusBanner ? `<p class="caption social-status-banner" role="status">${escapeHtml(state.statusBanner)}</p>` : ''}
    </aside>`;

    const mapSection = state.mapMode === 'solo' && state.soloWorld?.profile
      ? renderSoloArchipelagoMap({
        profile: state.soloWorld.profile,
        islands: state.soloWorld.islands,
        selectedIsland: activeIsland,
        logOpen: state.logOpen,
      })
      : renderNeighborhoodOceanMap({
        viewerWorld: activeViewerWorld,
        activePersona,
        neighborEntries: state.neighborEntries,
        activeCluster: state.activeCluster,
        selectedProfile: activeProfile,
        selectedIsland: activeIsland,
        selectedHomeIslandId: state.selectedHomeIslandId,
        logOpen: state.logOpen,
      });

    container.innerHTML = `<div class="social-explore" data-social-state="ready" data-map-mode="${state.mapMode}" data-active-viewer="${escapeHtml(activePersona.id)}">
      ${introHeader}
      <div class="workspace">
        ${mapSection}
        ${logDrawer}
      </div>
    </div>`;

    bindInteractiveMap();
  }

  async function refreshNetworkLists() {
    if (typeof client.listNetworkProfiles === 'function') {
      state.network = await client.listNetworkProfiles();
    } else {
      state.network = {
        following: state.profiles.filter(p => p.isFollowing),
        followers: state.profiles.filter(p => p.followsViewer),
      };
    }
  }

  async function load({ filter = state.filter, preserveSelection = true } = {}) {
    const seq = ++requestSeq;
    state.filter = filter;
    state.status = 'loading';
    state.errorMessage = '';
    render();

    try {
      const [profiles] = await Promise.all([
        client.listPublicProfiles({ filter }),
        refreshNetworkLists(),
      ]);
      if (seq !== requestSeq) return;

      state.profiles = Array.isArray(profiles) ? profiles : [];
      recomputeNeighborhood();

      const activeWorld = getActiveViewerWorld();
      if (typeof client.recommendPeople === 'function') {
        state.matches = await client.recommendPeople({ viewerWorld: activeWorld });
      } else {
        state.matches = recommendExplorers(activeWorld, state.profiles);
      }
      if (seq !== requestSeq) return;

      // Only surface compass recommendations for explorers who share an interest (same set as the map)
      const neighborIds = new Set(state.neighborEntries.map(e => e.profile.id));
      state.matches = state.matches.filter(match => neighborIds.has(match.profile.id));

      if (state.profiles.length === 0) {
        state.status = 'empty';
        state.selectedProfileId = null;
        state.selectedIslandId = null;
      } else if (state.neighborEntries.length === 0) {
        state.status = 'ready';
        state.selectedProfileId = null;
        state.selectedIslandId = null;
        if (!preserveSelection) {
          state.activeCluster = 'home';
          state.logOpen = false;
          pendingCameraTarget = 'home';
        }
      } else {
        state.status = 'ready';
        const visibleProfiles = state.neighborEntries.map(e => e.profile);
        const stillExists = preserveSelection && visibleProfiles.some(p => p.id === state.selectedProfileId);
        const activeProfile = stillExists
          ? visibleProfiles.find(p => p.id === state.selectedProfileId)
          : visibleProfiles[0];
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
      if (seq !== requestSeq) return;
      state.status = 'error';
      state.errorMessage = error?.message || 'Unable to load public worlds.';
    }

    render();
  }

  async function openSoloArchipelago(profileId, triggerSelector = null, islandId) {
    if (!profileId) return;
    if (state.mapMode === 'neighborhood') {
      savedNeighborhoodCamera = { ...camera };
      savedFocusSelector = triggerSelector;
    }

    const seq = ++requestSeq;
    try {
      let worldData = null;
      if (typeof client.getPublicWorld === 'function') {
        worldData = await client.getPublicWorld(profileId);
      } else {
        const fallbackProfile = state.profiles.find(p => p.id === profileId)
          ?? state.network.following.find(p => p.id === profileId)
          ?? state.network.followers.find(p => p.id === profileId);
        if (fallbackProfile) {
          worldData = { profile: fallbackProfile, islands: fallbackProfile.publicIslands ?? [] };
        }
      }
      if (seq !== requestSeq) return;

      if (!worldData?.profile) {
        announce('Public world not found or not shared.');
        render();
        return;
      }

      state.mapMode = 'solo';
      state.soloWorld = {
        profile: worldData.profile,
        islands: Array.isArray(worldData.islands) ? worldData.islands : [],
      };
      state.selectedProfileId = worldData.profile.id;
      state.selectedIslandId = state.soloWorld.islands.find(island => island.id === islandId)?.id ?? state.soloWorld.islands[0]?.id ?? null;
      state.logOpen = true;
      soloCamera.overview = true;
      soloCamera.zoom = 1;
      announce(`Viewing ${worldData.profile.displayName}’s solo archipelago.`);
      render();
    } catch (error) {
      if (seq !== requestSeq) return;
      announce(error?.message || 'Could not open that explorer’s archipelago.');
      render();
    }
  }

  function exitSoloArchipelago() {
    state.mapMode = 'neighborhood';
    state.soloWorld = null;
    if (savedNeighborhoodCamera) {
      Object.assign(camera, savedNeighborhoodCamera);
      savedNeighborhoodCamera = null;
    }
    announce('Returned to the shared neighbourhood ocean.');
    render();
    if (savedFocusSelector && typeof container.querySelector === 'function') {
      container.querySelector(savedFocusSelector)?.focus?.({ preventScroll: true });
      savedFocusSelector = null;
    }
  }

  async function handleAction(event) {
    const button = event.target.closest('button[data-social-action]');
    if (!button) return;

    const action = button.dataset.socialAction;
    const profileId = button.dataset.profileId;
    const islandId = button.dataset.islandId || button.dataset.id;

    if (action === 'switch-viewer') {
      const targetViewerId = button.dataset.viewerId || 'user-local-explorer';
      if (typeof client.switchViewer === 'function') {
        const nextPersona = await client.switchViewer(targetViewerId);
        activePersona = nextPersona;
        sectorAssignments.clear();
        state.mapMode = 'neighborhood';
        state.soloWorld = null;
        state.activeCluster = 'home';
        state.selectedHomeIslandId = getActiveViewerWorld()?.islands?.[0]?.id ?? null;
        pendingCameraTarget = 'home';
        await load({ filter: 'all', preserveSelection: true });
        state.activeCluster = 'home';
        state.logOpen = true;
        announce(`Switched dummy account to ${activePersona.displayName}. Neighbours and recommendations updated.`);
        render();
      }
      return;
    }

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

    if (action === 'open-network') {
      state.networkTab = button.dataset.networkTab || 'following';
      state.mapMode = 'neighborhood';
      state.activeCluster = 'home';
      state.logOpen = true;
      render();
      return;
    }

    if (action === 'open-compass') {
      state.mapMode = 'neighborhood';
      state.activeCluster = 'home';
      state.logOpen = true;
      render();
      container.querySelector?.('.social-compass-details summary')?.focus();
      return;
    }

    if (action === 'network-tab') {
      state.networkTab = button.dataset.networkTab || 'following';
      state.logOpen = true;
      render();
      return;
    }

    if (action === 'view-solo-archipelago') {
      await openSoloArchipelago(
        profileId,
        `[data-social-action="view-solo-archipelago"][data-profile-id="${profileId}"]`,
        islandId,
      );
      return;
    }

    if (action === 'exit-solo') {
      exitSoloArchipelago();
      return;
    }

    if (action === 'center-home') {
      state.mapMode = 'neighborhood';
      state.soloWorld = null;
      state.activeCluster = 'home';
      pendingCameraTarget = 'home';
      announce('Centered on home archipelago.');
      render();
      return;
    }

    if (action === 'open-home' || action === 'select-home-island') {
      state.mapMode = 'neighborhood';
      state.soloWorld = null;
      state.activeCluster = 'home';
      if (islandId) state.selectedHomeIslandId = islandId;
      state.logOpen = true;
      pendingCameraTarget = 'home';
      announce('Viewing home archipelago, connections, and recommendations.');
      render();
      return;
    }

    if (action === 'retry') {
      await load({ filter: state.filter, preserveSelection: true });
      return;
    }

    if (action === 'filter') {
      state.mapMode = 'neighborhood';
      state.soloWorld = null;
      const nextFilter = button.dataset.filter || 'all';
      await load({ filter: nextFilter, preserveSelection: true });
      return;
    }

    if (action === 'open-profile') {
      state.logOpen = true;
      const targetProfile = state.profiles.find(p => p.id === profileId);
      if (targetProfile && state.neighborEntries.some(e => e.profile.id === profileId)) {
        state.mapMode = 'neighborhood';
        state.soloWorld = null;
        state.activeCluster = targetProfile.id;
        state.selectedProfileId = targetProfile.id;
        state.selectedIslandId = targetProfile.publicIslands[0]?.id ?? null;
        pendingCameraTarget = targetProfile.id;
        announce(`Opened ${targetProfile.displayName}’s island group.`);
        render();
      } else {
        await openSoloArchipelago(profileId);
      }
      return;
    }

    if (action === 'select-island') {
      if (state.mapMode === 'solo' && state.soloWorld?.profile?.id === profileId) {
        state.selectedIslandId = islandId;
        state.logOpen = true;
        const activeIsland = getSelectedIsland(state.soloWorld.profile);
        if (activeIsland) {
          announce(`Inspecting ${activeIsland.title} in ${state.soloWorld.profile.displayName}’s archipelago.`);
        }
        render();
        return;
      }

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
        if (state.soloWorld?.profile?.id === profileId) {
          state.soloWorld.profile = {
            ...state.soloWorld.profile,
            isFollowing: result.isFollowing,
            followerCount: result.followerCount,
          };
        }
        state.matches = state.matches.map(match => (
          match.profile.id === profileId
            ? { ...match, profile: { ...match.profile, isFollowing: result.isFollowing, followerCount: result.followerCount } }
            : match
        ));

        await refreshNetworkLists();

        if (state.filter === 'following' && !result.isFollowing) {
          state.profiles = state.profiles.filter(p => p.isFollowing);
        }

        recomputeNeighborhood();

        if (state.mapMode === 'neighborhood' && state.profiles.length === 0) {
          state.status = 'empty';
        }

        const target = state.profiles.find(p => p.id === profileId)
          ?? state.network.following.find(p => p.id === profileId)
          ?? state.network.followers.find(p => p.id === profileId)
          ?? state.soloWorld?.profile;

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
      const activeProfile = (state.mapMode === 'solo' && state.soloWorld?.profile?.id === profileId)
        ? state.soloWorld.profile
        : state.profiles.find(p => p.id === profileId) ?? getSelectedProfile();
      const islands = (state.mapMode === 'solo' && state.soloWorld?.profile?.id === activeProfile?.id)
        ? state.soloWorld.islands
        : activeProfile?.publicIslands ?? [];
      const activeIsland = islands.find(i => i.id === islandId) ?? getSelectedIsland(activeProfile);
      if (!activeIsland) return;

      const template = toAdoptableRoadmap(activeIsland, activeProfile);
      const validation = validateAdoptableRoadmap(template);
      if (!validation.valid) {
        announce(`Cannot adopt roadmap: ${validation.errors.join(' ')}`);
        render();
        return;
      }

      if (onAdopt?.(template, { island: activeIsland, profile: activeProfile }) === true) return;
      announce(`${template.title} by ${template.attribution} adopted at Level 1 with 0 XP.`);
      render();
      return;
    }

    if (action === 'toggle-island-visibility') {
      const island = getActiveViewerWorld()?.islands?.find(item => item.id === islandId);
      if (!island || button.disabled) return;
      const current = Boolean(state.publishedIslands.get(islandId) ?? island.isPublic);
      const nextPublic = !current;
      button.disabled = true;
      try {
        if (onTogglePublish) await onTogglePublish(islandId, { isPublic: nextPublic }, activePersona);
        else await client.setIslandVisibility?.(islandId, { isPublic: nextPublic });
        state.publishedIslands.set(islandId, nextPublic);
        announce(nextPublic ? (client.mode === 'fixture' ? 'Roadmap shared in this demo.' : 'Island roadmap published (opt-in).') : 'Island set to private.');
      } catch (error) {
        announce(error?.message || 'Unable to change island visibility.');
      }
      render();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      if (state.logOpen) {
        state.logOpen = false;
        render();
        if (typeof container.querySelector === 'function') {
          container.querySelector('[data-social-action="show-log"]')?.focus?.({ preventScroll: true });
        }
      } else if (state.mapMode === 'solo') {
        exitSoloArchipelago();
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
    updateViewerWorld(nextWorld) {
      localViewerWorld = nextWorld;
      syncDemoShares();
      if (activePersona.isLocalViewer) {
        recomputeNeighborhood();
        const neighborIds = new Set(state.neighborEntries.map(entry => entry.profile.id));
        state.matches = recommendExplorers(localViewerWorld, state.profiles).filter(match => neighborIds.has(match.profile.id));
      }
      render();
    },
    async refresh({ viewerWorld: nextWorld, filter } = {}) {
      if (nextWorld) {
        localViewerWorld = nextWorld;
        for (const island of localViewerWorld?.islands ?? []) {
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
        mapMode: state.mapMode,
        activeViewerId: activePersona.id,
        activePersona,
        profiles: state.profiles,
        neighborEntries: state.neighborEntries,
        network: state.network,
        soloWorld: state.soloWorld,
        matches: state.matches,
        activeCluster: state.activeCluster,
        selectedProfileId: state.selectedProfileId,
        selectedIslandId: state.selectedIslandId,
        logOpen: state.logOpen,
        publishedIslands: Object.fromEntries(state.publishedIslands),
      };
    },
    destroy() {
      requestSeq++;
      cleanupMapBindings();
      container.removeEventListener('click', handleAction);
      container.removeEventListener?.('keydown', handleKeydown);
    },
  };
}
