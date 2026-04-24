import { Prisma } from '@prisma/client';

// Detects missing ProblemProgress schema pieces on older local databases.
// Lets endpoints degrade gracefully when migrations are not yet applied.
export const isMissingProblemProgressStorageError = (error: unknown): boolean => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code === 'P2021' || error.code === 'P2022') {
    return true;
  }

  if (error.code === 'P2010') {
    const dbCode = (error.meta as { code?: string } | undefined)?.code;
    return dbCode === '42P01' || dbCode === '42703';
  }

  return false;
};
