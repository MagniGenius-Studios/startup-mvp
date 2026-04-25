import { z } from 'zod';

import { normalizeLanguage,SUPPORTED_LANGUAGES } from '../constants/languages';

// Normalizes aliases (js/c++) before enforcing allowed language values.
export const supportedLanguageSchema = z.preprocess(
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
