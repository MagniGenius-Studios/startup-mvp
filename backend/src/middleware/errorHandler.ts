import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '@utils/AppError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  // Fallback for unexpected errors — never leak internals
  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Internal server error',
  });
};
