import { requireUser } from '@middleware/auth';
import * as progressService from '@services/progress.service';
import { Request, Response } from 'express';

// Handles GET /progress/problems -> user-level status for each attempted problem.
export const listProblemProgress = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const progress = await progressService.listProblemProgress(user.id);
  res.status(200).json({ progress });
};
