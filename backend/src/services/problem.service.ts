import { getPrismaClient } from '@config/db';
import {
  LANGUAGE_LABELS,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@constants/languages';
import type { Prisma } from '@prisma/client';
import { AppError } from '@utils/AppError';

export type LanguageCodeMap = Record<SupportedLanguage, string>;

export interface LanguageDto {
  slug: string;
  name: string;
}

export interface TrackSummaryDto {
  id: string;
  title: string;
  description: string;
  languageSlug: string;
}

export interface ProblemSummaryDto {
  id: string;
  title: string;
  difficulty: string;
  position: number;
}

export interface ProblemDetailDto {
  id: string;
  title: string;
  description: string;
  trackId: string;
  trackTitle: string;
  languageSlug: string;
  starterCode: LanguageCodeMap;
  difficulty: string;
  position: number;
  concepts: string[];
}

const DEFAULT_STARTER_CODE: LanguageCodeMap = {
  python: '# Write your code here\n',
  cpp: '#include <iostream>\n\nint main() {\n  // Write your code here\n  return 0;\n}\n',
  java: 'class Main {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}\n',
  javascript: '// Write your code here\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  // Write your code here\n}\n',
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const resolveCodeMap = (jsonValue: Prisma.JsonValue | null, fallback: LanguageCodeMap): LanguageCodeMap => {
  const resolved: LanguageCodeMap = { ...fallback };

  if (!jsonValue || !isObjectRecord(jsonValue)) {
    return resolved;
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const value = jsonValue[language];
    if (typeof value === 'string' && value.length > 0) {
      resolved[language] = value;
    }
  }

  return resolved;
};

const DEFAULT_LANGUAGE_LIST: LanguageDto[] = SUPPORTED_LANGUAGES.map((slug) => ({
  slug,
  name: LANGUAGE_LABELS[slug],
}));

const toSafeSlug = (value: string): string => {
  const normalized = normalizeLanguage(value);
  if (normalized) {
    return normalized;
  }

  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
};

const mergeLanguageLists = (primary: LanguageDto[], fallback: LanguageDto[]): LanguageDto[] => {
  const merged = new Map<string, LanguageDto>();

  for (const row of [...primary, ...fallback]) {
    if (!row.slug) {
      continue;
    }

    if (!merged.has(row.slug)) {
      merged.set(row.slug, row);
    }
  }

  return Array.from(merged.values());
};

const resolveLegacyStarterCode = (rawValue: unknown, languageSlug: string): LanguageCodeMap => {
  const resolvedFromMap = resolveCodeMap(rawValue as Prisma.JsonValue | null, DEFAULT_STARTER_CODE);
  const normalizedLanguage = normalizeLanguage(languageSlug);

  if (typeof rawValue === 'string' && normalizedLanguage) {
    return {
      ...resolvedFromMap,
      [normalizedLanguage]: rawValue.length > 0 ? rawValue : resolvedFromMap[normalizedLanguage],
    };
  }

  return resolvedFromMap;
};

export const listLanguages = async (): Promise<LanguageDto[]> => {
  let prisma: any;
  try {
    prisma = getPrismaClient() as any;
  } catch {
    return DEFAULT_LANGUAGE_LIST;
  }

  try {
    const rows = await prisma.language.findMany({
      select: {
        slug: true,
        name: true,
      },
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
    });

    const normalized = rows
      .map((row: { slug: string; name: string }) => ({
        slug: toSafeSlug(row.slug || row.name),
        name: row.name,
      }))
      .filter((row: LanguageDto) => row.slug.length > 0 && row.name.length > 0);

    return mergeLanguageLists(normalized, DEFAULT_LANGUAGE_LIST);
  } catch {
    try {
      const legacyRows = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT "name"
        FROM "Language"
        ORDER BY "name" ASC
      `;

      const normalizedLegacy = legacyRows
        .map((row: { name: string }) => ({
          slug: toSafeSlug(row.name),
          name: row.name,
        }))
        .filter((row: LanguageDto) => row.slug.length > 0 && row.name.length > 0);

      return mergeLanguageLists(normalizedLegacy, DEFAULT_LANGUAGE_LIST);
    } catch {
      return DEFAULT_LANGUAGE_LIST;
    }
  }
};

export const listTracksByLanguage = async (languageSlug: string): Promise<TrackSummaryDto[]> => {
  const prisma = getPrismaClient() as any;

  const normalizedSlug = normalizeLanguage(languageSlug);
  if (!normalizedSlug) {
    return [];
  }

  try {
    const language = await prisma.language.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true, slug: true },
    }) as { id: string; slug: string } | null;

    if (!language) {
      return [];
    }

    const tracks = await prisma.track.findMany({
      where: { languageId: language.id },
      select: {
        id: true,
        title: true,
        description: true,
      },
      orderBy: [{ createdAt: 'asc' }, { title: 'asc' }],
    }) as Array<{ id: string; title: string; description: string | null }>;

    return tracks.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description ?? '',
      languageSlug: language.slug,
    }));
  } catch {
    const languageName = LANGUAGE_LABELS[normalizedSlug];

    try {
      const categoryRows = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
        SELECT c."id", c."name"
        FROM "Category" c
        INNER JOIN "Language" l ON l."id" = c."languageId"
        WHERE LOWER(l."name") = LOWER(${languageName})
        ORDER BY c."name" ASC
      `;

      return categoryRows.map((row: { id: string; name: string }) => ({
        id: row.id,
        title: row.name,
        description: `${languageName} learning path`,
        languageSlug: normalizedSlug,
      }));
    } catch {
      return [];
    }
  }
};

export const listProblemsByTrack = async (trackId: string): Promise<ProblemSummaryDto[]> => {
  const prisma = getPrismaClient() as any;

  try {
    const rows = await prisma.problem.findMany({
      where: { trackId },
      select: {
        id: true,
        title: true,
        difficulty: true,
        position: true,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    }) as Array<{ id: string; title: string; difficulty: string; position: number }>;

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        difficulty: row.difficulty,
        position: row.position,
      }));
    }

    const trackExists = await prisma.track.findUnique({
      where: { id: trackId },
      select: { id: true },
    }) as { id: string } | null;

    if (trackExists) {
      return [];
    }
  } catch {
    // Fallback to legacy Category-based problems below.
  }

  try {
    const legacyRows = await prisma.$queryRaw<
      Array<{ id: string; title: string; difficulty: string | null; position: number | null }>
    >`
      SELECT p."id", p."title", p."difficulty", p."position"
      FROM "Problem" p
      WHERE p."categoryId" = ${trackId}
      ORDER BY p."position" ASC, p."createdAt" ASC
    `;

    if (legacyRows.length === 0) {
      throw new AppError('Track not found', 404);
    }

    return legacyRows.map((row: { id: string; title: string; difficulty: string | null; position: number | null }) => ({
      id: row.id,
      title: row.title,
      difficulty: row.difficulty ?? 'Easy',
      position: row.position ?? 0,
    }));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Track not found', 404);
  }
};

