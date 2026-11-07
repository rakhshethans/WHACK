# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Generated islands use six hand-drawn landforms and eight muted terrain palettes. Familiar skills use the illustrated icon library. Unfamiliar skills show a seal while an installed Nano model designs a matching landmark in the background. The browser saves the drawing and reuses it for related skills. Goal requests take priority over the artwork.
- Personalised practice paths, one active goal at a time, and continuing goals beyond the first roadmap. The ten-level XP curve reaches Mastery at 36,000 XP. Completing a goal resets the seven-day grace period even at Mastery. Inactive islands lose 10–400 XP per day depending on their level. The island log shows the next deduction, and demotion changes the artwork and next exercise. Older saves keep their XP and start with a fresh grace period.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 47 Node tests pass. Desktop and mobile Chrome checks with a simulated model verified that the first goal opens before icon generation, new goal requests cancel in-flight icon work, and related skills reuse a saved icon after reload. Native Nano timing and drawing quality remain unmeasured for the new feature.

Vercel Authentication has blocked direct access from the isolated test browser, so interactive verification uses the local build.

## Next workstream

Benchmark a hosted text model against the five-second target and extend tailored generation to unsupported browsers and devices. Review Antigravity’s graph-ranked shared ocean and Following/Followers views (`worldhopper/social`, `92aac83`) before wiring them into Explore.
