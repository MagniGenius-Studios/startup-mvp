import { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';

// Converts unmatched routes into a consistent 404 AppError.
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError('Resource not found', 404));
};
