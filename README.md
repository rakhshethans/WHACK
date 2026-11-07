# WorldHopper

WorldHopper is an interactive archipelago for learning skills and pursuing personal ambitions. Each island offers one practice goal at a time. Completing goals earns XP and develops the island. Related skills can lead to new islands, and Explore lets you browse public and sample worlds, follow explorers, and adopt a starter roadmap into your own archipelago.

[Open the shared preview](https://worldbuilder-git-worldhopper-first-island-rak12.vercel.app/)

The integration branch combines My world and Social Explore. The integrated Explore currently runs against labelled sample personas. Roadmap sharing in this mode is saved in the browser and only visible inside the demo.

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

To reset a test world, open the app with `?testing=1`, choose **Reset islands** in the My world footer, and confirm. This clears the current browser’s islands and their progress. Explore’s sample islands remain available.

To reset a test world, open the app with `?testing=1`, choose **Reset islands** in the My world footer, and confirm. This clears the current browser’s islands and their progress. Explore’s sample islands remain available.

## Working in parallel

Start both workstreams from `worldhopper/first-island`, the branch behind the shared preview. Use a separate checkout per agent and target PRs back to this branch.

| Workstream | Branch | Ownership |
| --- | --- | --- |
| Codex learning and app integration | `worldhopper/learning` | The app shell, map renderer, goals, XP, difficulty feedback, skill recommendations, and their tests. |
| Antigravity social and public Explore | `worldhopper/social` | `src/social/**`, `supabase/**`, and `tests/social*.test.mjs`. |

---

## Social & Explore Architecture (`worldhopper/social`)

The **Explore** tab transforms social discovery into an interactive, pannable shared ocean map backed by a graph-based mentor/interest recommender, a multi-persona dummy account switcher, a Following & Followers network with solo archipelago inspection, and an optional Supabase + Row-Level Security (RLS) backend.

---

### 1. Nearest-Neighbours Graph & Mentor-Complementarity Matching (`src/social/graph.mjs`)

Instead of showing a static list of profiles or filling an arbitrary fixed quota of 8 neighbours, [`rankNeighborsByGraph`](src/social/graph.mjs) recommends **between `0` and `8` surrounding neighbours** who genuinely share skills or interests with the active viewer and prioritises **complementary (mentor/mentee) skill level gaps**.

#### Step 1: Canonical Skill & Interest Normalization
- **[`normalizeIslandSkill(island)`](src/social/graph.mjs)** and **[`normalizeInterestToken(token)`](src/social/graph.mjs)** map islands and profile interest tags into canonical `skillKey` nodes (e.g., `guitar`, `songwriting`, `photography`, `japanese`, `spanish`, `french`, `origami`, `chess`, `shogi`, `public-speaking`, `visual-storytelling`, `meeting-people`, `urban-sketching`) and optional broad `themeKey` nodes (`language`, `board`, `speaking`, `visual`, `people`, `craft`, `music`).
- Exact skills remain distinct (`Japanese` vs `Spanish`, `Chess` vs `Shogi`), and generic `'compass'` / `'custom'` artwork fallback themes are ignored so unrelated custom islands never create false graph edges.

#### Step 2: Strict Shared-Interest Eligibility Filter (`0..8` Neighbours, No Quota Padding)
- A candidate explorer is **only eligible** to appear as a recommended neighbour if they have at least one public island (`publicIslands.length > 0`) **and** share **at least one exact `skillKey`** with the viewer's islands (either via one of the candidate's public islands or via their declared `interests`).
- If the viewer has no islands yet, or if only 3 candidates share an interest with the viewer, `rankNeighborsByGraph` returns `0` or `3` neighbours respectively—never padding the ocean with unrelated profiles just to hit `8`.

#### Step 3: Mentor-Style Level Complementarity Scoring
For every shared skill $s$ between the viewer (at level $L_{\text{viewer}}$) and a candidate (at level $L_{\text{candidate}}$):

1. **Inverse-Frequency Skill Rarity (Adamic–Adar style)**:
   $$\text{rarity}(s) = \frac{18}{\ln(1.7 + \text{df}(s))}$$
   where $\text{df}(s)$ is the number of candidate explorers who have skill $s$. Rare shared skills carry higher weight than ubiquitous ones.

