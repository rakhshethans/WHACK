# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Island scenery adds eight stable coastline shapes and eight biome palettes/details, chosen from the island ID and skill. Skill landmarks and XP-stage development remain intact.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- New personal islands open as soon as the browser model returns the first tailored exercise and checkpoint. The next exercise is prepared while the current one is open. Unclear requests are returned for editing, and unavailable generation leaves the form intact. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 33 Node tests pass. Desktop and mobile Chrome checks with a simulated model verified the structured output compatibility path, queued goals, XP and reload. The regular Chrome profile reached model generation, but an isolated Chrome profile reported Nano as unavailable. Successful real model output remains unverified.

## Next workstream

Verify real model output and extend tailored generation to unsupported browsers and devices. Then review Antigravity’s shared ocean Explore integration (`worldhopper/social`, `e52fb84`) against the updated learning branch. Verify the fixture experience before enabling opt-in public data.
