import { apiClient } from './api'
import type { Language } from './languages'

// Submission API helpers: submit code and fetch attempt history.
interface SubmitCodeParams {
  problemId: string
  code: string
  language: Language
}

export interface SubmitCodeResponse {
  submissionId: string
  isCorrect: boolean
  mistake: string
  concept: string
  improvement: string
  userOutput: string | null
  expectedOutput: string | null
}

export interface LatestSubmission {
  code: string
  language: Language
  isCorrect: boolean
  mistake: string | null
  concept: string | null
  improvement: string | null
}

export interface SubmissionHistoryItem {
  id: string
  code: string
  isCorrect: boolean
  createdAt: string
}

export async function submitCode(params: SubmitCodeParams): Promise<SubmitCodeResponse> {
  const { data } = await apiClient.post<SubmitCodeResponse>(
    '/submissions',
    params,
    {
      // LLM calls can take 10-30s; override the default 8s timeout
      timeout: 60000,
    },
  )

  return data
}

export async function fetchLatestSubmission(problemId: string): Promise<LatestSubmission | null> {
  // API call: latest completed submission for workspace hydration.
  const { data } = await apiClient.get<{ submission: LatestSubmission | null }>(
    `/submissions/${encodeURIComponent(problemId)}`,
  )
  return data.submission
}

export async function fetchSubmissionHistory(problemId: string): Promise<SubmissionHistoryItem[]> {
  // API call: recent attempts for mentor history timeline.
  const { data } = await apiClient.get<{ history: SubmissionHistoryItem[] }>(
    `/submissions/history/${encodeURIComponent(problemId)}`,
  )
  return data.history
}
