# WorldHopper repository instructions

- Keep main stable. Work from a feature branch and share changes for review.
- Use Node 20 or newer. Run `node --test` from the repository root.
- Serve the repository over HTTP for local preview, for example `python -m http.server 8000`.
- Keep progression logic independent of the DOM. Never award XP twice for the same goal.
- Treat all roadmap and profile strings as untrusted when rendering HTML.
- Keep the map central, support keyboard navigation and honour reduced motion.
- Verify affected browser flows at desktop and mobile widths. Record any blocked verification in STATUS.md.
- Use free services only. Label sample profiles and preserve attribution on adoption.
