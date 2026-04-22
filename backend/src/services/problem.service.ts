import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';

export interface ProblemSummaryDto {
  id: string;
  title: string;
  difficulty: string | null;
  position: number;
  languageId: string;
  languageName: string;
  categoryId: string;
  categoryName: string;
}

export interface CategoryInfoDto {
  id: string;
  name: string;
  languageId: string;
}

export interface ProblemCategoryListResult {
  category: CategoryInfoDto;
  problems: Array<{
    id: string;
    title: string;
    difficulty: string | null;
    position: number;
  }>;
}

export interface ProblemDetailDto {
  id: string;
  title: string;
  description: string | null;
  starterCode: string | null;
  difficulty: string | null;
  position: number;
  languageId: string;
  languageName: string;
  categoryId: string;
  categoryName: string;
  concepts: string[];
}

export const listProblems = async (): Promise<ProblemSummaryDto[]> => {
  const prisma = getPrismaClient();

  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      difficulty: true,
      position: true,
      languageId: true,
      categoryId: true,
      language: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { language: { name: 'asc' } },
      { category: { name: 'asc' } },
      { position: 'asc' },
    ],
  });

  return problems.map((problem) => ({
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    position: problem.position,
    languageId: problem.languageId,
    languageName: problem.language.name,
    categoryId: problem.categoryId,
    categoryName: problem.category.name,
  }));
};

export const listProblemsByCategory = async (categoryId: string): Promise<ProblemCategoryListResult> => {
  const prisma = getPrismaClient();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      languageId: true,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const problems = await prisma.problem.findMany({
    where: { categoryId },
    select: {
      id: true,
      title: true,
      difficulty: true,
      position: true,
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });

  return {
    category,
    problems,
  };
};

export const getProblemById = async (id: string): Promise<ProblemDetailDto> => {
  const prisma = getPrismaClient();

  const problem = await prisma.problem.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      starterCode: true,
      difficulty: true,
      position: true,
      languageId: true,
      categoryId: true,
      language: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      concepts: {
        select: {
          concept: { select: { name: true } },
        },
      },
    },
  });

  if (!problem) {
    throw new AppError('Problem not found', 404);
  }

  return {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    starterCode: problem.starterCode,
    difficulty: problem.difficulty,
    position: problem.position,
    languageId: problem.languageId,
    languageName: problem.language.name,
    categoryId: problem.categoryId,
    categoryName: problem.category.name,
    concepts: problem.concepts.map((c) => c.concept.name),
  };
};
