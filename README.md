# WorldHopper

WorldHopper is an interactive archipelago for learning skills and pursuing personal ambitions. Each island offers one practice goal at a time. Completing goals earns XP and develops the island. Related skills can lead to new islands, and Explore lets you adopt a starter roadmap from a labelled sample world.

[Open the shared preview](https://worldbuilder-git-worldhopper-first-island-rak12.vercel.app/)

## Start here

| Document | What it covers |
| --- | --- |
| [Original brief](docs/ORIGINAL_BRIEF.md) | The complete initial WarwickHack prompt, including product intent, feature phases, and technical constraints. |
| [Status](STATUS.md) | What is live and verified, plus the next social workstream. |
| [Agent instructions](AGENTS.md) | Branches, file ownership, integration rules, and verification. |
| [Specification](SPEC.md) and [plan](PLAN.md) | The first-slice scope and initial implementation plan. Use Status for the current state. |

## Run locally

Use Node.js 20 or newer. Run `node --test` from the repository root. For a browser preview, serve the repository over HTTP with `python -m http.server 8000` and open `http://localhost:8000`.

## Working in parallel

Start both workstreams from `worldhopper/first-island`, the branch behind the shared preview. Use a separate checkout per agent and target PRs back to this branch.

| Workstream | Branch | Ownership |
| --- | --- | --- |
| Codex learning and app integration | `worldhopper/learning` | The app shell, map renderer, goals, XP, difficulty feedback, skill recommendations, and their tests. |
| Antigravity social and public Explore | `worldhopper/social` | `src/social/**`, `supabase/**`, and `tests/social*.test.mjs`. |

Start social development with a fixture client and a standalone preview page under `src/social/`. Define a mountable interface such as `mountSocialExplore(container, { client, onAdopt })`. Codex wires it into the existing Explore view after review. Publishing is opt-in per island. Adoption copies the starter plan and creator attribution, starts at zero XP, and uses locally assigned goal rewards.
