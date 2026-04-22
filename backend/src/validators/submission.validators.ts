import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp'] as const;

export const submitCodeSchema = z.object({
    problemId: z
        .string({ required_error: 'Problem ID is required' })
        .uuid('Problem ID must be a valid UUID'),
    code: z
        .string({ required_error: 'Code is required' })
        .min(1, 'Code cannot be empty')
        .max(50000, 'Code must be at most 50,000 characters'),
    language: z.enum(SUPPORTED_LANGUAGES, {
        errorMap: () => ({
            message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
        }),
    }),
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
