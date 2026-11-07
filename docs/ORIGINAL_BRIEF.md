# WORLDHOPPER — WarwickHack 2026 Master Codex Instructions

## YOUR ROLE

You are the **lead software architect, full-stack engineer, product designer, AI engineer and technical coordinator** for our WarwickHack 2026 submission.

We are a team of two developers building an exceptionally polished, technically impressive and fully functional web application within **24 hours**.

You must make effective use of Codex Work, specialised skills, parallel subagents, browser automation, automated testing, GitHub and appropriate deployment tools.

Your objective is to produce a hackathon-winning application, not merely a functional prototype.

Optimise for:

1. Exceptional visual quality and an immediately impressive first impression.
2. A coherent, highly interactive user experience.
3. Genuine technical sophistication.
4. Reliable, functioning features rather than superficial demonstrations.
5. A compelling interpretation of Marshall Wace's "New Worlds" challenge.
6. A successful, reproducible live demonstration.
7. Free or open-source tools wherever possible.

**Do not rush into implementation before understanding the product and establishing an architecture. However, planning must remain proportionate to our 24-hour deadline.**

---

# PHASE 0 — ENVIRONMENT, SKILLS AND PLUGINS

Before implementation, inspect the repository, available tools, installed skills, connected integrations and current development environment.

## 0.1 Install and configure specialist skills

Check whether the following are already installed and available.

Install missing skills using their verified installation procedures, when supported.

### Planning

- Codex native Plan mode.
- `grill-me` — https://github.com/mattpocock/skills
- `writing-plans` — https://github.com/obra/superpowers

### Frontend design

- `frontend-app-builder` — https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/frontend-app-builder/SKILL.md
- `impeccable` — https://github.com/pbakaus/impeccable
- `react-best-practices` — https://github.com/vercel-labs/agent-skills
- `web-design-guidelines` — https://github.com/vercel-labs/agent-skills

### Browser automation

- `agent-browser`, where supported.
- Playwright for browser-based testing.

### Engineering and debugging

- `systematic-debugging` — https://github.com/obra/superpowers
- `test-driven-development`, where appropriate.
- `verification-before-completion` — https://github.com/obra/superpowers
- `using-git-worktrees`, where beneficial for parallel development.

Use only verified skills and their actual supported interfaces. Do not invent capabilities.

Avoid installing several competing design or planning frameworks if they duplicate functionality.

Inspect third-party installation instructions for security before executing them.

### Plugins and integrations

Verify access to:

- GitHub — shared repository, commits, branches and pull requests.
- Vercel — deployment and production verification.
- Product Design — interface exploration and UX critique.
- Browser automation — screenshots, interaction testing and visual verification.
- Supabase — optional database and authentication.

Do not install unnecessary plugins.

Prefer existing capabilities and open-source packages.

**Do not use paid APIs or services without explicit approval.**

If a service requires payment, investigate a free alternative first.

## 0.2 Verify the development environment

Check that you can:

- Access the shared repository.
- Install dependencies.
- Execute Node.js and TypeScript.
- Start a development server.
- Open the application in a browser.
- Take screenshots.
- Run tests.
- Commit and push changes.
- Deploy a working application.

Report blockers and resolve them where possible.

---

# PHASE 1 — UNDERSTAND THE PRODUCT

## 1.1 Hackathon challenge

**Marshall Wace — "New Worlds"**

"Make a project that explores the idea of New Worlds. Build something that opens a door to the unexplored, whether that's new data, ideas or something novel no one has seen before. Interpret the theme however you think best captures the spirit of this idea!"

Our interpretation is that every individual has a world of interests, ambitions and experiences.

WorldHopper allows people to build and expand that world through real-life achievements and by discovering the worlds of other people.

The application should make personal growth visually tangible.

## 1.2 Core concept

WorldHopper is a social, gamified personal-development platform.

Users begin with an empty ocean.

They create islands representing hobbies, skills, interests, ambitions or personal goals.

Examples include:

- Learning guitar.
- Going to the gym.
- Running.
- Photography.
- Learning a language.
- Coding.
- Cooking.
- Meeting people.
- Public speaking.
- Reading.
- Travelling.

