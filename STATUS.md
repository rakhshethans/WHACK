# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- On desktop, the mouse wheel zooms around the pointer and dragging pans the map directly from the overview. All three maps have more ocean around the edges, and Reset returns to the fitted view. Zoom buttons, touch panning, and arrow keys are also available.
- Generated islands use six hand-drawn landforms and eight muted terrain palettes. The 61 illustrated themes cover skills from gaming and sports to crafts, science, and everyday hobbies. Related skills share a landmark, and unmatched skills use an initials badge.
- Personalised practice paths, one active goal at a time, and continuing goals beyond the first roadmap. The ten-level XP curve reaches Mastery at 36,000 XP. Completing a goal resets the seven-day grace period even at Mastery. Inactive islands lose 10–400 XP per day depending on their level. The island log shows the next deduction, and demotion changes the artwork and next exercise. Older saves keep their XP and start with a fresh grace period.
- Crossing an XP threshold shows a gold pulse and a level-up banner. On mobile, the banner shows the upgraded island above the log. Reduced motion uses a static cue. Terrain develops from trails to lakes or rivers, docks or bridges, boats, roads with cars, parks and streetlights.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Island creation uses a 20-minute practice budget automatically. Updating an older roadmap keeps its saved budget.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Generated exercises have a written feedback form. A successful rewrite replaces the current exercise, preserves its XP reward, and uses the latest note to guide future exercises on that island.
- Browser-local saves and attributed roadmap adoption with fresh XP. Explore combines a shared ocean, exact-interest mentor matching, demo personas, Social Compass, Following and Followers, and solo archipelagos. The three original sample roadmaps have a direct browse entry.
- Adopted islands can use the original roadmap immediately. The island log also lets learners personalise it for their experience and outcome with Gemini Nano, keeping creator credit, XP and completed goals.
- Explore demonstrates opt-in roadmap sharing across sample personas in this browser. Public projections exclude private notes, completion history, and inactivity deadlines. The Supabase client and schema are available for a configured authenticated deployment.

## Verified current state

All 65 Node tests pass. Desktop and mobile Chrome verified level-up cues, staged landscape changes, and ordinary XP completion. Mobile also verified the static reduced-motion banner. Earlier browser checks covered theme selection, adoption, creation, written feedback, XP and decay, mentor matching, Compass, following, solo views, persona switching, and demo sharing.

Desktop and mobile Chrome verified the simplified island form and confirmed the practice budgets for new and updated roadmaps with a simulated model.

Desktop and mobile Chrome verified adoption, cancellation, failed generation and retry, personalised goal completion, and persistence with a simulated model. Native Gemini Nano personalisation still needs a run on the judging device.

Desktop Chrome verified the wider drag range, dragging from the overview, position after opening the island log, Reset, and wheel zoom on all three maps. Mobile Chrome verified touch panning and the zoom and reset buttons.

The full browser flow was verified locally. The social access-control tests use a simulated Supabase backend. Real account sign-in and publishing need an authenticated test project before activation.

## Next workstream

Use the integration preview and labelled sample profiles for panel judging. Verify access and native Gemini Nano generation on the judging device. Live accounts and public sharing can follow the panel demo, after authenticated Supabase and row-level security checks.
