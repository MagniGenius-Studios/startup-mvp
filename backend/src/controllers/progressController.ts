import * as progressService from '@services/progress.service';
import { NextFunction, Request, Response } from 'express';

import { problemProgressQuerySchema } from '../validators/progress.validators';

export const listProblemProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = problemProgressQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const progress = await progressService.listProblemProgress(
      req.user.id,
    );

    res.status(200).json({ progress });
  } catch (error) {
    next(error);
  }
};
