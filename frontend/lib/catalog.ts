import { api } from './api'

export interface LanguageSummary {
  id: string
  name: string
}

export interface CategorySummary {
  id: string
  name: string
  problemCount: number
}

export async function fetchLanguages(): Promise<LanguageSummary[]> {
  const { data } = await api.get<{ languages: LanguageSummary[] }>('/languages')
  return data.languages
}

export async function fetchCategoriesByLanguage(languageId: string): Promise<CategorySummary[]> {
  const { data } = await api.get<{ categories: CategorySummary[] }>(`/languages/${languageId}/categories`)
  return data.categories
}