2. **Scale-Independent Level Complementarity (`levelComplementarity`)**:
   $$\text{complementarity}(L_{\text{viewer}}, L_{\text{candidate}}) = \frac{|L_{\text{viewer}} - L_{\text{candidate}}|}{\max(L_{\text{viewer}}, L_{\text{candidate}})} \in [0, 1)$$
   - **Example (Guitar Lv 10 viewer)**:
     - Candidate A at **Guitar Lv 1**: $\text{complementarity} = \frac{|10 - 1|}{10} = \mathbf{0.90}$ (strong mentor/mentee pairing)
     - Candidate B at **Guitar Lv 7**: $\text{complementarity} = \frac{|10 - 7|}{10} = \mathbf{0.30}$ (closer levels)
     - Candidate C at **Guitar Lv 10**: $\text{complementarity} = \frac{|10 - 10|}{10} = \mathbf{0.00}$ (same-level peer)
   - If the match comes from a declared profile interest tag without a public island level (`theirLevel == null`), a neutral complementarity of `0.30` is used.

3. **Per-Skill Score**:
   $$\text{skillScore}(s) = \text{rarity}(s) \times \bigl(0.35 + 1.65 \times \text{complementarity}(L_{\text{viewer}}, L_{\text{candidate}})\bigr)$$
   Because the complementarity multiplier scales the weight from `0.35x` (equal levels) up to `2.00x` (maximum level gap), large mentor/mentee level gaps are strongly prioritised over near-equal skill levels on the same skill, while multi-skill overlap also accumulates across all shared skills:
   $$\text{sharedScore} = \sum_{s \in \text{sharedSkills}} \text{skillScore}(s)$$

#### Step 4: Graph Construction & Personalized PageRank Tie-Breaking
To break ties and reward broader neighbourhood cohesion among already-eligible candidates, [`buildInterestGraph`](src/social/graph.mjs) and [`computePersonalizedPageRank`](src/social/graph.mjs) run a 24-iteration **Random Walk with Restart (Personalized PageRank, $\alpha = 0.80$)** starting from `user:viewer` across a multipartite graph containing:
- **User nodes**: `user:viewer` and `user:<profile.id>`
- **Skill nodes**: `skill:<skillKey>` (weighted by island level: $3.0 + 0.3 \times L$ for viewer, $2.5 + 0.25 \times L$ for candidates, $1.1$ for declared interest tags)
- **Curated 1-hop related-skill bridges (`RELATED_SKILLS`)**: e.g. `guitar <-> songwriting`, `japanese <-> origami`, `chess <-> shogi`, `photography <-> visual-storytelling`
- **Theme bridges**: `skill:<skillKey> <-> theme:<themeKey>`
- **Social follow edges**: directed edges between `user:viewer` and followed/follower candidates

The final composite score for each eligible candidate is:
$$\text{score} = \text{sharedScore} + 2 \times \text{relatedBridgeCount} + \text{socialScore} + 3 \times \frac{\text{PPR}(u)}{\max_v \text{PPR}(v)}$$
Candidates are sorted by descending `score` (with deterministic alphabetical tie-breaking on `profile.id`), capped at `limit = 8`, and assigned to the `inner` ring (ranks `1..4`) or `outer` ring (ranks `5..8`).

#### Step 5: Evidence-Based Relationship Badges
Each recommended neighbour receives an explicit, human-readable relationship badge and explanation based on their highest-scoring shared skill:
- **Mentor** (`theirLevel > viewerLevel`): e.g. `Mentor · Origami Lv 4 (you Lv 1)`
- **You could mentor** (`theirLevel < viewerLevel`): e.g. `You could mentor · Guitar Lv 2 (you Lv 4)`
- **Peer** (`theirLevel === viewerLevel`): e.g. `Peer · Chess Lv 3`
- **Shared interest** (interest tag match): e.g. `Shared interest · Photography`

---

### 2. Shared Ocean Map & Collision-Free Sector Layout (`src/social/explore.mjs`, `src/social/social.css`)

