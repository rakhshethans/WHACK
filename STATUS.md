# WorldHopper status

## Available in the integrated preview (`worldhopper/integration`)

- **Personal Archipelago & Evolving Artwork**: One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals. Generated islands use six hand-drawn landforms and eight muted terrain palettes. Familiar skills use the 27-subject illustrated icon library (`src/island-art.mjs`). Unfamiliar skills show a personal topic seal while an installed Nano model designs a matching landmark in the background (`src/generated-icons.mjs`), shared across both **My world** and **Explore**.
- **10-Level XP Curve & Skill Maintenance**: Personalised practice paths, one active goal at a time, and continuing goals beyond the first roadmap. The ten-level XP curve reaches Mastery at `36,000 XP` (`src/progression.mjs`). Completing a goal resets the 7-day grace period even at Mastery. Inactive islands lose `10–400 XP` per day depending on their level.
- **On-Device AI + Reliable Guided Fallback**:
  - When Chrome’s built-in Gemini Nano (`LanguageModel`) is installed and `'available'`, new islands open as soon as the model returns the first tailored exercise, warming the session when the dialog opens and preparing the next exercise in the background. Generated exercises include a written feedback form (`Give feedback`) to rewrite the current exercise and guide future practice.
  - When Gemini Nano is not installed (`'unavailable'`, `'downloadable'`, or unsupported browser/device), island creation automatically falls back to the guided goal library (`src/custom-roadmap.mjs`) so judges and learners on any browser or device can create islands for any valid skill without blocking on a multi-gigabyte model download.
- **Difficulty Coaching & Related Skills**: Per-island difficulty feedback (**Too hard**, **About right**, **Too easy**) persists and adjusts practice. Related-skill suggestions (`src/skill-connections.mjs`) unlock at `100 XP`, explain the connection, and can open or create the suggested island.
- **Graph-Ranked Social Explore & Shared Ocean Map (`src/social/`)**:
  - Replaces static demo cards with a `2800 × 1960` pannable shared ocean map showing the viewer's islands at `Home Waters` surrounded by `0–8` collision-free neighbour clusters (`NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`).
  - Only recommends explorers who share at least one exact skill or interest with the viewer (`rankNeighborsByGraph`), and prioritises mentor-style level complementarity (`|levelA - levelB| / max(levelA, levelB)`) combined with Adamic–Adar skill rarity and 24-iteration Personalized PageRank tie-breaking.
  - Includes an interactive **Viewing as dummy account** switcher (`You (My world)`, `Maya Chen`, `Sora Takahashi`, `Elena Rostova`, `Ari Patel`), a **Following & Followers** network drawer (supporting followers with `0` public islands), an **Individual (Solo) Archipelago View** (`data-map-mode="solo"`), and **Adopt starter roadmap** (`0 XP`, Level 1, creator attribution preserved, dynamically updating social recommendations).
- **Privacy & Supabase RLS**: Publishing is strictly opt-in (`isPublic === true`). Public projections strip emails, private notes, unshared objectives, per-goal completion state, and unpublished islands. Full PostgreSQL schema and Row-Level Security policies are included in `supabase/migrations/20261107000000_social_schema.sql`.

## Verified current state

- **66 / 66 automated Node tests pass** (`node --test`), covering unit tests for learning, 10-level progression, tailored AI generation, generated icons, map camera, social contracts, graph recommender, RLS two-account isolation, and end-to-end personal-to-social integration (`tests/integration.test.mjs`).
- **Real headless Chrome verification passed (`0` console errors)** across desktop (`1280×900`) and mobile (`375×812`) viewports for the complete journey:
  *Create island → Generate guided goal → Complete 5 goals → Earn 360 XP & level up to Level 2 (Hamlet) → Reload & verify persistence → Open Explore → Inspect & follow Spanish mentor Mateo Rivera → Adopt Flamenco Pier (Guitar) → Return to My world at Level 1 (0 XP) with attribution → Re-open Explore & verify Guitar mentors dynamically appear without horizontal overflow.*

## Known limitations

- **On-device AI hardware availability**: Chrome’s built-in `LanguageModel` (Gemini Nano) requires compatible desktop hardware and local model weights; browsers without an `'available'` local model use the deterministic guided goal library fallback for island creation and difficulty coaching, while free-form written goal rewrites require `LanguageModel`.
- **Synthetic social demonstration by default**: When `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not configured at runtime, Explore runs against the 11 labelled sample explorers in `src/social/fixtures.mjs` with in-memory follow/publish state.
