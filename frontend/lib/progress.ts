import { api } from './api'

export type ProblemProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProblemProgressItem {
  problemId: string
  status: ProblemProgressStatus
}

export async function fetchProblemProgress(categoryId: string): Promise<ProblemProgressItem[]> {
  const { data } = await api.get<{ progress: ProblemProgressItem[] }>('/progress/problems', {
    params: { categoryId },
  })

  return data.progress
}
