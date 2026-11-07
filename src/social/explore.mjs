import { renderOcean, renderIsland } from '../scene.mjs';
import { SKILLS } from '../roadmaps.mjs';
import { layoutIslands } from '../map-layout.mjs';
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

function renderArchipelagoMap(profile, islands, selectedIslandId, logOpen) {
  const populated = Array.isArray(islands) && islands.length > 0;
  const badge = profile?.isSample ? 'SAMPLE ARCHIPELAGO' : 'PUBLIC ARCHIPELAGO';
  const ownerTitle = populated && profile
    ? `${escapeHtml(profile.displayName.toUpperCase())} · ${badge}`
    : 'NO PUBLIC ISLANDS CHARTED';

  return `<section class="map-frame archipelago-frame" aria-label="${escapeHtml(profile?.displayName ?? 'Public')} archipelago map">
    <div class="map-viewport" tabindex="0" role="region" aria-label="Pan the archipelago with arrow keys or drag the map">
      <div class="map-scene">
        <div class="map-water">${renderOcean(true)}</div>
        <div class="island-water">
          ${(islands ?? []).map(island => {
            const selected = island.id === selectedIslandId;
            const level = island.level ?? 1;
            const skill = island.topic || (Object.hasOwn(SKILLS, island.category) ? SKILLS[island.category].label : 'Skill');
            return `<button type="button" class="map-island" data-social-action="select-island" data-id="${escapeHtml(island.id)}" data-island-id="${escapeHtml(island.id)}" aria-pressed="${selected}">
              <span class="island-art">${renderIsland(island, level)}</span>
              <span class="island-pin" title="${escapeHtml(island.title)}"><strong>${escapeHtml(island.title)}</strong><small>${skill === island.title ? '' : escapeHtml(skill) + ' · '}Lv ${level}</small></span>
            </button>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="map-coordinates"><span>✦</span> ${ownerTitle}</div>
    <div class="map-tools" role="group" aria-label="Map controls">
      <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
      <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
      <button type="button" data-zoom="reset" aria-label="Reset map view">Reset</button>
    </div>
    <div class="map-footer">
      <span><i></i> ${populated ? `${islands.length} PUBLIC ${islands.length === 1 ? 'ISLAND' : 'ISLANDS'}` : '0 ISLANDS SHARED'}</span>
      <span class="map-pan-hint">Zoom in to explore</span>
      <button type="button" data-social-action="show-log" aria-controls="social-island-log" aria-expanded="${logOpen}">Island log</button>
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
              ${isCurrent ? 'Viewing world' : `Explore ${escapeHtml(profile.displayName)}’s world ↗`}
            </button>
            ${featuredIsland ? `<span class="caption">Featured: ${escapeHtml(featuredIsland.title)} (Lv ${escapeHtml(featuredIsland.level)})</span>` : ''}
          </div>
        </article>`;
      }).join('')}
    </div>
  </details>`;
}

