import { getPrismaClient } from '@config/db';

export interface LanguageDto {
  id: string;
  name: string;
}

export const listLanguages = async (): Promise<LanguageDto[]> => {
  const prisma = getPrismaClient();

  const languages = await prisma.language.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });

  return languages;
};
