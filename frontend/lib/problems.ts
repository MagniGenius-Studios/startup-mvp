import type { LanguageCodeMap } from './languages'
import { api } from './api'

export interface ProblemSummary {
  id: string
  title: string
  difficulty: string
  position: number
}

export interface ProblemDetail {
  id: string
  title: string
  description: string
  trackId: string
  trackTitle: string
  languageSlug: string
  starterCode: LanguageCodeMap
  difficulty: string
  position: number
  concepts: string[]
}

export async function fetchProblemsByTrack(trackId: string): Promise<ProblemSummary[]> {
  const { data } = await api.get<{ problems: ProblemSummary[] }>(`/problems/${trackId}`)
  return data.problems
}

export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const { data } = await api.get<{ problem: ProblemDetail }>(`/problems/detail/${id}`)
  return data.problem
}
