import { NextFunction, Request, Response } from 'express';

import * as problemService from '@services/problem.service';

export const listProblems = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const problems = await problemService.listProblems();
    res.json({ problems });
  } catch (error) {
    next(error);
  }
};

export const listCategoryProblems = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await problemService.listProblemsByCategory(req.params.categoryId);
    res.json(result);
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
