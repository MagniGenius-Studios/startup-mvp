import { Request, Response } from 'express';

import { requireUser } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';

// Handles GET /dashboard by aggregating progress, streak, and recommendations.
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const data = await dashboardService.getDashboard(user.id);
  res.status(200).json(data);
};
