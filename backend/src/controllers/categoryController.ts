import { NextFunction, Request, Response } from 'express';

import * as categoryService from '@services/category.service';

export const listLanguageCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await categoryService.listCategoriesByLanguage(req.params.languageId);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};
