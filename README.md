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

1. **Aligned with Light Atlas UI & Pannable Map (`ce0265c`)**:
   - Merged `origin/worldhopper/learning` (`ce0265c`) into `worldhopper/social`.
   - Updated `src/social/explore.mjs` and `src/social/social.css` to use the Light Atlas palette (`--paper`, `--surface`, `--ink`, `--muted`, `--line`, `--sea`, `--signal`, `--focus`), the pannable/zoomable `.map-viewport` (`layoutIslands` from `src/map-layout.mjs` + `connectMap` from `src/map-camera.mjs`), and the floating `.field-notes.map-log` slide-over drawer (`id="social-island-log"`).
   - Wired the **Explore** tab on the main page (`index.html` and `src/app.mjs`) to mount `mountSocialExplore` directly inside `#explore-mount`.
2. **Social Contracts (`src/social/contracts.mjs`)**:
   - `toPublicProfile`, `toPublicIsland` (strict opt-in per island via `isPublic === true`), `toAdoptableRoadmap`, and `validateAdoptableRoadmap`.
   - Strips email, private objectives, per-goal completion progress, continuation goals, and raw browser storage from all public reads.
3. **Supabase Schema & Row-Level Security (`supabase/migrations/20261107000000_social_schema.sql`, `src/social/supabase-client.mjs`)**:
   - Defines `public.profiles`, `public.islands` (`is_public` defaults to `false`), `public.island_private_state`, and `public.follows` with strict RLS policies verified across two accounts.
