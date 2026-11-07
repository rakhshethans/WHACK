# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Personalised practice paths, one active goal at a time, XP thresholds, and continuing goals beyond the first roadmap.
- Custom skills and ambitions such as meeting new people. The initial path uses an on-device browser model when ready and a guided fallback otherwise.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified baseline

Commit `b19410c` passed 14 Node tests. The deployed preview was checked on desktop and mobile for difficulty feedback, reload persistence, and the Guitar-to-Songwriting connection. The model integration is covered by a simulated model in tests, and the guided fallback was verified in the live preview.

## Next workstream

Build real profiles, opt-in public islands, and follow and unfollow in `src/social/`, starting with a fixture client. Introduce shared persistence and access rules before public data is enabled. See [README](README.md) and [AGENTS](AGENTS.md) for file ownership and integration.