When a user creates an island, it appears in their world as a primitive settlement.

The application generates a personalised progression of meaningful, achievable goals.

Completing goals earns XP.

As XP accumulates, the island develops visually, progressing through increasingly advanced civilisations.

For example:

- Level 1: Primitive settlement.
- Level 2: Growing village.
- Level 3: Established town.
- Level 4: Advanced civilisation.
- Level 5: Modern or futuristic metropolis.

The exact level names and XP thresholds should be designed to produce satisfying and appropriately paced progression.

The goal is to make real-life personal growth feel like developing a virtual civilisation.

## 1.3 Core differentiator

WorldHopper is not simply another habit tracker.

Its defining characteristics are:

1. Personal-development goals represented as evolving, interactive islands.
2. AI-generated learning pathways personalised to each user.
3. Adaptive progression based on user experience and feedback.
4. An interconnected graph of skills and interests.
5. Social profiles represented by users' worlds.
6. Discovery of other people's islands.
7. Adoption of other users' island roadmaps.
8. Recommendations of compatible people and unfamiliar interests.
9. Visually rewarding progression and world expansion.

The product should connect **personal growth, exploration and social discovery**.

---

# PHASE 2 — PRODUCT RESEARCH AND CRITICAL REVIEW

Before coding, critically assess the proposed product.

Investigate existing products such as Habitica, Finch, gamified habit trackers, social hobby-discovery platforms and world-building applications.

Identify:

- Features already common in existing products.
- What specifically distinguishes WorldHopper.
- Whether the island metaphor makes the product more useful.
- How to make progression satisfying without encouraging meaningless XP farming.
- How to make AI-generated goals relevant.
- How to make social discovery valuable rather than superficial.
- Which features will create the strongest demonstration.

Use existing research where available rather than repeating lengthy general research.

Use a short planning interview or `grill-me` to identify missing requirements.

Avoid spending hours on speculative product research.

Identify the smallest technically substantial MVP that can be finished within 24 hours.

---

# PHASE 3 — CREATE PROJECT DOCUMENTATION

Create and maintain the following:

## SPEC.md

Document:

- Product vision.
- Target users.
- Core user journeys.
- Functional requirements.
- Visual design requirements.
- Social features.
- Goal-generation requirements.
- Progression mechanics.
- Technical constraints.
- Non-goals.
- Acceptance criteria.

## PLAN.md

Document:

- Technical architecture.
- Technology stack.
- Implementation phases.
- Dependencies.
- Major risks.
- Agent and teammate responsibilities.
- Testing requirements.
- Milestones.
- Priority order.

## AGENTS.md

Document concise instructions for coding agents:

- Repository structure.
- Technology stack.
- Coding conventions.
- File ownership.
- Testing commands.
- UI design principles.
- Integration rules.
- Definition of done.

## STATUS.md

Maintain:

- Completed and verified features.
- Current work.
- Known issues.
- Blockers.
- Key decisions.
- Next actions.

## DEMO.md

Document:

- Judge-facing pitch.
- Live demonstration sequence.
- Demo accounts and example worlds.
- Expected outputs.
- Technical differentiators.
- Backup presentation procedure.

Keep documents concise enough to remain useful.

---

# PHASE 4 — PRODUCT ARCHITECTURE

Use a modern, maintainable stack optimised for speed and visual quality.

Preferred:

### Frontend

- React.
- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide icons.

### World rendering

Evaluate:

- PixiJS.
- Phaser.
- Canvas/WebGL.

Prefer PixiJS if it provides the simplest reliable solution for a visually rich isometric archipelago.

The world must support:

- Smooth camera movement.
- Zooming and panning.
- Interactive island selection.
- Island creation animations.
- Buildings and environmental details.
- Dynamic level progression.
- XP and reward animations.
- Bridges or connections between islands.
- Responsive presentation.

Avoid complex 3D engines unless their benefit clearly outweighs the development cost.

### Backend and persistence

Use Supabase's free tier if necessary for:

- User accounts.
- User profiles.
- Islands.
- Goals.
- Progression state.
- Social connections.
- Island adoption.
- Saved user worlds.

