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
    const { repository, repositories, contributors, startDate, endDate } =
      await request.json();

    const repoList: string[] = Array.isArray(repositories)
      ? repositories
      : repository
        ? [repository]
        : [];

    if (repoList.length === 0 || !startDate || !endDate) {
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

    const contributorSet = new Set(
      (Array.isArray(contributors) ? contributors : [])
        .map((entry: string) => entry.toLowerCase())
        .filter(Boolean)
    );

    const octokit = new Octokit({ auth: token });

    const prsWithPoints = (
      await Promise.all(
        repoList.map(async (repoEntry) => {
          const [owner, repo] = repoEntry.split('/');
          if (!owner || !repo) {
            throw new Error(`Invalid repository format: ${repoEntry}`);
          }

          // Use search API to find all merged PRs in the date range
          const query = `repo:${owner}/${repo} is:pr is:merged merged:${startDate}..${endDate}`;
          const mergedPRs: { number: number; title: string; login: string; avatar: string; merged_at: string; html_url: string; body: string | null }[] = [];

          let page = 1;
          while (true) {
            const { data } = await octokit.search.issuesAndPullRequests({
              q: query,
              per_page: 100,
              page,
              sort: 'updated',
              order: 'desc',
            });

            for (const item of data.items) {
              const author = item.user?.login?.toLowerCase() ?? '';
              if (contributorSet.size > 0 && !contributorSet.has(author)) continue;

              mergedPRs.push({
                number: item.number,
                title: item.title,
                login: item.user?.login || 'unknown',
                avatar: item.user?.avatar_url || '',
                merged_at: (item.pull_request as { merged_at?: string })?.merged_at || '',
                html_url: item.html_url,
                body: item.body ?? null,
              });
            }

            if (mergedPRs.length >= data.total_count || data.items.length < 100) break;
            page++;
          }

          return Promise.all(
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
                console.warn(
                  `Failed to fetch comments for PR #${pr.number} in ${repoEntry}:`,
                  error
                );
              }

              const savedPR = await prisma.pullRequestData.findUnique({
                where: {
                  userId_repository_prNumber: {
                    userId: session.user.id!,
                    repository: repoEntry,
                    prNumber: pr.number,
                  },
                },
              });

              return {
                repository: repoEntry,
                number: pr.number,
                title: pr.title,
                author: pr.login,
                authorAvatar: pr.avatar,
                mergedAt: pr.merged_at,
                url: pr.html_url,
                detectedPoints,
                assignedPoints: savedPR?.assignedPoints ?? detectedPoints ?? 0,
                excluded: savedPR?.excluded ?? false,
              };
            })
          );
        })
      )
    ).flat();

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
