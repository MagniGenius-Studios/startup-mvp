import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@constants/languages';
import * as problemService from '@services/problem.service';
import { NextFunction, Request, Response } from 'express';

export const listLanguages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const languages = await problemService.listLanguages();
    res.json({ languages });
  } catch {
    const fallbackLanguages = SUPPORTED_LANGUAGES.map((slug) => ({
      slug,
      name: LANGUAGE_LABELS[slug],
    }));
    res.json({ languages: fallbackLanguages });
  }
};

export const listTracksByLanguage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tracks = await problemService.listTracksByLanguage(req.params.languageSlug);
    res.json({ tracks });
  } catch (error) {
    next(error);
  }
};

export const listProblemsByTrack = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const problems = await problemService.listProblemsByTrack(req.params.trackId);
    res.json({ problems });
  } catch (error) {
    next(error);
  }
};

export const getProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const problem = await problemService.getProblemById(req.params.id);
    res.json({ problem });
  } catch (error) {
    next(error);
  }
};
