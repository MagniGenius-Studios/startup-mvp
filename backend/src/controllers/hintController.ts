import * as hintService from '@services/hint.service';
import { NextFunction, Request, Response } from 'express';

import { hintSchema } from '../validators/hint.validators';

export const getHint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = hintSchema.safeParse(req.body);
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

    const hint = await hintService.generateHintForSubmission(parsed.data);
    res.status(200).json(hint);
  } catch (error) {
    next(error);
  }
};
