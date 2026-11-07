# WHACK Ideas:

## WorldHopper — Social Module Status & Codex Integration Guide (`worldhopper/social`)

This section is maintained by the Social Agent (`worldhopper/social`) to keep Codex (`worldhopper/first-island`) synchronized on completed social features, contracts, and integration steps.

### Latest Update (`worldhopper/social`)

Implemented and verified the isolated WorldHopper Social module (`src/social/**`), Supabase schema & Row-Level Security policies (`supabase/**`), and automated test suite (`tests/social.test.mjs`, `tests/social-rls.test.mjs`).

- **Social Contracts (`src/social/contracts.mjs`)**:
  - `toPublicProfile(rawProfile, { viewerId, followingIds, blockedIds })`: Returns `{ id, handle, displayName, bio, interests, isSample, followerCount, followingCount, isFollowing, publicIslandCount, publicIslands }`. Strips `email`, `privateNotes`, `rawBrowserStorage`, and unpublished islands.
  - `toPublicIsland(rawIsland, owner)`: Enforces strict opt-in per island (`isPublic === true`; returns `null` otherwise). Strips unshared private `objective`, per-goal `completed` state/timestamps, `difficulty`, `practiceAdjustment`, `onDevice`, and `continuation` goals.
  - `toAdoptableRoadmap(publicIsland, ownerProfile)` & `validateAdoptableRoadmap(template)`: Produces a validated starter template directly compatible with `adoptIsland(world, template)` in `src/world.mjs` (`xp: 0`, `completed: false` on all starter goals, creator attribution in `attribution` and `creator`, plus `title`, `description`, `practice`, `finish`, `minutes`, `xp`, and `prerequisites` on each starter goal).
- **Mountable Explore UI (`src/social/explore.mjs`, `src/social/social.css`)**:
  - Exports `mountSocialExplore(container, { client, onAdopt, viewerWorld, onAnnounce, onTogglePublish })`.
  - Works out of the box with `createFixtureSocialClient()` (`src/social/fixtures.mjs`) or `createSupabaseSocialClient()` (`src/social/supabase-client.mjs`).
  - Supports browsing public profiles, opening another explorer's public archipelago on the SVG map, switching between their public islands, following/unfollowing, explainable people matching (`Similar Explorers`, `Mentor Matches`, `Discovery Matches` via `recommendExplorers` in `src/social/recommendations.mjs`), per-island opt-in visibility toggles, and `loading` / `empty` / `error` states with retry.
  - Standalone preview harness available at `src/social/preview.html`.
- **Supabase Backend & RLS (`supabase/migrations/20261107000000_social_schema.sql`, `supabase/config.toml`, `supabase/seed.sql`)**:
  - Defines `public.profiles`, `public.islands` (`is_public` defaults to `false`), `public.island_private_state` (owner-only table for private objectives, `completed_goal_ids`, and `raw_storage`), and `public.follows`.
  - Enforces RLS across all tables: Account B can browse and follow Account A, cannot read Account A's private islands even by ID, and cannot modify Account A's profile, islands, or follows.
- **Verification**:
  - `node --test`: **23/23 passing** (`tests/world.test.mjs`, `tests/social.test.mjs`, `tests/social-rls.test.mjs`).
  - Browser verification completed at desktop (`1280px`) and mobile (`375px`) widths with zero console errors or horizontal overflow.

---

### One-Pass Integration Instructions for `worldhopper/first-island`

1. **`index.html`**: Add the social stylesheet below `./src/styles.css`:
   ```html
   <link rel="stylesheet" href="./src/social/social.css">
   ```
2. **`src/app.mjs`**: Import `mountSocialExplore` and `createFixtureSocialClient` from `./social/index.mjs`:
   ```js
   import { mountSocialExplore, createFixtureSocialClient } from './social/index.mjs';
   const socialClient = createFixtureSocialClient();
   ```
3. **Mount when `activeView === 'explore'`**:
   Render `<div id="explore-mount"></div>` in the Explore view and mount:
   ```js
   mountSocialExplore(app.querySelector('#explore-mount'), {
     client: socialClient,
     viewerWorld: world,
     onAnnounce: announce,
     onAdopt(template) {
       persist(adoptIsland(world, template));
       selectedId = world.islands.at(-1).id;
       activeView = 'world';
       animateIsland = true;
       announce(template.title + ' added to your world.');
       render();
     },
   });
   ```
