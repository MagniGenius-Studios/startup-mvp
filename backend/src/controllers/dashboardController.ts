import * as dashboardService from '@services/dashboard.service';
import { NextFunction, Request, Response } from 'express';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = await dashboardService.getDashboard(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