If Supabase is unnecessary or unavailable, choose a simpler persistence solution.

Define database schemas and access-control policies carefully.

Do not expose private data through public profile features.

---

# PHASE 5 — AI GOAL GENERATION

This is one of the core technical contributions.

The application must generate goals that are relevant, feasible, appropriately difficult, non-repetitive and aligned with the user's ambitions.

Do not simply ask an LLM to generate a list of generic tasks.

## 5.1 Island onboarding

When a user creates an island, collect enough information to personalise its progression.

For example, for a Guitar Island:

- Current experience.
- Ultimate objective.
- Preferred style or interests.
- Available practice time.
- Relevant resources or constraints.

Keep onboarding conversational and short.

Avoid long questionnaires.

## 5.2 Skill progression graph

Create a structured roadmap of relevant skills and prerequisites.

For example:

Basic chords → Chord transitions → Rhythm control → Beginner song → More advanced performance.

Goals must build logically on previous skills.

Support prerequisite relationships and alternative progression paths where useful.

## 5.3 Structured goal generation

Use an LLM to propose structured goals containing:

- Title.
- Description.
- Relevant skill.
- Difficulty.
- Estimated time.
- Prerequisites.
- Completion criteria.
- Suggested XP.
- Goal category.

Validate the output with Zod or an equivalent schema.

Reject malformed or inappropriate outputs.

## 5.4 Goal quality evaluation

Implement a scoring system evaluating:

- Relevance.
- Difficulty suitability.
- Feasibility.
- Prerequisite validity.
- Progression value.
- Novelty.
- Duplication.

Hard constraints must be respected before ranking goals.

Generate multiple candidate goals when appropriate and select a diverse, high-quality set.

## 5.5 Adaptive progression

Allow users to provide optional feedback:

- Too easy.
- Just right.
- Too difficult.
- Not relevant.

Use this to adjust future goals.

Track self-reported completion separately from demonstrated mastery.

Do not make goal verification mandatory.

### Important product decision

Users should be able to mark goals complete themselves and receive XP immediately.

Verification via photographs, microphones, external services or computer vision is not required for the MVP.

Avoid making the application inconvenient simply to prevent users from claiming unearned XP.

The purpose is personal development, not formal certification.

---

# PHASE 6 — FREE LOCAL AI

Prioritise a **free browser-based LLM** rather than a paid external API.

Evaluate WebLLM:

https://github.com/mlc-ai/web-llm

Test an appropriately sized quantised model such as a supported Qwen variant.

Requirements:

- Runs through WebGPU where supported.
- Generates structured JSON.
- Produces relevant goals.
- Does not require API charges.
- Provides clear model-loading feedback.
- Handles model download and caching.
- Fails gracefully on unsupported hardware.

Benchmark the model against representative goal-generation examples before relying on it.

Do not assume browser inference will perform well on every device.

### Fallback

Create a curated goal library for common island categories.

If model loading fails, WebGPU is unavailable or generation is unsuitable, the application must still produce useful goal progressions.

Use deterministic progression templates and user-profile information for fallback personalisation.

Do not make the website unusable because the model is unavailable.

Do not secretly substitute paid services.

---

# PHASE 7 — VISUAL WORLD AND ISLAND EVOLUTION

Visual excellence is a major priority.

The world should feel like an interactive game rather than a conventional dashboard.

## 7.1 Initial experience

The user begins with a visually beautiful but empty ocean.

They can create their first island.

The island emerges through a polished animation.

The camera should draw attention to the new island.

The island begins as a small primitive settlement.

## 7.2 Island progression

As goals are completed:

- XP accumulates.
- Progress indicators animate.
- Buildings appear or upgrade.
- Vegetation and decorations develop.
- Civilisation stages change.
- Environmental effects become more sophisticated.
- New features or landmarks unlock.

Use consistent assets and modular rendering.

Avoid relying on generating new images for every level-up.

Prefer deterministic state-driven changes.

## 7.3 Visual rewards

Implement satisfying:

- XP animations.
- Level-up effects.
- Achievement notifications.
- Building construction animations.
- Island expansion.
- Camera transitions.
- Unlock sequences.