- **Home Waters at Center**: The active viewer's islands are rendered at the center of the pannable ocean canvas, surrounded by a dashed territory ring.
- **8 Compass Sectors (`NW`, `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`)**: Up to 8 recommended neighbours are placed around Home Waters. Ranks `1..4` (closest matches) pull slightly closer to the center (`radialScale = 0.93`), while ranks `5..8` sit on the outer ring (`radialScale = 1.07`).
- **Stable Sector Assignment**: Each neighbour's compass sector is persisted in `assignedSectorsByProfileId` for the current viewer persona so clicking **Follow / Following** in the inspector never causes islands to jump to a different sector on the map.
- **Collision-Free Island Clusters**: Within each neighbour's cluster (`450 × 310`), up to 3 public islands are positioned in non-overlapping slots using each island's actual visual stage (`getStage(xp)`) and artwork (`islandArt(island)`), with a `+N more` pill when a user has more than 3 public islands.
- **Drag-to-Pan & Quick-Jump Controls**: Users can click-and-drag (or touch-drag) anywhere on the ocean, click any neighbour cluster to pan smoothly to it and open the bottom-right **Selected Archipelago Inspector**, or use the top overlay pills (`Home Waters` + neighbour pills with relationship badges) to jump directly to any cluster.

---

### 3. Dummy Account Switcher (`src/social/fixtures.mjs`, `src/social/explore.mjs`)

- **No Login Required**: A **Viewing as dummy account** switcher bar sits at the top of Explore with 5 distinct personas (`You (My world)`, `Maya Chen`, `Sora Takahashi`, `Elena Rostova`, and `Ari Patel`) backed by 11 rich dummy profiles in [`src/social/fixtures.mjs`](src/social/fixtures.mjs).
- **Live Persona Switching**: Clicking any dummy persona:
  1. Places that persona's islands at the center of the ocean (`Home Waters`),
  2. Excludes that persona from the candidate pool (`viewerId`),
  3. Re-runs `rankNeighborsByGraph` so you immediately see how different skill sets and levels produce different mentor/mentee recommendations and neighbour counts,
  4. Loads that persona's own **Following** and **Followers** relationships.

---

### 4. Following & Followers Network + Solo Archipelago Map View (`data-map-mode="solo"`)

- **Dedicated Network Panel (`listNetworkProfiles`)**: Below the ocean map, the **Following & Followers** section displays two columns (**Following** and **Followers**) sourced from the full profile dataset (`listNetworkProfiles()`), completely independent of which `0..8` profiles are currently shown as surrounding neighbours on the map.
- **Zero-Island Follower Support**: Followers who have `0` public islands (such as `Lin Zhou`) still appear in **Followers** with a clear `No public islands shared yet` note, while remaining excluded from the ocean map clusters.
- **Individual (Solo) Archipelago Map View**: Clicking **View archipelago ↗** on any profile card in Following/Followers (or **Solo archipelago view ↗** in the map inspector) fetches that explorer's world via `getPublicWorld(profileId)` and switches the canvas to `data-map-mode="solo"`.
  - In solo mode, the canvas renders **only** that explorer's public islands laid out cleanly via [`layoutIslands`](src/map-layout.mjs), along with a banner (`Viewing <Name>'s Archipelago (Solo Map View)`), a **Follow / Following** toggle, an **Adopt starter roadmap** action for any selected island, and a **← Back to neighbourhood** button that restores the shared ocean view and camera focus.

---

### 5. Social Compass Matchmaker & Roadmap Adoption (`src/social/recommendations.mjs`)

- **Social Compass Drawer**: **Social Compass** opens explainable recommendations for the active map neighbours. The map filters control which neighbours are shown, and each recommendation can jump to that explorer’s cluster.
- **Adopt Starter Roadmap**: Selecting any neighbour's island lets the viewer click **Adopt starter roadmap**, which clones a fresh Lv 1 (`xp: 0`) starter island with that skill's roadmap into the viewer's own world without copying private state.
- **Sample roadmaps**: The Chord Coast, Verse Dunes, and Silver Lens remain directly browsable when Home Waters has no matches.

---

### 6. Supabase Schema & Row-Level Security (`supabase/migrations/20261107000000_social_schema.sql`, `src/social/supabase-client.mjs`)

- **Fixture and Supabase clients**: The integrated shell selects the local fixture client. [`createSupabaseSocialClient`](src/social/supabase-client.mjs) is available for an explicitly configured backend. Real publishing and following need an authenticated viewer and a mapping from local islands to owner-controlled Supabase rows.
- **Strict Public/Private Separation**:
  - `public.profiles`, `public.islands` (`is_public` defaults to `false`), `public.island_private_state` (owner-only RLS), and `public.follows`.
  - `follows_select_public` RLS requires both `follower_id` and `following_id` to belong to public profiles unless `auth.uid()` is a participant in the follow row.
