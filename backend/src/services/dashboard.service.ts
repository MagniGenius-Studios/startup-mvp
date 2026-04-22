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

/**
 * Count completed and in-progress problems for a user.
 *
 * Uses two simple COUNT queries on ProblemProgress with the
 * @@index([userId, status]) composite index — O(user_rows), not O(all_submissions).
 */
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

/**
 * Fetch the 10 most recent COMPLETED submissions for a user, joined with Problem title.
 *
 * Only completed submissions are included — DRAFT/ANALYZING/ERROR are excluded
 * so the dashboard shows only finalized results.
 */
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
        createdAt: true,
        problem: {
          select: {
            title: true,
            languageId: true,
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
      languageId: submission.problem?.languageId ?? null,
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

/**
 * Build per-language progress by combining:
 * 1. All languages + their total problem counts (Language → Problem count)
 * 2. Per-user progress from ProblemProgress (joined to Problem for languageId)
 *
 * The join from ProblemProgress → Problem → Language is done via Prisma's
 * relational findMany rather than raw SQL CTEs.
 */
const buildLanguageProgress = async (
  userId: string,
): Promise<DashboardLanguageProgressDto[]> => {
  const prisma = getPrismaClient();

  try {
    // 1. Get all languages with their total problem counts
    const languages = await prisma.language.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { problems: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // 2. Get user's progress records grouped by language
    const userProgress = await prisma.problemProgress.findMany({
      where: { userId },
      select: {
        status: true,
        problem: {
          select: { languageId: true },
        },
      },
    });

    // 3. Aggregate counts per language
    const countsByLanguage = new Map<string, { completed: number; inProgress: number }>();
    for (const record of userProgress) {
      const langId = record.problem.languageId;
      const existing = countsByLanguage.get(langId) ?? { completed: 0, inProgress: 0 };

      if (record.status === PROBLEM_PROGRESS_STATUS.COMPLETED) {
        existing.completed += 1;
      } else if (record.status === PROBLEM_PROGRESS_STATUS.IN_PROGRESS) {
        existing.inProgress += 1;
      }

      countsByLanguage.set(langId, existing);
    }

    // 4. Build the DTO array
    return languages.map((language) => {
      const counts = countsByLanguage.get(language.id);
      const totalProblems = language._count.problems;
      const completedProblems = counts?.completed ?? 0;
      const inProgressProblems = counts?.inProgress ?? 0;
      const completionPercent =
        totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

      let statusLabel: ProblemProgressStatus = PROBLEM_PROGRESS_STATUS.NOT_STARTED;
      if (totalProblems > 0 && completedProblems === totalProblems) {
        statusLabel = PROBLEM_PROGRESS_STATUS.COMPLETED;
      } else if (completedProblems > 0 || inProgressProblems > 0) {
        statusLabel = PROBLEM_PROGRESS_STATUS.IN_PROGRESS;
      }

      return {
        languageId: language.id,
        languageName: language.name,
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
