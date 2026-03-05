import { PullRequest, ManualTask, ContributorSummary, PayrollSummary } from '@/types';

/**
 * Calculate payroll summary from pull requests and manual tasks
 */
export function calculateSummary(
  prs: PullRequest[],
  ratePerPoint: number,
  manualTasks: ManualTask[] = []
): PayrollSummary {
  const activePRs = prs.filter((pr) => !pr.excluded);
  const activeTasks = manualTasks.filter((t) => !t.excluded);

  // Group by contributor
  const contributorMap = new Map<string, ContributorSummary>();

  activePRs.forEach((pr) => {
    const existing = contributorMap.get(pr.author);
    const payout = pr.assignedPoints * ratePerPoint;

    if (existing) {
      existing.totalPoints += pr.assignedPoints;
      existing.totalPayout += payout;
      existing.prCount += 1;
      existing.prPoints += pr.assignedPoints;
      existing.prs.push(pr.number);
    } else {
      contributorMap.set(pr.author, {
        author: pr.author,
        totalPoints: pr.assignedPoints,
        totalPayout: payout,
        prCount: 1,
        taskCount: 0,
        prPoints: pr.assignedPoints,
        taskPoints: 0,
        prs: [pr.number],
      });
    }
  });

  activeTasks.forEach((task) => {
    const existing = contributorMap.get(task.contributor);
    const payout = task.points * ratePerPoint;

    if (existing) {
      existing.totalPoints += task.points;
      existing.totalPayout += payout;
      existing.taskCount += 1;
      existing.taskPoints += task.points;
    } else {
      contributorMap.set(task.contributor, {
        author: task.contributor,
        totalPoints: task.points,
        totalPayout: payout,
        prCount: 0,
        taskCount: 1,
        prPoints: 0,
        taskPoints: task.points,
        prs: [],
      });
    }
  });

  const contributors = Array.from(contributorMap.values());
  const prPoints = activePRs.reduce((sum, pr) => sum + pr.assignedPoints, 0);
  const taskPoints = activeTasks.reduce((sum, t) => sum + t.points, 0);

  return {
    totalPRs: activePRs.length,
    totalTasks: activeTasks.length,
    totalPoints: prPoints + taskPoints,
    totalPayout: (prPoints + taskPoints) * ratePerPoint,
    prPoints,
    taskPoints,
    contributors,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(
  amount: number,
  currency: string = '₳'
): string {
  return `${amount.toLocaleString()}${currency}`;
}

/**
 * Format amount without currency symbol (for use with CurrencyAmount component)
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Validate repository format
 */
export function validateRepository(repo: string): boolean {
  return /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(repo);
}

/**
 * Validate GitHub token
 */
export function validateToken(token: string): boolean {
  return token.length >= 40;
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  return start <= end && end <= now;
}
