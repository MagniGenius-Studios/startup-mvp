import { api } from './api'
import type { Language } from './languages'

// ─── Types ──────────────────────────────────────────────────────

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

// ─── API Calls ──────────────────────────────────────────────────

export async function submitCode(params: SubmitCodeParams): Promise<SubmitCodeResponse> {
  const { data } = await api.post<SubmitCodeResponse>(
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
  const { data } = await api.get<{ submission: LatestSubmission | null }>(`/submissions/${problemId}`)
  return data.submission
}

export async function fetchSubmissionHistory(problemId: string): Promise<SubmissionHistoryItem[]> {
  const { data } = await api.get<{ history: SubmissionHistoryItem[] }>(`/submissions/history/${problemId}`)
  return data.history
}
