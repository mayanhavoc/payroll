import { PullRequest, ContributorSummary, PayrollSummary } from '@/types';

/**
 * Calculate payroll summary from pull requests
 */
export function calculateSummary(
  prs: PullRequest[],
  ratePerPoint: number
): PayrollSummary {
  const activePRs = prs.filter((pr) => !pr.excluded);

  // Group by contributor
  const contributorMap = new Map<string, ContributorSummary>();

  activePRs.forEach((pr) => {
    const existing = contributorMap.get(pr.author);
    const payout = pr.assignedPoints * ratePerPoint;

    if (existing) {
      existing.totalPoints += pr.assignedPoints;
      existing.totalPayout += payout;
      existing.prCount += 1;
      existing.prs.push(pr.number);
    } else {
      contributorMap.set(pr.author, {
        author: pr.author,
        totalPoints: pr.assignedPoints,
        totalPayout: payout,
        prCount: 1,
        prs: [pr.number],
      });
    }
  });

  const contributors = Array.from(contributorMap.values());

  return {
    totalPRs: activePRs.length,
    totalPoints: activePRs.reduce((sum, pr) => sum + pr.assignedPoints, 0),
    totalPayout: activePRs.reduce(
      (sum, pr) => sum + pr.assignedPoints * ratePerPoint,
      0
    ),
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