function renderViewerSharingSection(viewerWorld, publishedMap, onTogglePublish) {
  const islands = Array.isArray(viewerWorld?.islands) ? viewerWorld.islands : [];
  if (!islands.length && !onTogglePublish) return '';
  return `<details class="roadmap-summary social-sharing-details">
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
  const camera = { overview: true };
  const mapResize = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(entries => {
        for (const { target } of entries) positionIslands(target);
      })
    : null;

  const state = {
    status: 'loading', // 'loading' | 'ready' | 'empty' | 'error'
    errorMessage: '',
    filter: 'all',
    profiles: [],
    matches: [],
    selectedProfileId: null,
    selectedIslandId: null,
    logOpen: typeof window !== 'undefined' && typeof window.innerWidth === 'number' ? window.innerWidth > 790 : true,
    statusBanner: '',
    publishedIslands: new Map(),
  };

  for (const island of currentViewerWorld?.islands ?? []) {
    state.publishedIslands.set(island.id, Boolean(island.isPublic));
  }

  function positionIslands(map) {
    if (!map || typeof map.querySelectorAll !== 'function') return;
    const buttons = [...map.querySelectorAll('.map-island')];
    const { height, positions } = layoutIslands(
      buttons.map(button => button.dataset.id || button.dataset.islandId),
      map.clientWidth || 720,
    );
    map.style.height = height + 'px';
    buttons.forEach((button, index) => {
      const { left, top, width } = positions[index];
      Object.assign(button.style, { left: left + 'px', top: top + 'px', width: width + 'px' });
    });
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
    mapResize?.disconnect();
  }

  function bindInteractiveMap() {
    if (typeof container.querySelector !== 'function') return;
    const map = container.querySelector('.island-water');
    if (map) {
      positionIslands(map);
      mapResize?.observe(map);
    }
    const viewport = container.querySelector('.map-viewport');
    if (viewport && typeof ResizeObserver !== 'undefined') {
      disconnectMap = connectMap(viewport, camera);
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

    const filterNav = `<div class="social-filter-bar" role="toolbar" aria-label="Filter public worlds">
      ${filterButtons.map(([value, label]) => (
        `<button type="button" class="social-filter-chip" data-social-action="filter" data-filter="${value}" aria-pressed="${state.filter === value}">${escapeHtml(label)}</button>`
      )).join('')}
    </div>`;

    const introHeader = `<div class="intro social-intro">
      <div>
        <h1>Beyond your shore<span>.</span></h1>
        <p class="lede">Explore real and clearly labelled sample worlds, follow explorers, and bring a roadmap back to your own.</p>
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
            <h2>Scanning the horizon…</h2>
            <p>Fetching opt-in public profiles and adoptable roadmaps.</p>
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
        ? 'You are not following any explorers yet. Follow an explorer to keep their public islands in this view.'
        : 'No public worlds match this filter yet.';
      container.innerHTML = `<div class="social-explore" data-social-state="empty">
        ${introHeader}
        <div class="workspace">
          <section class="field-notes social-state-card" role="status">
            <p class="eyebrow">OPEN WATERS / 0 PUBLIC WORLDS</p>
            <h2>No public worlds in sight</h2>
            <p>${escapeHtml(emptyReason)}</p>
            ${state.filter !== 'all' ? '<button type="button" class="small-action" data-social-action="filter" data-filter="all">Show all public worlds ↗</button>' : ''}
            ${renderViewerSharingSection(currentViewerWorld, state.publishedIslands, onTogglePublish)}
          </section>
        </div>
      </div>`;
      return;
    }

    const activeProfile = getSelectedProfile();
    const activeIsland = getSelectedIsland(activeProfile);
    const firstGoal = activeIsland?.goals?.[0];

    const directoryBar = `<section class="social-directory" aria-label="Public explorer profiles">
      ${state.profiles.map(profile => {
        const isSelected = profile.id === activeProfile?.id;
        return `<div class="social-profile-pill${isSelected ? ' is-active' : ''}">
          <button type="button" class="social-profile-select" data-social-action="open-profile" data-profile-id="${escapeHtml(profile.id)}" aria-pressed="${isSelected}">
            <span class="social-profile-name">
              <strong>${escapeHtml(profile.displayName)}</strong>
              <small>@${escapeHtml(profile.handle)} · ${profile.isSample ? 'Sample profile' : 'Public explorer'}</small>
            </span>
            <span class="social-profile-meta">${profile.publicIslandCount} ${profile.publicIslandCount === 1 ? 'island' : 'islands'} · ${profile.followerCount} ${profile.followerCount === 1 ? 'follower' : 'followers'}</span>
          </button>
          <button type="button" class="small-action social-follow-btn" data-social-action="${profile.isFollowing ? 'unfollow' : 'follow'}" data-profile-id="${escapeHtml(profile.id)}" aria-pressed="${profile.isFollowing}" aria-label="${profile.isFollowing ? 'Unfollow ' : 'Follow '}${escapeHtml(profile.displayName)}">
            ${profile.isFollowing ? 'Following ✓' : '+ Follow'}
          </button>
        </div>`;
      }).join('')}
    </section>`;

    const logDrawer = `<aside class="field-notes map-log" id="social-island-log" aria-label="Public island log" ${state.logOpen ? '' : 'hidden'}>
      <button type="button" class="icon log-close" data-social-action="close-log" aria-label="Close island log">×</button>
      ${activeProfile && activeIsland ? `
        <p class="eyebrow">PUBLIC ATLAS / ${activeProfile.isSample ? 'SAMPLE PROFILE' : 'EXPLORER PROFILE'}</p>
        <h2>${escapeHtml(activeIsland.title)}</h2>
        <p class="stage-name">${escapeHtml(activeProfile.displayName)} (@${escapeHtml(activeProfile.handle)}) · Level ${escapeHtml(activeIsland.level)} ${escapeHtml(activeIsland.stageName)}</p>
        ${activeProfile.bio ? `<p class="caption">${escapeHtml(activeProfile.bio)}</p>` : ''}
        <div class="social-profile-actions">
          <button type="button" class="small-action" data-social-action="${activeProfile.isFollowing ? 'unfollow' : 'follow'}" data-profile-id="${escapeHtml(activeProfile.id)}" aria-pressed="${activeProfile.isFollowing}">
            ${activeProfile.isFollowing ? 'Following' : 'Follow ' + escapeHtml(activeProfile.displayName)} (${activeProfile.followerCount})
          </button>
          <span class="social-badge">${activeProfile.isSample ? 'Sample profile' : 'Opt-in Public'}</span>
        </div>
        <p class="social-island-summary">${escapeHtml(activeIsland.publicSummary)}.</p>
        ${activeIsland.sharedMilestone ? `<p class="caption"><strong>Shared milestone:</strong> ${escapeHtml(activeIsland.sharedMilestone)}</p>` : ''}
        ${firstGoal ? `<p><strong>First goal</strong><br>${escapeHtml(firstGoal.title)}</p>` : ''}
        <button type="button" class="primary social-adopt-btn" data-social-action="adopt" data-island-id="${escapeHtml(activeIsland.id)}" data-profile-id="${escapeHtml(activeProfile.id)}">
          Adopt roadmap <span aria-hidden="true">↗</span>
        </button>
        <p class="caption">Your island starts at Level 1 with 0 XP and incomplete goals. Attribution to ${escapeHtml(activeProfile.displayName)} is preserved.</p>
        <details class="roadmap-summary">
          <summary>Starter roadmap (${activeIsland.goals.length} goals)</summary>
          <p><strong>Focus</strong><span>${escapeHtml(activeIsland.roadmap?.focus)}</span></p>
          ${activeIsland.roadmap?.checkpoint ? `<p><strong>Checkpoint</strong><span>${escapeHtml(activeIsland.roadmap.checkpoint)}</span></p>` : ''}
          ${renderGoalRoadmapList(activeIsland.goals)}
        </details>
      ` : `<p class="eyebrow">PUBLIC ATLAS</p><h2>Select an island</h2><p>Choose a public island on the map to inspect its starter roadmap.</p>`}
      ${renderRecommendationsSection(state.matches, activeProfile?.id)}
      ${renderViewerSharingSection(currentViewerWorld, state.publishedIslands, onTogglePublish)}
      ${state.statusBanner ? `<p class="caption social-status-banner" role="status">${escapeHtml(state.statusBanner)}</p>` : ''}
    </aside>`;

    container.innerHTML = `<div class="social-explore" data-social-state="ready">
      ${introHeader}
      ${directoryBar}
      <div class="workspace">
        ${renderArchipelagoMap(activeProfile, activeProfile?.publicIslands ?? [], activeIsland?.id, state.logOpen)}
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
      camera.overview = true;
      state.logOpen = true;
      const targetProfile = state.profiles.find(p => p.id === profileId);
      if (targetProfile) {
        state.selectedProfileId = targetProfile.id;
        state.selectedIslandId = targetProfile.publicIslands[0]?.id ?? null;
        announce(`Opened ${targetProfile.displayName}’s public archipelago.`);
        render();
      } else if (typeof client.getPublicWorld === 'function') {
        try {
          const worldData = await client.getPublicWorld(profileId);
          if (worldData?.profile) {
            const exists = state.profiles.some(p => p.id === worldData.profile.id);
            if (!exists) state.profiles = [worldData.profile, ...state.profiles];
            state.selectedProfileId = worldData.profile.id;
            state.selectedIslandId = worldData.islands?.[0]?.id ?? null;
            state.status = 'ready';
            announce(`Opened ${worldData.profile.displayName}’s public archipelago.`);
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
      state.selectedIslandId = islandId;
      state.logOpen = true;
      const activeProfile = getSelectedProfile();
      const activeIsland = getSelectedIsland(activeProfile);
      if (activeIsland) {
        announce(`Inspecting ${activeIsland.title} by ${activeProfile.displayName}.`);
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
