import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/encryption';
import { Octokit } from '@octokit/rest';
import { detectPointsFromComments } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { repository, startDate, endDate } = await request.json();

    if (!repository || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's GitHub token from database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json(
        { error: 'GitHub account not connected' },
        { status: 400 }
      );
    }

    // Decrypt the token
    const token = decryptToken(account.access_token);

    // Fetch PRs from GitHub
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Invalid repository format. Use: owner/repo' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: token });

    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
    });

    // Filter by merge date
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
          const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
            per_page: 100,
          });

          const commentBodies = comments.map((c) => c.body || '');
          if (pr.body) {
            commentBodies.unshift(pr.body);
          }

          detectedPoints = detectPointsFromComments(commentBodies);
        } catch (error) {
          console.warn(`Failed to fetch comments for PR #${pr.number}:`, error);
        }

        // Check if we have saved data for this PR
        const savedPR = await prisma.pullRequestData.findUnique({
          where: {
            userId_repository_prNumber: {
              userId: session.user.id!,
              repository,
              prNumber: pr.number,
            },
          },
        });

        return {
          number: pr.number,
          title: pr.title,
          author: pr.user?.login || 'unknown',
          authorAvatar: pr.user?.avatar_url || '',
          mergedAt: pr.merged_at || '',
          url: pr.html_url,
          detectedPoints,
          assignedPoints: savedPR?.assignedPoints ?? detectedPoints ?? 0,
          excluded: savedPR?.excluded ?? false,
        };
      })
    );

    return NextResponse.json({
      prs: prsWithPoints.sort(
        (a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime()
      ),
    });
  } catch (error: unknown) {
    console.error('Error fetching PRs:', error);

    const apiError = error as { status?: number; message?: string };

    if (apiError.status === 401) {
      return NextResponse.json(
        { error: 'Invalid GitHub token' },
        { status: 401 }
      );
    }

    if (apiError.status === 404) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch PRs' },
      { status: 500 }
    );
  }
}
