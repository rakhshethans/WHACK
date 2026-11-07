# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Island scenery adds eight stable coastline shapes and eight biome palettes/details, chosen from the island ID and skill. Skill landmarks and XP-stage development remain intact.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- New personal islands require eight tailored goals from the browser’s on-device model. Unclear requests are returned for editing, and unavailable generation leaves the form intact. New exercises after the starter plan are generated from completed work. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 30 Node tests pass. Local Chrome checks at desktop and mobile widths cover clarification, unavailable generation, island creation, XP and continuation across reload. Successful generation in these checks used a simulated model. Real generation requires a compatible device with the browser’s Prompt API.

## Next workstream

Verify real model output and extend tailored generation to unsupported browsers and devices. Then review Antigravity’s Explore integration (`worldhopper/social`, `64d8907`) against the updated learning branch. Verify the fixture experience before enabling opt-in public data. See [README](README.md) and [AGENTS](AGENTS.md) for file ownership.
