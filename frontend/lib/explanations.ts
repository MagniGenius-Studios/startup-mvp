import { api } from './api'
import type { Language } from './languages'

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
  const { data } = await api.post<CodeExplanationResponse>('/explain', params, {
    timeout: 20000,
  })

  return data
}
