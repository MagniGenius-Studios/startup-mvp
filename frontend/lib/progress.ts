import { api } from './api'

// Progress API helpers for per-problem completion status.
export type ProblemProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProblemProgressItem {
  problemId: string
  status: ProblemProgressStatus
}

export async function fetchProblemProgress(): Promise<ProblemProgressItem[]> {
  // API call: returns progress map used by learn/workspace lists.
  const { data } = await api.get<{ progress: ProblemProgressItem[] }>('/progress/problems')

  return data.progress
}
