import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PullRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prs, repository } = (await request.json()) as {
      prs: PullRequest[];
      repository?: string;
    };

    if (!prs) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save or update each PR
    await Promise.all(
      prs.map((pr) => {
        const repo = pr.repository ?? repository;
        if (!repo) {
          throw new Error('Repository missing for PR save');
        }
        return prisma.pullRequestData.upsert({
          where: {
            userId_repository_prNumber: {
              userId: session.user.id!,
              repository: repo,
              prNumber: pr.number,
            },
          },
          update: {
            assignedPoints: pr.assignedPoints,
            excluded: pr.excluded,
          },
          create: {
            userId: session.user.id!,
            repository: repo,
            prNumber: pr.number,
            title: pr.title,
            author: pr.author,
            authorAvatar: pr.authorAvatar,
            mergedAt: pr.mergedAt,
            url: pr.url,
            detectedPoints: pr.detectedPoints,
            assignedPoints: pr.assignedPoints,
            excluded: pr.excluded,
          },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving PRs:', error);
    const apiError = error as { message?: string };
    return NextResponse.json(
      { error: apiError.message || 'Failed to save PRs' },
      { status: 500 }
    );
  }
}