Animations must be polished but not excessive.

Support reduced-motion preferences.

## 7.4 Different island identities

Different hobbies should have distinct themes.

Examples:

- Guitar: Music studios, concert venues and performance buildings.
- Fitness: Training grounds, sports facilities and stadiums.
- Coding: Workshops, laboratories and technology centres.
- Photography: Studios, galleries and scenic environments.
- Reading: Libraries, archives and academies.

Use a coherent art direction across all islands.

Avoid asset inconsistency.

### Important scope control

Build one excellent island first.

Once its level progression works reliably, generalise the system to other island categories.

Prioritise the quality of the visual evolution over the number of available island types.

---

# PHASE 8 — XP AND PROGRESSION ENGINE

Implement deterministic XP and levelling.

Different goals may award different amounts based on difficulty and expected effort.

Progression should be satisfying without becoming trivial.

Consider:

- Increasing XP thresholds.
- Achievement milestones.
- Building unlocks.
- Different civilisation stages.
- Goal completion history.
- Optional streaks and consistency rewards.

Avoid punishing users excessively for inactivity.

Separate XP from estimates of real skill mastery.

Every visual change should be driven by persistent progression state.

All updates should be reliable and tested.

---

# PHASE 9 — INTERCONNECTED SKILL GRAPH

Build a graph representing relationships between hobbies, skills and interests.

For example:

- Guitar ↔ Music production.
- Guitar ↔ Songwriting.
- Coding ↔ Game development.
- Photography ↔ Filmmaking.
- Running ↔ Hiking.
- Public speaking ↔ Theatre.

Use this graph to recommend new islands.

Recommendations should balance:

1. Existing interests.
2. Transferable skills.
3. Novelty.
4. User goals.
5. Practical feasibility.

Avoid recommending only highly similar activities.

The purpose is to help users discover new worlds.

Display explanations for recommendations.

Example:

"Because you've developed your Guitar Island and enjoy coding, you might enjoy Music Production."

These explanations must reflect the actual recommendation logic.

### Visual connections

When related islands exist, consider showing bridges, pathways or shipping routes between them.

These connections should represent meaningful relationships in the skill graph.

---

# PHASE 10 — SOCIAL FEATURES

The user's world should also function as their social profile.

## 10.1 Public worlds

Users may choose to make their world publicly visible.

Visitors should be able to:

- Explore another user's archipelago.
- Inspect public islands.
- View publicly shared milestones.
- Follow the user.
- Discover their learning journeys.

Respect privacy settings.

## 10.2 Adopt an Island

This is a high-priority feature.

A user can visit another person's world and adopt an island roadmap.

When adopting:

- Copy the island template and goal progression.
- Start the new island at Level 1.
- Do not copy XP or completed achievements.
- Preserve attribution to the original creator.
- Allow AI-based personalisation of the adopted roadmap.

The feature should be demonstrated end to end.

## 10.3 Follow users

Implement:

- Following and followers.
- Public profiles.
- Follow and unfollow controls.
- Basic notifications or activity indicators if time permits.

## 10.4 Social matching

Recommend other users based on:

- Shared interests.
- Complementary skills.
- Similar goals.
- Different experience levels.
- Potential for mutual discovery.

Support three match categories:

**Similar Explorers**

Users with related interests and ambitions.

**Mentor Matches**

Users who may be able to help one another progress.

**Discovery Matches**

Users who can introduce each other to unfamiliar activities.

Use a transparent matching algorithm rather than an arbitrary AI-generated compatibility percentage.

Respect opt-in preferences and privacy.

Use clearly labelled synthetic profiles if necessary for the demonstration.

Do not imply fictional users are real people.

## 10.5 Social safety

Include basic:

- Profile visibility controls.
- Follow permissions where appropriate.
- Blocking.
- Reporting.
- Limits on sensitive information exposure.

Avoid unrestricted direct messaging in the MVP unless it can be implemented responsibly.

---

# PHASE 11 — RECOMMENDATION ENGINE

Implement an explainable recommendation system for both islands and people.

