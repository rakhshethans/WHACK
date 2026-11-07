# WorldHopper

WorldHopper is an interactive archipelago for learning skills and pursuing personal ambitions. Each island offers one practice goal at a time. Completing goals earns XP across a 10-level progression curve (`0` to `36,000 XP`) and visually develops the island. Related skills can lead to new islands, and **Explore** opens a shared ocean atlas where surrounding neighbours are dynamically ranked by shared interests and mentor-style level complementarity, allowing you to inspect public archipelagos, follow explorers, and adopt starter roadmaps into your own world.

[Open the shared preview](https://worldbuilder-git-worldhopper-first-island-rak12.vercel.app/)

## Start here

| Document | What it covers |
| --- | --- |
| [Original brief](docs/ORIGINAL_BRIEF.md) | The complete initial WarwickHack prompt, including product intent, feature phases, and technical constraints. |
| [Status](STATUS.md) | What is live and verified across the integrated application, plus known limitations. |
| [Agent instructions](AGENTS.md) | Architecture, module ownership, integration rules, and verification commands. |
| [Specification](SPEC.md) and [plan](PLAN.md) | The first-slice scope and initial implementation plan. Use Status for the current state. |
| [Social module guide](src/social/README.md) | Data contracts, Supabase RLS schema, fixture/Supabase clients, and `mountSocialExplore` API. |
| [Social Graph & Network Plan](docs/SOCIAL_GRAPH_PLAN.md) | Architecture and review notes for graph-ranked surrounding neighbours, dummy account switching, and Following/Followers solo archipelago view. |

## Run locally

Use Node.js 20 or newer. Run `node --test` from the repository root to execute the full 66-test suite (learning engine, progression, island artwork, map camera, social contracts, graph recommender, RLS simulation, and cross-module integration).

For a browser preview, serve the repository over HTTP with `python -m http.server 8000` and open `http://localhost:8000`.

To reset a test world, open the app with `?testing=1`, choose **Reset islands** in the My world footer, and confirm. This clears the current browser’s islands and their progress while keeping Explore’s sample worlds available.

---

## Combined Architecture (`worldhopper/integration`)

WorldHopper integrates three core engines into a single Light Atlas interface:

### 1. Personalised Learning & 10-Level Progression Engine (`src/world.mjs`, `src/local-planner.mjs`, `src/progression.mjs`, `src/custom-roadmap.mjs`, `src/difficulty.mjs`)
- **On-Device AI with Reliable Guided Fallback**:
  - When Chrome’s built-in Gemini Nano (`LanguageModel`) is installed and `'available'`, new islands open as soon as the model returns the first tailored exercise (`generateStarterRoadmap`), warming the session when the dialog opens (`warmStarterModel`) and preparing subsequent exercises in the background (`generateContinuation`).
  - When on-device AI is unavailable (`'unavailable'`, `'downloadable'`, or unsupported browser/device), island creation automatically falls back to `createIsland` and the guided goal library (`buildCustomRoadmap` in `src/custom-roadmap.mjs`), producing a non-boilerplate 8-step progression for both curated tracks (Guitar, Songwriting, Photography, Origami, Spanish, Languages, Chess/Board games, Public speaking, Visual storytelling, Meeting new people) and arbitrary custom skills.
- **Adaptive Practice & Written Goal Revision**:
  - Learners can rate active practice difficulty (**Too hard**, **About right**, **Too easy**) via `setDifficulty` to coach the current exercise (`coachGoal`) and adapt the next goal (`generateAdaptiveGoal` / `guidedNextGoal`).
  - On-device generated goals also include a **Give feedback** form (`generateGoalRevision` / `reviseActiveGoal`) to rewrite the active exercise and save `practicePreference` for future goals.
- **10-Level XP Curve & Skill Maintenance (`src/progression.mjs`)**:
  - Islands progress through 10 stages (`Settlement` at `0 XP`, `Hamlet` at `350 XP`, `Village` at `950 XP`, `Town` at `2,000 XP`, `Port` at `3,800 XP`, `City` at `6,500 XP`, `Capital` at `10,500 XP`, `Metropolis` at `16,000 XP`, `Citadel` at `24,000 XP`, and `Mastery` at `36,000 XP`).
  - Completing a goal resets a 7-day maintenance grace window (`PRACTICE_GRACE_DAYS`). Overdue islands lose `10–400 XP` per day depending on level (`applyInactivity`).

### 2. Interactive World & Artwork Engine (`src/scene.mjs`, `src/island-art.mjs`, `src/generated-icons.mjs`, `src/map-layout.mjs`, `src/map-camera.mjs`)
- **Evolving Island Artwork**: Islands combine 6 landforms (`alpine`, `cove`, `forest`, `mesa`, `archipelago`, `dunes`), 8 terrain colour palettes, 8 shoreline biomes, 27 recognised subject landmarks (`knownLandmark`), personal topic seals, stage-dependent settlement buildings through Level 10, and optional Nano-generated SVG pictograms (`generateIslandIcon` / `storeGeneratedIcon`) shared across both **My world** and **Explore**.
- **Scattered Layout & Camera Controls**: `layoutIslands` places islands deterministically without collisions across desktop and mobile widths, while `connectMap` provides drag-to-pan and centered zoom (`zoomAround`, `fitMapZoom`).

### 3. Graph-Based Social Discovery & Shared Ocean Atlas (`src/social/graph.mjs`, `src/social/explore.mjs`, `src/social/contracts.mjs`, `src/social/recommendations.mjs`)

Instead of a static profile list or an arbitrary fixed quota of 8 recommendations, [`rankNeighborsByGraph`](src/social/graph.mjs) recommends **between `0` and `8` surrounding neighbours** who genuinely share skills or interests with the active viewer and prioritises **complementary (mentor/mentee) skill level gaps**.

#### How Nearest-Neighbours & Mentor Matching Works:
1. **Canonical Skill & Interest Normalization (`normalizeIslandSkill`, `normalizeInterestToken`)**:
   Maps islands and profile interest tags into canonical `skillKey` nodes (`guitar`, `songwriting`, `photography`, `japanese`, `spanish`, `french`, `origami`, `chess`, `shogi`, `public-speaking`, `visual-storytelling`, `meeting-people`, `urban-sketching`, etc.) and optional broad `themeKey` nodes (`language`, `board`, `speaking`, `visual`, `people`, `craft`, `music`). Keeps exact skills distinct (`Japanese` vs `Spanish`) and ignores generic `'compass'` fallback themes.
2. **Strict Shared-Interest Eligibility Filter (`0..8` Neighbours, No Quota Padding)**:
   A candidate explorer is only eligible if they have at least one public island (`publicIslands.length > 0`) **and** share at least one exact `skillKey` with the viewer's islands (via a public island or declared interest). If `0` or `3` candidates share an interest, only `0` or `3` neighbours are returned.
3. **Mentor-Style Level Complementarity Scoring (`levelComplementarity`)**:
   For every shared skill $s$ between the viewer (level $L_{\text{viewer}}$) and candidate (level $L_{\text{candidate}}$):
   - **Adamic–Adar Rarity**: $\text{rarity}(s) = \frac{18}{\ln(1.7 + \text{df}(s))}$
   - **Scale-Independent Level Complementarity**:
     $$\text{complementarity}(L_{\text{viewer}}, L_{\text{candidate}}) = \frac{|L_{\text{viewer}} - L_{\text{candidate}}|}{\max(L_{\text{viewer}}, L_{\text{candidate}})} \in [0, 1)$$
     For example, a `Lv 50` Guitar player comparing a `Lv 1` Guitar player gets $\frac{49}{50} = \mathbf{0.98}$ (strong mentor/mentee pairing), whereas a `Lv 37` Guitar player gets $\frac{13}{50} = \mathbf{0.26}$.
   - **Per-Skill Score**:
     $$\text{skillScore}(s) = \text{rarity}(s) \times \bigl(0.35 + 1.65 \times \text{complementarity}(L_{\text{viewer}}, L_{\text{candidate}})\bigr)$$
4. **Personalized PageRank Tie-Breaking (`buildInterestGraph`, `computePersonalizedPageRank`)**:
   Runs a 24-iteration Random Walk with Restart ($\alpha = 0.80$) from `user:viewer` across user, skill, curated 1-hop related-skill (`RELATED_SKILLS`), theme, and follow edges to break ties among eligible candidates:
   $$\text{score} = \text{sharedScore} + 2 \times \text{relatedBridgeCount} + \text{socialScore} + 3 \times \frac{\text{PPR}(u)}{\max_v \text{PPR}(v)}$$
5. **Evidence-Based Badges & Collision-Free Compass Sectors**:
   Eligible neighbours are placed into up to 8 collision-free compass sectors (`NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`) around `Home Waters` with explicit relationship badges (`Mentor · Origami Lv 4 (you Lv 1)`, `You could mentor · Guitar Lv 2 (you Lv 4)`, `Peer · Chess Lv 3`, `Shared interest · Photography`).
6. **Dummy Account Switcher, Following/Followers & Solo Archipelago View**:
   - Switch between **You (My world)** and 4 sample personas (`Maya Chen`, `Sora Takahashi`, `Elena Rostova`, `Ari Patel`) with no login required to see how recommendations change dynamically.
   - Open **Following · Followers** to browse your full network (including zero-island followers like `Lin Zhou`) and click **View archipelago ↗** to inspect any explorer's islands in an isolated **Solo Archipelago View** (`data-map-mode="solo"`).
   - Click **Adopt starter roadmap** on any public island to add it to **My world** at Level 1 (`0 XP`) with creator attribution preserved (`toAdoptableRoadmap` / `adoptIsland`), immediately updating your social recommendations.
7. **Supabase Schema & Row-Level Security (`supabase/migrations/20261107000000_social_schema.sql`)**:
   - Defines `public.profiles`, `public.islands` (opt-in `is_public` defaults to `false`), `public.island_private_state`, and `public.follows` with strict RLS policies verified in `tests/social-rls.test.mjs`.
