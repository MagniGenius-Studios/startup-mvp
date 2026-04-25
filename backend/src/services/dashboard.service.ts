import { Prisma } from '@prisma/client';

import { getPrismaClient } from '../config/db';
import { isMissingProblemProgressStorageError } from '../utils/dbError';
import { type ConceptMasteryDto, getRecommendedProblems, getWeakConcepts, type RecommendedProblemDto } from './concept.service';
import { PROBLEM_PROGRESS_STATUS, type ProblemProgressStatus } from './progress.service';
import { getStreak } from './streak.service';

// Dashboard service: aggregates metrics used by the learner home page.
export interface DashboardRecentSubmissionDto {
  problemId: string;
  title: string;
  languageId: string | null;
  isCorrect: boolean;
  createdAt: Date;
}

export interface DashboardDto {
  completedProblems: number;
  inProgressProblems: number;
  streak: number;
  recentSubmissions: DashboardRecentSubmissionDto[];
  languageProgress: DashboardLanguageProgressDto[];
  weakConcepts: ConceptMasteryDto[];
  recommendedProblems: RecommendedProblemDto[];
}

export interface DashboardLanguageProgressDto {
  languageId: string;
  languageName: string;
  totalProblems: number;
  completedProblems: number;
  inProgressProblems: number;
  completionPercent: number;
  statusLabel: ProblemProgressStatus;
}

const getGlobalProgressCounts = async (
  userId: string,
): Promise<{ completedProblems: number; inProgressProblems: number }> => {
  const prisma = getPrismaClient();

  try {
    // Count mastered vs currently learning problems for top-level stat cards.
    const [completedProblems, inProgressProblems] = await Promise.all([
      prisma.problemProgress.count({
        where: { userId, status: PROBLEM_PROGRESS_STATUS.COMPLETED },
      }),
      prisma.problemProgress.count({
        where: { userId, status: PROBLEM_PROGRESS_STATUS.IN_PROGRESS },
      }),
    ]);

    return { completedProblems, inProgressProblems };
  } catch (error) {
    if (isMissingProblemProgressStorageError(error)) {
      return { completedProblems: 0, inProgressProblems: 0 };
    }
    throw error;
  }
};

