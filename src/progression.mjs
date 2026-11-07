export const DAY_MS = 24 * 60 * 60 * 1000;
export const PRACTICE_GRACE_DAYS = 7;

const STAGES = [
  [0, 'Settlement', 10], [350, 'Hamlet', 25], [950, 'Village', 50],
  [2000, 'Town', 75], [3800, 'Port', 100], [6500, 'City', 150],
  [10500, 'Capital', 200], [16000, 'Metropolis', 250], [24000, 'Citadel', 300],
  [36000, 'Mastery', 400],
];

export const MAX_XP = STAGES.at(-1)[0];

export function xpForLevel(level) {
  return STAGES[level - 1][0];
}

export function getStage(xp) {
  const index = Math.max(0, STAGES.findLastIndex(([threshold]) => xp >= threshold));
  const [threshold, name] = STAGES[index];
  return { level: index + 1, name, threshold, nextThreshold: STAGES[index + 1]?.[0] ?? null };
}

export function practiceXp(xp, reward) {
  return xp + Math.min(reward, Math.max(0, MAX_XP - xp));
}

export function practiceDeadline(now) {
  return now + PRACTICE_GRACE_DAYS * DAY_MS;
}

export function maintenanceStatus(island, now = Date.now()) {
  if (!(island.xp > 0)) return null;
  const nextLossAt = Number.isFinite(island.nextXpLossAt) ? island.nextXpLossAt : practiceDeadline(now);
  const dailyLoss = STAGES[getStage(island.xp).level - 1][2];
  return { nextLossAt, xpLoss: Math.min(island.xp, dailyLoss) };
}

export function applyIslandInactivity(island, now) {
  const status = maintenanceStatus(island, now);
  if (!status) return island;
  let { nextLossAt } = status;
  let xp = island.xp;
  let overdue = Math.floor((now - nextLossAt) / DAY_MS) + 1;
  // Consume all overdue days at the current rate until the next demotion changes it.
  while (overdue > 0 && xp > 0) {
    const { level, threshold } = getStage(xp);
    const rate = STAGES[level - 1][2];
    const daysAtLevel = level === 1 ? Math.ceil(xp / rate) : Math.floor((xp - threshold) / rate) + 1;
    const days = Math.min(overdue, daysAtLevel);
    xp = Math.max(0, xp - days * rate);
    nextLossAt += days * DAY_MS;
    overdue -= days;
  }
  if (xp === island.xp && nextLossAt === island.nextXpLossAt) return island;
  return { ...island, xp, nextXpLossAt: xp > 0 ? nextLossAt : null };
}

export function levelChallenge(level) {
  if (level <= 3) return 'Practise a small part of the technique in isolation. Aim for one controlled attempt.';
  if (level <= 6) return 'Use the full technique in a familiar setting. Repeat it consistently and correct one specific mistake.';
  if (level <= 9) return 'Apply the technique with one new constraint and check whether the result still meets the same standard.';
  return 'Demonstrate the technique independently in a new situation. Compare the result against your own high standard and correct any drift.';
}
