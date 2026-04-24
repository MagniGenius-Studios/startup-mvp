import { NextFunction, Request, RequestHandler, Response } from 'express';

// Wrap async route handlers and forward rejected promises to error middleware.
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
};
