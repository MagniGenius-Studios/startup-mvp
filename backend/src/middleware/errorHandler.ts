import { NextFunction, Request, Response } from 'express';

interface ApiError extends Error {
  statusCode?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  void _next;
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
    },
  });
};
