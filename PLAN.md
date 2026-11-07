# WorldHopper implementation plan

## Architecture

The first slice uses browser ES modules, SVG and localStorage. This gets a playable preview running without a dependency installation or database. The progression engine is independent of rendering and persistence, so the UI can migrate to a framework if the product grows.

- `src/world.mjs` owns immutable world updates, goals, XP, stage thresholds and adoption.
- `src/scene.mjs` accepts an island or no island and a numeric stage, and returns a complete SVG.
- `src/app.mjs` owns navigation, onboarding, view rendering and versioned browser storage.
- `tests/world.test.mjs` covers template selection, goal locks, duplicate XP, stage transitions and adoption.

A world owns islands. An island has an ID, category, title, XP and goals, with optional attribution. A goal has an ID, title, description, minutes, XP, prerequisite IDs and completion state. Adopting a roadmap copies goal definitions and resets all progression.

## Build order

1. Playable guitar island with persistence and attributed adoption.
2. Desktop and mobile browser QA and a Vercel preview.
3. Optional browser-local model generation with a schema, time budget and curated fallback.
4. Explainable discovery using a small skill graph and sample profiles.
5. Optional shared accounts, opt-in public worlds and follows, then judge-facing demo rehearsal.

Visual work owns SVG and responsive presentation. Progression work owns the data model and goal validation. Social work owns profile persistence and recommendations. QA owns browser and state regression checks.

WebGPU support and model download size are the main AI risks. Keep the curated path available immediately. Browser storage is device-specific. Add shared persistence only after testing ownership and visibility rules.