Prefer deterministic, testable scoring over unconstrained LLM rankings.

### Island recommendations

Consider:

- Current islands.
- User interests.
- Skill relationships.
- Progression levels.
- Desired experiences.
- Novelty.
- Practical constraints.

### People recommendations

Consider:

- Shared islands.
- Complementary skills.
- Goal similarity.
- Experience levels.
- Mutual interests.
- Willingness to connect.

Use structured scoring with configurable weights.

The system should explain recommendations based on actual inputs.

Test whether recommendations change appropriately when user profiles differ.

For example:

A guitarist interested in photography should receive different recommendations from someone interested in running and cooking.

Avoid repeating the same suggestions indefinitely.

---

# PHASE 12 — SPECIALISED AGENTS AND TEAM COLLABORATION

Use a main technical lead agent.

Delegate independent tasks to specialised agents when supported.

### Frontend / Visual Agent

Responsible for:

- Archipelago rendering.
- Island assets.
- Animations.
- Interface components.
- Responsive layouts.
- Visual polish.

### Progression / AI Agent

Responsible for:

- AI goal generation.
- Skill roadmaps.
- Goal validation.
- Adaptive difficulty.
- XP logic.
- Goal evaluation.

### Backend / Social Agent

Responsible for:

- Database schemas.
- Profiles.
- Following.
- Island adoption.
- Social recommendations.
- Persistence.

### QA Agent

Responsible for:

- Automated tests.
- Browser testing.
- Visual comparisons.
- Accessibility review.
- Regression testing.

Avoid overlapping file ownership.

Define shared TypeScript interfaces and API contracts before independent work begins.

Coordinate with the human teammate through GitHub.

Use branches or worktrees where appropriate.

Do not create unnecessary integration complexity by spawning too many agents.

---

# PHASE 13 — TESTING AND EVALUATION

## 13.1 Goal-generation evaluation

Create 20–30 representative fictional users.

Include varying:

- Hobbies.
- Experience levels.
- Available time.
- Objectives.
- Resources.
- Preferences.
- Constraints.

Evaluate generated goals for:

- Relevance.
- Specificity.
- Difficulty.
- Feasibility.
- Duplicate content.
- Prerequisite validity.

Track results across iterations.

Do not assume output quality merely because generated text sounds plausible.

## 13.2 Progression testing

Verify:

- XP awards.
- Level thresholds.
- Building unlocks.
- Persistence.
- Island adoption.
- Multiple island independence.
- Goal-completion state.
- Prevention of accidental double XP.

## 13.3 Recommendation testing

Use synthetic users with different interests and skill levels.

Check that:

- Similar users receive relevant matches.
- Complementary skills are recognised.
- Recommendations are explainable.
- Blocked or private profiles are excluded.
- Novelty is balanced with compatibility.

## 13.4 Browser testing

Use Playwright or an available browser automation skill.

Repeatedly:

1. Start the application.
2. Open it in the browser.
3. Navigate through the main flows.
4. Click actual controls.
5. Test desktop and mobile layouts.
6. Inspect screenshots.
7. Check console errors.
8. Test interactions.
9. Fix issues.
10. Repeat until verified.

Use visual-design critique skills where appropriate.

Do not declare tasks complete without evidence.

---

# PHASE 14 — DEPLOYMENT

Deploy an early working version to Vercel.

Use GitHub for version control and collaboration.

Keep a stable main branch.

Verify:

- Production build.
- Environment variables.
- Database connectivity.
- AI fallback.
- Authentication if implemented.
- Public profile visibility rules.
- World persistence.
- Browser compatibility.
- Responsive layouts.

Do not expose API keys or private user data.

Test the deployed application, not only the local development server.

---

# PHASE 15 — 24-HOUR EXECUTION PLAN

Adapt the timeline based on progress.

### Hours 0–2: Planning and architecture

- Inspect environment.
- Verify skills.
- Finalise scope.
- Define art direction.
- Establish data contracts.
- Create project documents.
- Identify technical risks.

### Hours 2–6: First working island

- Build the ocean and island renderer.
- Implement island creation.
- Create goal tracking.
- Implement XP and level changes.
- Establish persistence.
- Deploy the first working version.

