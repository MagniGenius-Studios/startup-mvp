import { api } from './api'

export interface ProblemSummary {
  id: string
  title: string
  difficulty: string | null
  position: number
  languageId: string
  languageName: string
  categoryId: string
  categoryName: string
}

export interface CategoryProblemSummary {
  id: string
  title: string
  difficulty: string | null
  position: number
}

export interface CategoryProblemList {
  category: {
    id: string
    name: string
    languageId: string
  }
  problems: CategoryProblemSummary[]
}

export interface ProblemDetail {
  id: string
  title: string
  description: string | null
  starterCode: string | null
  difficulty: string | null
  position: number
  languageId: string
  languageName: string
  categoryId: string
  categoryName: string
  concepts: string[]
}

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const { data } = await api.get<{ problems: ProblemSummary[] }>('/problems')
  return data.problems
}

export async function fetchProblemsByCategory(categoryId: string): Promise<CategoryProblemList> {
  const { data } = await api.get<CategoryProblemList>(`/categories/${categoryId}/problems`)
  return data
}

export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const { data } = await api.get<{ problem: ProblemDetail }>(`/problems/${id}`)
  return data.problem
}
