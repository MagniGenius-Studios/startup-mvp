import { api } from './api'

// Language helpers: canonical language metadata + learning catalog requests.
export const SUPPORTED_LANGUAGES = ['python', 'cpp', 'java', 'javascript', 'go'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

const LANGUAGE_ALIAS_MAP: Record<string, Language> = {
  python: 'python',
  py: 'python',
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  go: 'go',
  golang: 'go',
}

export interface LanguageMeta {
  label: string
  monacoId: string
  extension: string
}

export interface LearningLanguage {
  slug: string
  name: string
}

export interface LearningTrack {
  id: string
  title: string
  description: string
  languageSlug: string
}

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  python: { label: 'Python', monacoId: 'python', extension: 'solution.py' },
  cpp: { label: 'C++', monacoId: 'cpp', extension: 'solution.cpp' },
  java: { label: 'Java', monacoId: 'java', extension: 'Main.java' },
  javascript: { label: 'JavaScript', monacoId: 'javascript', extension: 'solution.js' },
  go: { label: 'Go', monacoId: 'go', extension: 'main.go' },
}

export type LanguageCodeMap = Record<Language, string>

export const DEFAULT_CODE_TEMPLATES: LanguageCodeMap = {
  python: '# Write your code here\n',
  cpp: '#include <iostream>\n\nint main() {\n  // Write your code here\n  return 0;\n}\n',
  java: 'class Main {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}\n',
  javascript: '// Write your code here\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  // Write your code here\n}\n',
}

export const normalizeLanguage = (value: string | null | undefined): Language | null => {
  if (!value) {
    return null
  }

  return LANGUAGE_ALIAS_MAP[value.trim().toLowerCase()] ?? null
}

export const isLanguage = (value: string): value is Language => {
  return normalizeLanguage(value) !== null
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const resolveLanguageCodeMap = (
  rawValue: unknown,
  fallback: LanguageCodeMap = DEFAULT_CODE_TEMPLATES,
): LanguageCodeMap => {
  // Ensures editor always has starter code for each supported language.
  const resolved: LanguageCodeMap = { ...fallback }

  if (!isObjectRecord(rawValue)) {
    return resolved
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const value = rawValue[language]
    if (typeof value === 'string' && value.length > 0) {
      resolved[language] = value
    }
  }

  return resolved
}

export async function fetchLearningLanguages(): Promise<LearningLanguage[]> {
  // API call: list learnable languages for `/learn`.
  const { data } = await api.get<{ languages: LearningLanguage[] }>('/languages')
  return data.languages
}

export async function fetchTracksByLanguage(languageSlug: string): Promise<LearningTrack[]> {
  // API call: list tracks available under selected language slug.
  const { data } = await api.get<{ tracks: LearningTrack[] }>(`/tracks/${languageSlug}`)
  return data.tracks
}
