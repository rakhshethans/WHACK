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
| [Social Graph & Network Plan](docs/SOCIAL_GRAPH_PLAN.md) | Architecture and review notes for graph-ranked surrounding neighbours, dummy account switching, and Following/Followers solo archipelago view. |

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

1. **Graph-Ranked Surrounding Neighbours (`src/social/graph.mjs`, `src/social/recommendations.mjs`)**:
   - **`normalizeIslandSkill` & `normalizeInterestToken`**: Keeps exact skills distinct from broad themes (`Japanese` vs `Spanish`, `Chess` vs `Shogi`, `Origami`) and ignores generic `'compass'` artwork fallbacks so unrelated custom skills never falsely link.
   - **`rankNeighborsByGraph`**: Builds a directed weighted User–Skill–Theme–Follow graph over 11 dummy explorers and combines Adamic-Adar inverse-frequency shared-skill scoring, 1-hop related skill bridges (`RELATED_SKILLS`), and Personalized PageRank ($\alpha = 0.80$ with dangling-node mass return) to place the top **8** neighbours into 8 collision-free compass sectors (`NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`) around Home Waters.
   - **Evidence-Based Labels & Stable Sectors**: Displays concrete connection badges (`Both learning Japanese`, `Shared skills · Guitar & Songwriting`, `Related skill · Japanese → Spanish`) instead of uncalibrated percentages, and preserves each neighbour's sector index across follow/unfollow actions so the map never jumps.
2. **Dummy Account Switcher (`src/social/fixtures.mjs`, `src/social/explore.mjs`)**:
   - No login/auth required: includes an interactive **Viewing as dummy account** bar (`You (My world)`, `Maya Chen`, `Sora Takahashi`, `Elena Rostova`, `Ari Patel`) at the top of Explore.
   - Switching dummy accounts places that persona's islands at the center of the ocean (`Home Waters`), re-computes the surrounding 8 graph-ranked neighbours, updates the Social Compass recommendations, and switches the active Following & Followers graph.
3. **Following & Followers Network + Individual Archipelago Map View (`data-map-mode="solo"`)**:
   - Tracks both `isFollowing` and `followsViewer` via `listNetworkProfiles()`, independent of the map's top 8 ranked subset (including followers with `0` public islands such as `Lin Zhou`).
   - Clicking **View archipelago ↗** on any profile in **Following** or **Followers** (or **Solo archipelago view ↗** on any cluster) fetches their world via `getPublicWorld(profileId)` and switches the map to `data-map-mode="solo"`, rendering only that explorer's islands with `layoutIslands` (`src/map-layout.mjs`) and a **← Back to neighbourhood** button that restores neighbourhood camera state and focus.
4. **Supabase Schema & Row-Level Security (`supabase/migrations/20261107000000_social_schema.sql`, `src/social/supabase-client.mjs`)**:
   - Defines `public.profiles`, `public.islands` (`is_public` defaults to `false`), `public.island_private_state`, and `public.follows` (with `follows_select_public` requiring both endpoints to be public unless `auth.uid()` is a participant).
