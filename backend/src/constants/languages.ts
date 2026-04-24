// Shared language metadata used by backend validation and frontend payloads.
export const SUPPORTED_LANGUAGES = ['python', 'cpp', 'java', 'javascript', 'go'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_ALIAS_MAP: Record<string, SupportedLanguage> = {
  python: 'python',
  py: 'python',
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  go: 'go',
  golang: 'go',
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  go: 'Go',
};

export const normalizeLanguage = (value: string): SupportedLanguage | null => {
  // Collapses aliases like `py`, `js`, and `c++` into canonical slugs.
  const normalized = value.trim().toLowerCase();
  return LANGUAGE_ALIAS_MAP[normalized] ?? null;
};

export const isSupportedLanguage = (value: string): value is SupportedLanguage => {
  return normalizeLanguage(value) !== null;
};
