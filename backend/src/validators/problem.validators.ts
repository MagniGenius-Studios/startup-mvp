import { z } from 'zod';

// Path param schemas used by track/problem catalog endpoints.
export const trackParamSchema = z.object({
  trackId: z
    .string({ required_error: 'Track ID is required' })
    .uuid('Track ID must be a valid UUID'),
});

export const problemDetailParamSchema = z.object({
  id: z
    .string({ required_error: 'Problem ID is required' })
    .uuid('Problem ID must be a valid UUID'),
});

export type TrackParamInput = z.infer<typeof trackParamSchema>;
export type ProblemDetailParamInput = z.infer<typeof problemDetailParamSchema>;
