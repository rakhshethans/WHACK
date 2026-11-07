# WorldHopper status

## Available in the preview

- One map for all personal islands, with distinct themed art for Guitar, Songwriting, Photography, and custom goals.
- Generated islands use six hand-drawn landforms and eight muted terrain palettes. The topic narrows the shape options, and the island identity picks a stable shape and colour. The expanded icon library distinguishes related skills like photography and filmmaking. Unfamiliar topics get a personal seal and can also use a landmark from the first exercise response.
- Personalised practice paths, one active goal at a time, and continuing goals beyond the first roadmap. The ten-level XP curve reaches Mastery at 36,000 XP. Completing a goal resets the seven-day grace period even at Mastery. Inactive islands lose 10–400 XP per day depending on their level. The island log shows the next deduction, and demotion changes the artwork and next exercise. Older saves keep their XP and start with a fresh grace period.
- New personal islands open as soon as the browser model returns the first tailored exercise. The app starts loading an installed Nano model when the island form opens and releases unused warmup after 45 seconds. A checkpoint is optional. The next exercise is prepared while the current one is open. Saved generic plans can be rebuilt while keeping earned XP.
- Per-island difficulty feedback that persists and adjusts later practice. Related-skill suggestions explain the connection and can open or create the suggested island.
- Browser-local saves, sample-world exploration, and adoption with creator attribution and fresh progress.

## Verified current state

All 44 Node tests pass. Desktop and mobile Chrome checks with a simulated model verified the colours and landmarks of seven newly created islands before and after reload. Earlier browser checks covered inactivity, demotion, easier exercises, saving, and maintenance at level 10. A prior real Nano run took 15.5 seconds to write an exercise with the model loaded.

Vercel built the progression preview. Vercel Authentication blocked direct access from the isolated test browser, so the progression journey was verified against the local build.

## Next workstream

Benchmark a hosted text model against the five-second target and extend tailored generation to unsupported browsers and devices. Then review Antigravity’s shared ocean Explore integration (`worldhopper/social`, `e52fb84`) against the updated learning branch. Verify the fixture experience before enabling opt-in public data.