const listRecentSubmissions = async (userId: string): Promise<DashboardRecentSubmissionDto[]> => {
  const prisma = getPrismaClient();

  try {
    // Pull recent completed attempts for "Continue Learning" and activity feed.
    const rows = await prisma.submission.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      select: {
        problemId: true,
        isCorrect: true,
        language: true,
        createdAt: true,
        problem: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return rows.map((submission) => ({
      problemId: submission.problemId,
      title: submission.problem?.title ?? `Problem ${submission.problemId.slice(0, 8)}`,
      languageId: submission.language ?? null,
      isCorrect: submission.isCorrect,
      createdAt: submission.createdAt,
    }));
  } catch (error) {
    if (isMissingProblemProgressStorageError(error)) {
      return [];
    }
    throw error;
  }
};

const buildLanguageProgress = async (
  userId: string,
): Promise<DashboardLanguageProgressDto[]> => {
  const prisma = getPrismaClient();

  try {
    // Aggregate per-language totals and user status in one SQL query.
    const rows = await prisma.$queryRaw<
      Array<{
        languageSlug: string;
        languageName: string;
        totalProblems: number;
        completedProblems: number;
        inProgressProblems: number;
      }>
    >(Prisma.sql`
      SELECT
        l."slug" AS "languageSlug",
        l."name" AS "languageName",
        COALESCE(COUNT(DISTINCT p."id"), 0)::int AS "totalProblems",
        COALESCE(COUNT(DISTINCT CASE
          WHEN pp."status" = ${PROBLEM_PROGRESS_STATUS.COMPLETED} THEN pp."problemId"
          ELSE NULL
        END), 0)::int AS "completedProblems",
        COALESCE(COUNT(DISTINCT CASE
          WHEN pp."status" = ${PROBLEM_PROGRESS_STATUS.IN_PROGRESS} THEN pp."problemId"
          ELSE NULL
        END), 0)::int AS "inProgressProblems"
      FROM "Language" l
      LEFT JOIN "Track" t ON t."languageId" = l."id"
      LEFT JOIN "Problem" p ON p."trackId" = t."id"
      LEFT JOIN "ProblemProgress" pp
        ON pp."problemId" = p."id"
       AND pp."userId" = ${userId}
      GROUP BY l."id", l."slug", l."name", l."createdAt"
      ORDER BY l."createdAt" ASC, l."name" ASC
    `);

    return rows.map((row) => {
      const totalProblems = row.totalProblems;
      const completedProblems = Math.min(row.completedProblems, totalProblems);
      const inProgressProblems = row.inProgressProblems;

      const completionPercent =
        totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

      // Derive UI badge from aggregate counts.
      let statusLabel: ProblemProgressStatus = PROBLEM_PROGRESS_STATUS.NOT_STARTED;
      if (totalProblems > 0 && completedProblems >= totalProblems) {
        statusLabel = PROBLEM_PROGRESS_STATUS.COMPLETED;
      } else if (completedProblems > 0 || inProgressProblems > 0) {
        statusLabel = PROBLEM_PROGRESS_STATUS.IN_PROGRESS;
      }

      return {
        languageId: row.languageSlug,
        languageName: row.languageName,
        totalProblems,
        completedProblems,
        inProgressProblems,
        completionPercent,
        statusLabel,
      };
    });
  } catch (error) {
    if (isMissingProblemProgressStorageError(error)) {
      return [];
    }
    throw error;
  }
};

export const getDashboard = async (userId: string): Promise<DashboardDto> => {
  // Use allSettled so one failing widget does not break the full dashboard.
  const [globalProgressResult, recentSubmissionsResult, languageProgressResult, streakResult, weakConceptsResult, recommendedResult] =
    await Promise.allSettled([
      getGlobalProgressCounts(userId),
      listRecentSubmissions(userId),
      buildLanguageProgress(userId),
      getStreak(userId),
      getWeakConcepts(userId, 3),
      getRecommendedProblems(userId),
    ]);

  // Log failed widgets for debugging while still returning partial data.
  if (globalProgressResult.status === 'rejected') {
    console.error('[Dashboard] Global progress query failed:', globalProgressResult.reason);
  }
  if (recentSubmissionsResult.status === 'rejected') {
    console.error('[Dashboard] Recent submissions query failed:', recentSubmissionsResult.reason);
  }
  if (languageProgressResult.status === 'rejected') {
    console.error('[Dashboard] Language progress query failed:', languageProgressResult.reason);
  }
  if (streakResult.status === 'rejected') {
    console.error('[Dashboard] Streak query failed:', streakResult.reason);
  }
  if (weakConceptsResult.status === 'rejected') {
    console.error('[Dashboard] Weak concepts query failed:', weakConceptsResult.reason);
  }
  if (recommendedResult.status === 'rejected') {
    console.error('[Dashboard] Recommendations query failed:', recommendedResult.reason);
  }

  const globalProgress =
    globalProgressResult.status === 'fulfilled'
      ? globalProgressResult.value
      : { completedProblems: 0, inProgressProblems: 0 };

  const recentSubmissions =
    recentSubmissionsResult.status === 'fulfilled' ? recentSubmissionsResult.value : [];

  const languageProgress =
    languageProgressResult.status === 'fulfilled' ? languageProgressResult.value : [];

  const streak =
    streakResult.status === 'fulfilled' ? streakResult.value : 0;

  const weakConcepts =
    weakConceptsResult.status === 'fulfilled' ? weakConceptsResult.value : [];

  const recommendedProblems =
    recommendedResult.status === 'fulfilled' ? recommendedResult.value : [];

  // Final payload matches frontend DashboardData contract.
  return {
    completedProblems: globalProgress.completedProblems,
    inProgressProblems: globalProgress.inProgressProblems,
    streak,
    recentSubmissions,
    languageProgress,
    weakConcepts,
    recommendedProblems,
  };
};
