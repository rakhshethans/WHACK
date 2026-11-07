# WorldHopper repository instructions

- Keep main stable. Work from a feature branch and share changes for review.
- Use Node 20 or newer. Run `node --test` from the repository root.
- Serve the repository over HTTP for local preview, for example `python -m http.server 8000`.
- Keep progression logic independent of the DOM. Never award XP twice for the same goal.
- Treat all roadmap and profile strings as untrusted when rendering HTML.
- Keep the map central, support keyboard navigation and honour reduced motion.
- Verify affected browser flows at desktop and mobile widths. Record any blocked verification in STATUS.md.
- Use free services only. Label sample profiles and preserve attribution on adoption.

## Parallel development

- Branch from `worldhopper/first-island` and target PRs back to it. This branch drives the shared preview.
- The learning workstream owns `index.html`, `src/app.mjs`, `src/styles.css`, the map renderer, the learning engine, and the existing world tests.
- The social workstream owns `src/social/**`, `supabase/**`, and `tests/social*.test.mjs`. Build and verify its Explore interface in isolation. List any app-shell changes needed in the PR so the learning workstream can integrate them.
- Public islands require explicit opt-in. Pass only a validated starter roadmap and attribution for adoption. XP and completion are local progression state.
- Read [README.md](README.md) and [STATUS.md](STATUS.md) first, then use the [original brief](docs/ORIGINAL_BRIEF.md) for the full product intent.
