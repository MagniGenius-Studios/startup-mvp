import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

// Validation middleware: parse request segments with Zod before controllers run.
type RequestSegment = 'body' | 'params' | 'query';

const validate = <T>(segment: RequestSegment, schema: ZodType<T>): RequestHandler => {
  return (req, _res, next) => {
    // Replace raw request segment with strongly typed parsed value.
    (req as Record<RequestSegment, unknown>)[segment] = schema.parse(req[segment]);
    next();
  };
};

export const validateBody = <T>(schema: ZodType<T>): RequestHandler => {
  return validate('body', schema);
};

export const validateParams = <T>(schema: ZodType<T>): RequestHandler => {
  return validate('params', schema);
};

export const validateQuery = <T>(schema: ZodType<T>): RequestHandler => {
  return validate('query', schema);
};
