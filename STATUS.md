# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Island scenery adds eight stable coastline shapes and eight biome palettes/details, chosen from the island ID and skill. Skill landmarks and XP-stage development remain intact.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 35 Node tests pass. Desktop and mobile Chrome checks with a simulated model verified startup before submission, creation, queued goals, XP and reload. A prior real Nano run took 15.5 seconds to write an exercise with the model loaded. Real timing for this warmup change remains unverified.

## Next workstream

Benchmark a hosted text model against the five-second target and extend tailored generation to unsupported browsers and devices. Then review Antigravity’s shared ocean Explore integration (`worldhopper/social`, `e52fb84`) against the updated learning branch. Verify the fixture experience before enabling opt-in public data.
