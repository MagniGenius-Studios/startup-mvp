import { z } from 'zod';

import { supportedLanguageSchema } from './language.validators';

// Explain request schema: allows empty code but still enforces size and language.
export const explainCodeSchema = z.object({
    problemId: z
        .string({ required_error: 'Problem ID is required' })
        .uuid('Problem ID must be a valid UUID'),
    code: z
        .string({ required_error: 'Code is required' })
        .max(50000, 'Code must be at most 50,000 characters'),
    language: supportedLanguageSchema,
});

export type ExplainCodeInput = z.infer<typeof explainCodeSchema>;
