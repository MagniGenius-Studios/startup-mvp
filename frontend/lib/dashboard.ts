import { apiClient } from './api'

// Dashboard API contract shared between backend payload and frontend widgets.
export interface RecentSubmission {
  problemId: string
  title: string
  languageId: string | null
  isCorrect: boolean
  createdAt: string
}

export type ProgressStatusLabel = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface LanguageProgressItem {
  languageId: string
  languageName: string
  totalProblems: number
  completedProblems: number
  inProgressProblems: number
  completionPercent: number
  statusLabel: ProgressStatusLabel
}

export interface WeakConcept {
  concept: { id: string; slug: string; name: string }
  score: number
}

export interface RecommendedProblem {
  problemId: string
  title: string
  difficulty: string | null
  concepts: string[]
}

export interface DashboardData {
  completedProblems: number
  inProgressProblems: number
  streak: number
  recentSubmissions: RecentSubmission[]
  languageProgress: LanguageProgressItem[]
  weakConcepts: WeakConcept[]
  recommendedProblems: RecommendedProblem[]
}

export async function fetchDashboard(): Promise<DashboardData> {
  // API call: aggregated dashboard payload (stats + lists) in one request.
  const { data } = await apiClient.get<DashboardData>('/dashboard')
  return data
}
