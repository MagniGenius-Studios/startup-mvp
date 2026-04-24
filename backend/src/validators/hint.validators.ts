import { z } from 'zod';

import { supportedLanguageSchema } from './language.validators';

// Hint request schema: problem id + current code snapshot + language.
export const hintSchema = z.object({
  problemId: z
    .string({ required_error: 'Problem ID is required' })
    .uuid('Problem ID must be a valid UUID'),
  code: z
    .string({ required_error: 'Code is required' })
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code must be at most 50,000 characters'),
  language: supportedLanguageSchema,
});

export type HintInput = z.infer<typeof hintSchema>;
