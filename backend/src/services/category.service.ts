import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';

export interface CategoryDto {
  id: string;
  name: string;
  problemCount: number;
}

export const listCategoriesByLanguage = async (languageId: string): Promise<CategoryDto[]> => {
  const prisma = getPrismaClient();

  const language = await prisma.language.findUnique({
    where: { id: languageId },
    select: { id: true },
  });

  if (!language) {
    throw new AppError('Language not found', 404);
  }

  const categories = await prisma.category.findMany({
    where: { languageId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          problems: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    problemCount: category._count.problems,
  }));
};
