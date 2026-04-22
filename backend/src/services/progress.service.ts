import { getPrismaClient } from '@config/db';
import { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError';
import { isMissingProblemProgressStorageError } from '@utils/dbError';

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
      return;
    }
    throw error;
  }
};

const listProblemProgressByCategoryFromSubmissions = async (
  userId: string,
  categoryId: string,
): Promise<ProblemProgressDto[]> => {
  const prisma = getPrismaClient();
  const fallbackProgress = await prisma.$queryRaw<Array<{ problemId: string; status: string }>>(
    Prisma.sql`
      SELECT
        s."problemId",
        CASE
          WHEN BOOL_OR(COALESCE(s."score", 0) > 0) THEN ${PROBLEM_PROGRESS_STATUS.COMPLETED}
          ELSE ${PROBLEM_PROGRESS_STATUS.IN_PROGRESS}
        END AS "status"
      FROM "Submission" s
      INNER JOIN "Problem" p ON p."id" = s."problemId"
      WHERE s."userId" = ${userId} AND p."categoryId" = ${categoryId}
      GROUP BY s."problemId"
    `,
  );

  return fallbackProgress.map((item) => ({
    problemId: item.problemId,
    status: item.status as ProblemProgressStatus,
  }));
};

export const listProblemProgressByCategory = async (
  userId: string,
  categoryId: string,
): Promise<ProblemProgressDto[]> => {
  const prisma = getPrismaClient();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  let progress: Array<{ problemId: string; status: string }> = [];
  try {
    progress = await prisma.$queryRaw<Array<{ problemId: string; status: string }>>(
      Prisma.sql`
        SELECT pp."problemId", pp."status"
        FROM "ProblemProgress" pp
        INNER JOIN "Problem" p ON p."id" = pp."problemId"
        WHERE pp."userId" = ${userId} AND p."categoryId" = ${categoryId}
      `,
    );
  } catch (error) {
    if (!isMissingProblemProgressStorageError(error)) {
      throw error;
    }
    return listProblemProgressByCategoryFromSubmissions(userId, categoryId);
  }

  return progress.map((item) => ({
    problemId: item.problemId,
    status: item.status as ProblemProgressStatus,
  }));
};
