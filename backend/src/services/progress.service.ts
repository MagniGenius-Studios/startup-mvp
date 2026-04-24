import { getPrismaClient } from '@config/db';
import { Prisma } from '@prisma/client';
import { isMissingProblemProgressStorageError } from '@utils/dbError';

// Progress service: stores and reads per-problem state for each user.
export const PROBLEM_PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type ProblemProgressStatus =
  (typeof PROBLEM_PROGRESS_STATUS)[keyof typeof PROBLEM_PROGRESS_STATUS];

export interface ProblemProgressDto {
  problemId: string;
  status: ProblemProgressStatus;
}

export const upsertProblemProgress = async (
  userId: string,
  problemId: string,
  isCorrect: boolean,
): Promise<void> => {
  const prisma = getPrismaClient();
  const targetStatus: ProblemProgressStatus = isCorrect
    ? PROBLEM_PROGRESS_STATUS.COMPLETED
    : PROBLEM_PROGRESS_STATUS.IN_PROGRESS;

  try {
    // Fetch existing row to decide whether to promote or keep COMPLETED.
    const existing = await prisma.problemProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
      select: { status: true },
    });

    const resolvedStatus: ProblemProgressStatus =
      existing?.status === PROBLEM_PROGRESS_STATUS.COMPLETED
        ? PROBLEM_PROGRESS_STATUS.COMPLETED
        : targetStatus;

    await prisma.problemProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: {
        userId,
        problemId,
        status: resolvedStatus,
      },
      update: {
        status: resolvedStatus,
      },
    });
  } catch (error) {
    if (isMissingProblemProgressStorageError(error)) {
      // Older local DBs may not have this table yet.
      return;
    }
    throw error;
  }
};

const listProblemProgressFromSubmissions = async (
  userId: string,
): Promise<ProblemProgressDto[]> => {
  const prisma = getPrismaClient();
  // Fallback summary from submissions when ProblemProgress table is unavailable.
  const fallbackProgress = await prisma.$queryRaw<Array<{ problemId: string; status: string }>>(
    Prisma.sql`
      SELECT
        s."problemId",
        CASE
          WHEN BOOL_OR(COALESCE(s."score", 0) > 0) THEN ${PROBLEM_PROGRESS_STATUS.COMPLETED}
          ELSE ${PROBLEM_PROGRESS_STATUS.IN_PROGRESS}
        END AS "status"
      FROM "Submission" s
      WHERE s."userId" = ${userId}
      GROUP BY s."problemId"
    `,
  );

  return fallbackProgress.map((item) => ({
    problemId: item.problemId,
    status: item.status as ProblemProgressStatus,
  }));
};

export const listProblemProgress = async (
  userId: string,
): Promise<ProblemProgressDto[]> => {
  const prisma = getPrismaClient();

  let progress: Array<{ problemId: string; status: string }> = [];
  try {
    // Read user progress rows directly from dedicated progress table.
    progress = await prisma.$queryRaw<Array<{ problemId: string; status: string }>>(
      Prisma.sql`
        SELECT pp."problemId", pp."status"
        FROM "ProblemProgress" pp
        WHERE pp."userId" = ${userId}
      `,
    );
  } catch (error) {
    if (!isMissingProblemProgressStorageError(error)) {
      throw error;
    }
    return listProblemProgressFromSubmissions(userId);
  }

  return progress.map((item) => ({
    problemId: item.problemId,
    status: item.status as ProblemProgressStatus,
  }));
};
