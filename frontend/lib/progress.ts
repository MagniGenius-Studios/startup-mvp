import { api } from './api'

export type ProblemProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProblemProgressItem {
  problemId: string
  status: ProblemProgressStatus
}

export async function fetchProblemProgress(): Promise<ProblemProgressItem[]> {
  const { data } = await api.get<{ progress: ProblemProgressItem[] }>('/progress/problems')

  return data.progress
}
