import type { Prisma } from '@prisma/client';

import { getPrismaClient } from '../config/db';
import { LANGUAGE_LABELS, normalizeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../constants/languages';
import { AppError } from '../utils/AppError';

// Problem catalog service: languages, tracks, and problem detail payloads.
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
    // Keep only known language keys from persisted JSON blobs.
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

export const listLanguages = async (): Promise<LanguageDto[]> => {
  const prisma = getPrismaClient();

  try {
    // Preferred query path with explicit slug + stable ordering.
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
      // Legacy fallback supports older schemas that only exposed `name`.
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
  const prisma = getPrismaClient();

  // Reject unknown language slugs early to avoid broad queries.
  const normalizedSlug = normalizeLanguage(languageSlug);
  if (!normalizedSlug) {
    return [];
  }

  // Fetch only tracks mapped to the selected language.
  const tracks = await prisma.track.findMany({
    where: {
      language: {
        slug: normalizedSlug,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      language: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: [{ createdAt: 'asc' }, { title: 'asc' }],
  });

  return tracks.map((track) => ({
    id: track.id,
    title: track.title,
    description: track.description ?? '',
    languageSlug: track.language.slug,
  }));
};

export const listProblemsByTrack = async (trackId: string): Promise<ProblemSummaryDto[]> => {
  const prisma = getPrismaClient();

  // Guard with explicit 404 so UI can show track-level errors cleanly.
  const trackExists = await prisma.track.findUnique({
    where: { id: trackId },
    select: { id: true },
  });

  if (!trackExists) {
    throw new AppError('Track not found', 404);
  }

  // Fetch lightweight summary list sorted by author-defined position.
  const rows = await prisma.problem.findMany({
    where: { trackId },
    select: {
      id: true,
      title: true,
      difficulty: true,
      position: true,
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    difficulty: row.difficulty,
    position: row.position,
  }));
};

export const getProblemById = async (id: string): Promise<ProblemDetailDto> => {
  const prisma = getPrismaClient();

  // Load problem + track + language + concepts in one query.
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
  });

  if (!problem) {
    throw new AppError('Problem not found', 404);
  }

  // Normalize starter code so every supported language always has a template.
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
};
