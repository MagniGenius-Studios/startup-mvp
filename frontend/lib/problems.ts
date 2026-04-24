import type { LanguageCodeMap } from './languages'
import { api } from './api'

// Problem API helpers used by learn and workspace pages.
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

function normalizeId(id: string, label: string): string {
  const normalized = id.trim()
  if (!normalized) {
    throw new Error(`${label} is required.`)
  }

  return normalized
}

export async function fetchProblemsByTrack(trackId: string): Promise<ProblemSummary[]> {
  const normalizedTrackId = normalizeId(trackId, 'Track ID')
  // API call: get ordered problem summaries for one track.
  const { data } = await api.get<{ problems: ProblemSummary[] }>(
    `/problems/${encodeURIComponent(normalizedTrackId)}`,
  )
  return data.problems
}

export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const normalizedProblemId = normalizeId(id, 'Problem ID')
  // API call: get full problem payload including starter code map.
  const { data } = await api.get<{ problem: ProblemDetail }>(
    `/problems/detail/${encodeURIComponent(normalizedProblemId)}`,
  )
  return data.problem
}
