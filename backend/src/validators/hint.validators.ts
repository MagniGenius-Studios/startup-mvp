import { SUPPORTED_LANGUAGES, normalizeLanguage } from '@constants/languages';
import { z } from 'zod';

const languageSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value;
    }

    return normalizeLanguage(value) ?? value;
  },
  z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    }),
  }),
);

export const hintSchema = z.object({
  problemId: z
    .string({ required_error: 'Problem ID is required' })
    .uuid('Problem ID must be a valid UUID'),
  code: z
    .string({ required_error: 'Code is required' })
    .min(1, 'Code cannot be empty')
    .max(50000, 'Code must be at most 50,000 characters'),
  language: languageSchema,
});

export type HintInput = z.infer<typeof hintSchema>;
