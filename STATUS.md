# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Generated islands use six hand-drawn landforms and eight muted terrain palettes. Familiar skills use the illustrated icon library. Unfamiliar skills show a seal while an installed Nano model designs a matching landmark in the background. The browser saves the drawing and reuses it for related skills. Goal requests take priority over the artwork.
- Personalised practice paths, one active goal at a time, and continuing goals beyond the first roadmap. The ten-level XP curve reaches Mastery at 36,000 XP. Completing a goal resets the seven-day grace period even at Mastery. Inactive islands lose 10–400 XP per day depending on their level. The island log shows the next deduction, and demotion changes the artwork and next exercise. Older saves keep their XP and start with a fresh grace period.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Generated exercises have a written feedback form. A successful rewrite replaces the current exercise, preserves its XP reward, and uses the latest note to guide future exercises on that island.
- Browser-local saves and attributed roadmap adoption with fresh XP. Explore combines a shared ocean, exact-interest mentor matching, demo personas, Social Compass, Following and Followers, and solo archipelagos. The three original sample roadmaps have a direct browse entry.
- Explore demonstrates opt-in roadmap sharing across sample personas in this browser. Public projections exclude private notes, completion history, and inactivity deadlines. The Supabase client and schema are available for a configured authenticated deployment.

## Verified current state

All 63 Node tests pass. Desktop and mobile Chrome checks with a simulated model covered sample and custom adoption, creation, written feedback, XP and decay, generated icon display, mentor matching, Compass, follow and unfollow, zero-island followers, solo views, persona switching, and demo sharing across reload.

The full browser flow was verified locally. The social access-control tests use a simulated Supabase backend. Real account sign-in and publishing need an authenticated test project before activation.

## Next workstream

Review the integration preview before merging into the shared branch. Verify real Supabase authentication and row-level security before enabling live social data. Benchmark native goal generation and improve recovery for browsers without built-in AI.
