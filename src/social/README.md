# WorldHopper Social Module (`src/social/`)

This module implements the public profile directory, opt-in island publishing, public archipelago browsing, follow/unfollow, explainable people matching, and attributed roadmap adoption for WorldHopper.

## 1. Data Contracts (`src/social/contracts.mjs`)

### `PublicProfile`
Returned by `toPublicProfile(rawRecord, { viewerId, followingIds, blockedIds })`:
- `id`: `string`
- `handle`: `string`
- `displayName`: `string`
- `bio`: `string`
- `interests`: `string[]`
- `isSample`: `boolean` (`true` for synthetic demo profiles, `false` for user accounts)
- `followerCount`: `number`
- `followingCount`: `number`
- `isFollowing`: `boolean`
- `publicIslandCount`: `number`
- `publicIslands`: `PublicIsland[]` (contains **only** islands where `isPublic === true`)

*Stripped/excluded from public reads:* `email`, `privateNotes`, `rawBrowserStorage`, `localStorage`, and unpublished islands.

### `PublicIsland`
Returned by `toPublicIsland(rawIsland, owner)` when `rawIsland.isPublic === true` (otherwise `null`):
- `id`: `string`
- `ownerId`: `string`
- `creatorName`: `string`
- `creatorHandle`: `string`
- `isSample`: `boolean`
- `title`: `string`
- `category`: `'guitar' | 'songwriting' | 'photography' | 'custom'`
- `topic?`: `string`
- `theme?`: `string`
- `experience`: `'beginner' | 'intermediate' | 'advanced'`
- `sessionMinutes`: `number`
- `xp`: `number`
- `level`: `number`
- `stageName`: `string`
- `publicSummary`: `string` (only shared summary or focus—never an unshared private `objective`)
- `sharedMilestone?`: `string`
- `roadmap`: `{ focus: string, checkpoint: string, next?: string }`
- `goals`: `PublicGoalTemplate[]` (`{ id, title, description, practice, finish, minutes, prerequisites }`)

*Stripped/excluded from public reads:* per-goal `completed` state, `completedAt`, `difficulty`, `practiceAdjustment`, `onDevice`, and `continuation` goals.

### `AdoptableRoadmapTemplate`
Produced by `toAdoptableRoadmap(publicIsland, ownerProfile)` and validated by `validateAdoptableRoadmap(template)`:
- Directly compatible with `adoptIsland(world, template)` in `src/world.mjs`.
- Resets `xp: 0` and sets `completed: false` on every starter goal.
- Preserves creator credit via `attribution`, `owner`, and `creator: { id, handle, displayName, isSample, sourceIslandId }`.
- Includes `title`, `description`, `practice`, `finish`, and `prerequisites` on every starter goal.

---

## 2. Mountable Explore API (`src/social/explore.mjs`)

```js
import { mountSocialExplore, createFixtureSocialClient } from './social/index.mjs';

const exploreController = mountSocialExplore(containerElement, {
  client: createFixtureSocialClient(), // or createSupabaseSocialClient(...)
  viewerWorld: world,
  onAnnounce: message => announce(message),
  onAdopt: template => {
    persist(adoptIsland(world, template));
    selectedId = world.islands.at(-1).id;
    changeView('world');
  },
});
```

---

## 3. Integration Notes for `worldhopper/first-island`

To replace the static `discoverWorlds()` in `src/app.mjs` in one pass:
1. Link `./src/social/social.css` in `index.html` below `./src/styles.css`.
2. In `src/app.mjs`, import `{ mountSocialExplore, createFixtureSocialClient } from './social/index.mjs'`.
3. When `activeView === 'explore'`, render a container `<div id="explore-mount"></div>` and call `mountSocialExplore(app.querySelector('#explore-mount'), { client, viewerWorld: world, onAnnounce: announce, onAdopt(template) { persist(adoptIsland(world, template)); selectedId = world.islands.at(-1).id; activeView = 'world'; animateIsland = true; announce(template.title + ' added to your world.'); render(); } })`.
