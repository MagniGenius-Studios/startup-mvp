import { apiClient } from './api'
import type { Language } from './languages'

// Explain API helper for "Explain My Code" panel.
export interface ExplainCodeParams {
  problemId: string
  code: string
  language: Language
}

export interface CodeExplanationResponse {
  steps: string[]
  summary: string
  timeComplexity: string
  spaceComplexity: string
}

export async function explainCode(params: ExplainCodeParams): Promise<CodeExplanationResponse> {
  // API call: returns step list, summary, and complexity estimates.
  const { data } = await apiClient.post<CodeExplanationResponse>('/explain', params, {
    timeout: 20000,
  })

  return data
}
