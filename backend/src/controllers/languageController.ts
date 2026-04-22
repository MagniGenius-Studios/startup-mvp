import { NextFunction, Request, Response } from 'express';

import * as languageService from '@services/language.service';

export const listLanguages = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const languages = await languageService.listLanguages();
    res.json({ languages });
  } catch (error) {
    next(error);
  }
};
