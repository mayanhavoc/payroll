import { Octokit } from '@octokit/rest';
import { PullRequest } from '@/types';

export interface FetchPRsParams {
  repository: string;
  token: string;
  startDate: string;
  endDate: string;
}

/**
 * Detect points from PR comments
 * Patterns: "points: 5", "[8 points]", "8 points", etc.
 */
export function detectPointsFromComments(comments: string[]): number | null {
  for (const comment of comments) {
    // Pattern 1: "points: 5" or "Points: 5"
    const pattern1 = /points:\s*(\d+)/i;
    const match1 = comment.match(pattern1);
    if (match1) return parseInt(match1[1], 10);

    // Pattern 2: "[5 points]" or "[5pts]"
    const pattern2 = /\[(\d+)\s*(?:points?|pts?)\]/i;
    const match2 = comment.match(pattern2);
    if (match2) return parseInt(match2[1], 10);

    // Pattern 3: "5 points" or "5 pts"
    const pattern3 = /(\d+)\s*(?:points?|pts?)/i;
    const match3 = comment.match(pattern3);
    if (match3) return parseInt(match3[1], 10);
  }
  return null;
}

/**
 * Fetch merged pull requests from GitHub
 */
export async function fetchMergedPRs({
  repository,
  token,
  startDate,
  endDate,
}: FetchPRsParams): Promise<PullRequest[]> {
  const [owner, repo] = repository.split('/');

  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use: owner/repo');
  }

  const octokit = new Octokit({ auth: token });

  try {
    // Fetch merged PRs
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
    });

    // Filter by merge date and date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    const mergedPRs = pullRequests.filter((pr) => {
      if (!pr.merged_at) return false;
      const mergedDate = new Date(pr.merged_at);
      return mergedDate >= start && mergedDate <= end;
    });

    // Fetch comments for each PR to detect points
    const prsWithPoints = await Promise.all(
      mergedPRs.map(async (pr) => {
        let detectedPoints: number | null = null;

        try {
          // Fetch PR comments
          const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
            per_page: 100,
          });

          const commentBodies = comments.map((c) => c.body || '');

          // Also check PR body
          if (pr.body) {
            commentBodies.unshift(pr.body);
          }

          detectedPoints = detectPointsFromComments(commentBodies);
        } catch (error) {
          console.warn(`Failed to fetch comments for PR #${pr.number}:`, error);
        }

        return {
          number: pr.number,
          title: pr.title,
          author: pr.user?.login || 'unknown',
          authorAvatar: pr.user?.avatar_url || '',
          mergedAt: pr.merged_at || '',
          url: pr.html_url,
          detectedPoints,
          assignedPoints: detectedPoints || 0,
          excluded: false,
        } as PullRequest;
      })
    );

    return prsWithPoints.sort((a, b) =>
      new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime()
    );
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid GitHub token. Please check your access token.');
    }
    if (error.status === 404) {
      throw new Error('Repository not found. Check the repository name and your access permissions.');
    }
    throw new Error(`Failed to fetch PRs: ${error.message}`);
  }
}
