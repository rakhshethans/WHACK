# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Island scenery adds eight stable coastline shapes and eight biome palettes/details, chosen from the island ID and skill. Skill landmarks and XP-stage development remain intact.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- Custom skills and ambitions such as meeting new people. The initial path uses an on-device browser model when ready and a guided fallback otherwise.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

Commit `568c4d5` passed all 27 Node tests. The deployed branch preview was checked at desktop and mobile widths: seven islands remain visible on the map, island scenery varies, and the page has no horizontal overflow.

## Next workstream

Build real profiles, opt-in public islands, and follow and unfollow in `src/social/`, starting with a fixture client. Introduce shared persistence and access rules before public data is enabled. See [README](README.md) and [AGENTS](AGENTS.md) for file ownership and integration.