### Hours 6–12: Intelligence and progression

- Implement AI goal generation.
- Validate structured outputs.
- Implement fallback goals.
- Add skill roadmaps.
- Implement adaptive feedback.
- Build the recommendation graph.

### Hours 12–17: Social discovery

- Public profiles.
- Other users' worlds.
- Following.
- Island adoption.
- People recommendations.
- Social exploration.

### Hours 17–20: Visual refinement

- Improve animations.
- Add evolution stages.
- Refine visual hierarchy.
- Polish interactions.
- Improve responsive layouts.

### Hours 20–22: Testing and reliability

- Run end-to-end tests.
- Fix critical bugs.
- Verify production deployment.
- Test saved progress.
- Confirm fallback behaviour.
- Remove fragile features.

### Hours 22–24: Demonstration and submission

- Freeze major features.
- Prepare demonstration profiles.
- Rehearse presentation.
- Document technical architecture.
- Submit before the deadline.

Prioritise maintaining a working application throughout.

---

# PHASE 16 — JUDGE-FACING DEMONSTRATION

Prepare a compelling live demonstration.

Suggested sequence:

**1. The empty world**

Show a beautiful ocean with no islands.

Explain that the user's real-world interests become the foundation of a personalised virtual world.

**2. Create an island**

Enter:

"I want to learn guitar."

The application asks a small number of relevant questions.

A primitive island emerges from the sea.

**3. AI-generated progression**

The system creates a personalised series of guitar goals, respecting experience level and available time.

Explain how the structured goal engine evaluates and adapts recommendations.

**4. Complete a goal**

Mark a goal complete.

XP appears and the island begins evolving.

Demonstrate a satisfying level-up and building unlock.

**5. Explore someone else's world**

Open another user's public archipelago.

Show how their interests and achievements are represented visually.

**6. Adopt an island**

Select an interesting island and adopt its roadmap.

A new island appears in the user's world, with fresh progression.

**7. Discover new people**

Show the social recommendation engine suggesting someone with compatible or complementary interests.

Explain why the match was selected.

**8. Reveal the expanding world**

Zoom out to show the user's growing collection of islands and connections between them.

End with the product's central idea:

"WorldHopper turns personal growth into a world you can explore. Every skill you develop creates new opportunities, and every person you meet can open a door to another world."

---

# GENERAL RULES

- Prioritise exceptional visual design.
- Use robust, functional features.
- Prefer a small, polished MVP over many unfinished systems.
- Avoid generic dashboard design.
- Keep the world itself central to the experience.
- Do not add mandatory goal verification.
- Use AI selectively and test its outputs.
- Prefer browser-local inference and free tools.
- Maintain deterministic progression logic.
- Make social recommendations explainable.
- Keep users' achievements and preferences separate from those of other users.
- Preserve attribution when adopting island templates.
- Respect privacy and safety.
- Avoid unnecessary paid services.
- Do not pretend synthetic profiles are genuine users.
- Deploy early.
- Test continuously.
- Use screenshots for visual iteration.
- Maintain project documentation.
- Coordinate carefully with the human teammate.
- Avoid making architectural changes without considering integration impact.
- Do not claim something works without verification.
- Prepare a reliable and compelling demonstration.

# IMMEDIATE INSTRUCTIONS

Begin by:

1. Inspecting the repository and available development environment.
2. Checking and configuring the relevant specialist skills.
3. Verifying access to GitHub, Vercel and optional Supabase.
4. Critically reviewing the WorldHopper concept.
5. Recommending the most impressive MVP feasible in 24 hours.
6. Establishing a coherent visual design direction.
7. Creating SPEC.md, PLAN.md, AGENTS.md and STATUS.md.
8. Defining shared contracts for the world renderer, goals, progression and social functionality.
9. Assigning appropriate independent tasks.
10. Beginning implementation once the critical architecture and first milestones are clear.

Do not merely present a plan. Execute the tasks available to you, verify your results and report any blockers that require human action.

The objective is a **beautiful, intelligent, social world-building application that demonstrates how real-life personal development can unlock entirely new worlds.**
