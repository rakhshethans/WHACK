# WorldHopper

WorldHopper is an interactive archipelago for learning skills and pursuing personal ambitions. Each island offers one practice goal at a time. Completing goals earns XP and develops the island. Related skills can lead to new islands, and Explore lets you browse public and sample worlds, follow explorers, and adopt a starter roadmap into your own archipelago.

[Open the shared preview](https://worldbuilder-git-worldhopper-first-island-rak12.vercel.app/)

## Start here

| Document | What it covers |
| --- | --- |
| [Original brief](docs/ORIGINAL_BRIEF.md) | The complete initial WarwickHack prompt, including product intent, feature phases, and technical constraints. |
| [Status](STATUS.md) | What is live and verified, plus the next social workstream. |
| [Agent instructions](AGENTS.md) | Branches, file ownership, integration rules, and verification. |
| [Specification](SPEC.md) and [plan](PLAN.md) | The first-slice scope and initial implementation plan. Use Status for the current state. |
| [Social module guide](src/social/README.md) | Contracts, Supabase RLS schema, fixture/Supabase clients, and `mountSocialExplore` API. |
| [Social Graph & Network Plan](docs/SOCIAL_GRAPH_PLAN.md) | Implementation plan for graph-ranked surrounding neighbours (`rankNeighborsByGraph`) and Following/Followers individual archipelago view. |

## Run locally

Use Node.js 20 or newer. Run `node --test` from the repository root. For a browser preview, serve the repository over HTTP with `python -m http.server 8000` and open `http://localhost:8000`.

## Working in parallel

Start both workstreams from `worldhopper/first-island`, the branch behind the shared preview. Use a separate checkout per agent and target PRs back to this branch.

| Workstream | Branch | Ownership |
| --- | --- | --- |
| Codex learning and app integration | `worldhopper/learning` | The app shell, map renderer, goals, XP, difficulty feedback, skill recommendations, and their tests. |
| Antigravity social and public Explore | `worldhopper/social` | `src/social/**`, `supabase/**`, and `tests/social*.test.mjs`. |

---

## Social Module Status & Codex Sync (`worldhopper/social`)

1. **Spatial Ocean Cluster Map (`src/social/explore.mjs`, `src/social/social.css`, `src/social/fixtures.mjs`)**:
   - **No top profile cards**: Instead of a directory of profile cards, the Explore tab renders a `2400px × 1680px` shared ocean canvas (`.social-ocean-scene`) powered by `connectMap` (`src/map-camera.mjs`).
   - **Default View — Current User's Archipelago**: The map starts centered on the current user's own islands (`data-cluster-id="home"`) with `logOpen: false` so only the user's islands and surrounding directional wayfinders are visible initially.
   - **Click & Drag to Nearby Users' Island Groups**: Sample users with nearby island clusters are placed in surrounding ocean sectors (`.archipelago-cluster.neighbor-cluster`).
   - **Click to Inspect User & Islands**: Clicking any nearby user's island group banner (`data-social-action="open-profile"`) or individual island (`data-social-action="select-island"`) opens the floating `.field-notes.map-log` drawer (`#social-island-log`) with the user's profile, follow toggle, island switcher tabs, starter roadmap, and one-click **Adopt roadmap ↗** action.
2. **Planned Next Update ([`docs/SOCIAL_GRAPH_PLAN.md`](docs/SOCIAL_GRAPH_PLAN.md))**:
   - **Graph-Ranked Surrounding Neighbours (5–10 Dynamic Neighbours)**: `rankNeighborsByGraph` (`src/social/graph.mjs`) builds a heterogeneous User–Skill–Follow graph over 12 sample explorers and runs Personalized PageRank (Random Walk with Restart) + Adamic-Adar similarity to select and position the top 5–10 neighbours around the user's Home Waters.
   - **Following & Followers Section + Individual Archipelago Map View**: Tracks both `isFollowing` and `followsViewer`; clicking any profile in **Following** or **Followers** opens their **Individual Archipelago View** (`mapMode: 'solo'`) on the ocean map using `layoutIslands` (`src/map-layout.mjs`), with a **"← Back to neighbourhood"** button.
3. **Social Contracts (`src/social/contracts.mjs`)**:
   - `toPublicProfile`, `toPublicIsland` (strict opt-in per island via `isPublic === true`), `toAdoptableRoadmap`, and `validateAdoptableRoadmap`.
   - Strips email, private objectives, per-goal completion progress, continuation goals, and raw browser storage from all public reads.
4. **Supabase Schema & Row-Level Security (`supabase/migrations/20261107000000_social_schema.sql`, `src/social/supabase-client.mjs`)**:
   - Defines `public.profiles`, `public.islands` (`is_public` defaults to `false`), `public.island_private_state`, and `public.follows` with strict RLS policies verified across two accounts.
