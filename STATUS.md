# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Newly generated islands use six distinct landforms and skill landmarks, such as a camera on alpine terrain. For unfamiliar skills, Nano can choose a landmark from the icon library in the first exercise response. Landforms stay stable after reload and buildings still appear as XP grows.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 36 Node tests pass. Desktop and mobile Chrome checks with a simulated model created six themed islands, verified one first exercise request per island, and checked art stability after reload. A prior real Nano run took 15.5 seconds to write an exercise with the model loaded.

## Next workstream

Benchmark a hosted text model against the five-second target and extend tailored generation to unsupported browsers and devices. Then review Antigravity’s shared ocean Explore integration (`worldhopper/social`, `e52fb84`) against the updated learning branch. Verify the fixture experience before enabling opt-in public data.