export const getProblemById = async (id: string): Promise<ProblemDetailDto> => {
  const prisma = getPrismaClient() as any;

  try {
    const problem = await prisma.problem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        trackId: true,
        starterCode: true,
        difficulty: true,
        position: true,
        track: {
          select: {
            title: true,
            language: {
              select: {
                slug: true,
              },
            },
          },
        },
        concepts: {
          select: {
            concept: { select: { name: true } },
          },
        },
      },
    }) as
      | {
          id: string;
          title: string;
          description: string;
          trackId: string;
          starterCode: Prisma.JsonValue | null;
          difficulty: string;
          position: number;
          track: {
            title: string;
            language: {
              slug: string;
            };
          };
          concepts: Array<{
            concept: {
              name: string;
            };
          }>;
        }
      | null;

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      trackId: problem.trackId,
      trackTitle: problem.track.title,
      languageSlug: problem.track.language.slug,
      starterCode: resolveCodeMap(problem.starterCode, DEFAULT_STARTER_CODE),
      difficulty: problem.difficulty,
      position: problem.position,
      concepts: problem.concepts.map((c) => c.concept.name),
    };
  } catch {
    const legacyRows = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        description: string | null;
        starterCode: unknown;
        difficulty: string | null;
        position: number | null;
        trackId: string | null;
        trackTitle: string | null;
        languageName: string | null;
      }>
    >`
      SELECT
        p."id",
        p."title",
        p."description",
        p."starterCode",
        p."difficulty",
        p."position",
        c."id" AS "trackId",
        c."name" AS "trackTitle",
        l."name" AS "languageName"
      FROM "Problem" p
      LEFT JOIN "Category" c ON c."id" = p."categoryId"
      LEFT JOIN "Language" l ON l."id" = p."languageId"
      WHERE p."id" = ${id}
      LIMIT 1
    `;

    const legacyProblem = legacyRows[0];
    if (!legacyProblem) {
      throw new AppError('Problem not found', 404);
    }

    const languageSlug = toSafeSlug(legacyProblem.languageName ?? 'python');

    return {
      id: legacyProblem.id,
      title: legacyProblem.title,
      description: legacyProblem.description ?? '',
      trackId: legacyProblem.trackId ?? legacyProblem.id,
      trackTitle: legacyProblem.trackTitle ?? 'Practice Path',
      languageSlug,
      starterCode: resolveLegacyStarterCode(legacyProblem.starterCode, languageSlug),
      difficulty: legacyProblem.difficulty ?? 'Easy',
      position: legacyProblem.position ?? 0,
      concepts: [],
    };
  }
};
