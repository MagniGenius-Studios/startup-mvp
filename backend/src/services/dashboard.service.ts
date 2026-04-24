import { getPrismaClient } from '@config/db';
import { isMissingProblemProgressStorageError } from '@utils/dbError';

import { getWeakConcepts, getRecommendedProblems, type ConceptMasteryDto, type RecommendedProblemDto } from './concept.service';
import { PROBLEM_PROGRESS_STATUS, type ProblemProgressStatus } from './progress.service';
import { getStreak } from './streak.service';

// ─── Types ──────────────────────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────────────

const getGlobalProgressCounts = async (
  userId: string,
): Promise<{ completedProblems: number; inProgressProblems: number }> => {
  const prisma = getPrismaClient();

  try {
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
  const prisma = getPrismaClient() as any;

  try {
    const languages = await prisma.language.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
      },
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
    }) as Array<{ id: string; slug: string; name: string }>;

    return Promise.all(
      languages.map(async (language) => {
        const [totalProblems, completedProblems, inProgressProblems] = await Promise.all([
          prisma.problem.count({
            where: {
              track: {
                languageId: language.id,
              },
            },
          }),
          prisma.problemProgress.count({
            where: {
              userId,
              status: PROBLEM_PROGRESS_STATUS.COMPLETED,
              problem: {
                track: {
                  languageId: language.id,
                },
              },
            },
          }),
          prisma.problemProgress.count({
            where: {
              userId,
              status: PROBLEM_PROGRESS_STATUS.IN_PROGRESS,
              problem: {
                track: {
                  languageId: language.id,
                },
              },
            },
          }),
        ]);

        const completionPercent =
          totalProblems > 0 ? Math.round((Math.min(completedProblems, totalProblems) / totalProblems) * 100) : 0;

        let statusLabel: ProblemProgressStatus = PROBLEM_PROGRESS_STATUS.NOT_STARTED;
        if (totalProblems > 0 && completedProblems >= totalProblems) {
          statusLabel = PROBLEM_PROGRESS_STATUS.COMPLETED;
        } else if (completedProblems > 0 || inProgressProblems > 0) {
          statusLabel = PROBLEM_PROGRESS_STATUS.IN_PROGRESS;
        }

        return {
          languageId: language.slug,
          languageName: language.name,
          totalProblems,
          completedProblems: Math.min(completedProblems, totalProblems),
          inProgressProblems,
          completionPercent,
          statusLabel,
        };
      }),
    );
  } catch (error) {
    if (isMissingProblemProgressStorageError(error)) {
      return [];
    }
    throw error;
  }
};

// ─── Main Export ─────────────────────────────────────────────────

export const getDashboard = async (userId: string): Promise<DashboardDto> => {
  const [globalProgressResult, recentSubmissionsResult, languageProgressResult, streakResult, weakConceptsResult, recommendedResult] =
    await Promise.allSettled([
      getGlobalProgressCounts(userId),
      listRecentSubmissions(userId),
      buildLanguageProgress(userId),
      getStreak(userId),
      getWeakConcepts(userId, 3),
      getRecommendedProblems(userId),
    ]);

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
