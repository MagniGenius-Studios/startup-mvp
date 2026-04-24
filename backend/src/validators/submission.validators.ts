import { z } from 'zod';

import { supportedLanguageSchema } from './language.validators';

// Submission schemas for code submission payloads and URL params.
export const submitCodeSchema = z.object({
    problemId: z
        .string({ required_error: 'Problem ID is required' })
        .uuid('Problem ID must be a valid UUID'),
    code: z
        .string({ required_error: 'Code is required' })
        .min(1, 'Code cannot be empty')
        .max(50000, 'Code must be at most 50,000 characters'),
    language: supportedLanguageSchema,
    intent: z
        .string()
        .max(2000, 'Intent must be at most 2,000 characters')
        .optional(),
});

export const submissionProblemParamSchema = z.object({
    problemId: z
        .string({ required_error: 'Problem ID is required' })
        .uuid('Problem ID must be a valid UUID'),
});

export type SubmitCodeInput = z.infer<typeof submitCodeSchema>;
export type SubmissionProblemParamInput = z.infer<typeof submissionProblemParamSchema>;
