import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@constants/languages';
import * as problemService from '@services/problem.service';
import { Request, Response } from 'express';

// Problem controller: language, track, and problem catalog endpoints.
export const listLanguages = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Primary source: language table managed from Prisma seed/migrations.
    const languages = await problemService.listLanguages();
    res.json({ languages });
  } catch {
    // Fallback keeps UI usable when DB metadata is temporarily unavailable.
    const fallbackLanguages = SUPPORTED_LANGUAGES.map((slug) => ({
      slug,
      name: LANGUAGE_LABELS[slug],
    }));
    res.json({ languages: fallbackLanguages });
  }
};

// Handles GET /tracks/:languageSlug -> list tracks for one language.
export const listTracksByLanguage = async (req: Request, res: Response): Promise<void> => {
  const tracks = await problemService.listTracksByLanguage(req.params.languageSlug);
  res.json({ tracks });
};

// Handles GET /problems/:trackId -> list problems for selected track.
export const listProblemsByTrack = async (req: Request, res: Response): Promise<void> => {
  console.log('[Problems] Track ID:', req.params.trackId);
  const problems = await problemService.listProblemsByTrack(req.params.trackId);
  console.log(
    '[Problems] Problems Returned:',
    problems.map((problem) => problem.title),
  );
  res.json({ problems });
};

// Handles GET /problems/detail/:id -> return one problem with starter code.
export const getProblem = async (req: Request, res: Response): Promise<void> => {
  const problem = await problemService.getProblemById(req.params.id);
  res.json({ problem });
};
