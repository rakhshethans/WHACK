# WorldHopper repository instructions

- Keep `main` and `worldhopper/first-island` stable. Work from a feature or integration branch and share changes via pull request for review.
- Use Node 20 or newer. Run `node --test` from the repository root (all 66 tests must pass).
- Serve the repository over HTTP for local preview, for example `python -m http.server 8000`.
- Keep progression logic independent of the DOM. Never award XP twice for the same goal.
- Treat all roadmap and profile strings as untrusted when rendering HTML (`escapeHtml`).
- Keep the map central, support keyboard navigation and honour reduced motion.
- Verify affected browser flows at desktop (`1280×900`) and mobile (`375×812`) widths. Record any blocked verification in [STATUS.md](STATUS.md).
- Use free services only. Label sample profiles and preserve attribution on adoption.

## Integrated Architecture (`worldhopper/integration`)

- **Branch structure**:
  - `worldhopper/first-island`: Shared baseline branch.
  - `worldhopper/learning`: Codex personal world, 10-level progression, on-device AI planner, and island artwork workstream.
  - `worldhopper/social`: Antigravity social ocean map, graph recommender, dummy account switcher, solo archipelago view, and Supabase RLS workstream.
  - `worldhopper/integration`: Combined integration branch uniting `worldhopper/learning` and `worldhopper/social` and targeting PR review into `worldhopper/first-island`.
- **Module responsibilities**:
  - `index.html`, `src/app.mjs`, `src/styles.css`: Main application shell, onboarding dialog, personal archipelago view, and `#explore-mount` host for `mountSocialExplore`.
  - `src/world.mjs`, `src/progression.mjs`, `src/local-planner.mjs`, `src/custom-roadmap.mjs`, `src/difficulty.mjs`, `src/roadmaps.mjs`, `src/skill-connections.mjs`: Personal world state, 10-level XP & inactivity decay curve, Gemini Nano local planner with guided fallback, difficulty coaching, and `adoptIsland`.
  - `src/scene.mjs`, `src/island-art.mjs`, `src/generated-icons.mjs`, `src/map-layout.mjs`, `src/map-camera.mjs`: Isometric island and ocean SVG renderer, landform/palette/biome variation, background Nano icon generation, collision-free island layout, and pan/zoom camera.
  - `src/social/**`, `supabase/**`: Public/private data contracts (`contracts.mjs`), shared-interest & mentor-complementarity graph ranking (`graph.mjs`, `recommendations.mjs`), pannable shared ocean & solo archipelago Explore view (`explore.mjs`, `social.css`), 10-level calibrated fixture personas (`fixtures.mjs`), and Supabase PostgREST + RLS schema (`supabase-client.mjs`, `supabase/migrations/20261107000000_social_schema.sql`).
  - `tests/*.test.mjs`: Automated test suite (`world`, `learning`, `progression`, `tailored`, `generated-icons`, `map-camera`, `social`, `social-rls`, and `integration`).
- **Key integration invariants**:
  - Public islands require explicit opt-in (`isPublic === true`). Pass only a validated starter roadmap (`toAdoptableRoadmap` / `validateAdoptableRoadmap`) and creator attribution into `adoptIsland(world, template)`.
  - Adopted islands always start at `0 XP` (Level 1 `Settlement`) with all starter goals uncompleted.
  - Sample explorer XP values in `src/social/fixtures.mjs` and `supabase/seed.sql` are calibrated to the 10-level progression thresholds in `src/progression.mjs`.
  - Read [README.md](README.md) and [STATUS.md](STATUS.md) first, then use the [original brief](docs/ORIGINAL_BRIEF.md) for the full product intent.
