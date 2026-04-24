'use client'

import { useCallback, useRef, useState } from 'react'

import { explainCode, type CodeExplanationResponse } from '@/lib/explanations'
import { dispatchProgressUpdated } from '@/lib/progressEvents'
import type { ProblemDetail } from '@/lib/problems'
import { submitCode } from '@/lib/submissions'

import type { Language } from '@/lib/languages'
import type { LatestSubmission } from '@/lib/submissions'

type SubmissionStatus = 'idle' | 'loading' | 'done' | 'error'

interface SubmitOptions {
  currentProblem: ProblemDetail | null
  activeCode: string
  language: Language
  applyOptimisticProgress: (problemId: string, isCorrect: boolean) => void
  refreshProgress: () => Promise<void>
  refreshHistory: (problemId: string) => Promise<void>
}

interface ExplainOptions {
  currentProblem: ProblemDetail | null
  activeCode: string
  language: Language
}

// Workspace action hook: submit and explain flows + mentor state.
export function useWorkspaceActions() {
  // Submission result + mentor card state.
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [mistake, setMistake] = useState<string>('')
  const [concept, setConcept] = useState<string>('')
  const [improvement, setImprovement] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [userOutput, setUserOutput] = useState<string | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string | null>(null)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explanation, setExplanation] = useState<CodeExplanationResponse | null>(null)
  const [explainError, setExplainError] = useState('')
  const [hasRequestedExplanation, setHasRequestedExplanation] = useState(false)

  // Shared guard to prevent duplicate submit/explain requests.
  const submittingRef = useRef(false)

  // Clears explain panel state when code/problem context changes.
  const clearExplanation = useCallback(() => {
    setExplanation(null)
    setExplainError('')
    setHasRequestedExplanation(false)
  }, [])

  const resetForProblemLoad = useCallback(() => {
    // Reset all feedback when switching to another problem.
    setStatus('idle')
    setMistake('')
    setConcept('')
    setImprovement('')
    setIsCorrect(null)
    setError('')
    setUserOutput(null)
    setExpectedOutput(null)
    clearExplanation()
  }, [clearExplanation])

  const hydrateFromLatestSubmission = useCallback((latestSubmission: LatestSubmission | null) => {
    if (!latestSubmission) {
      return
    }

    setIsCorrect(latestSubmission.isCorrect)
    setStatus('done')
    setMistake(latestSubmission.mistake ?? '')
    setConcept(latestSubmission.concept ?? '')
    setImprovement(latestSubmission.improvement ?? '')
  }, [])

  const submit = useCallback(async ({
    currentProblem,
    activeCode,
    language,
    applyOptimisticProgress,
    refreshProgress,
    refreshHistory,
  }: SubmitOptions) => {
    if (submittingRef.current || !currentProblem) return
    submittingRef.current = true

    // Start fresh state for each submission attempt.
    setStatus('loading')
    setMistake('')
    setConcept('')
    setImprovement('')
    setIsCorrect(null)
    setError('')
    setUserOutput(null)
    setExpectedOutput(null)

    try {
      // API call: submit code for evaluation + structured mentor response.
      const result = await submitCode({
        problemId: currentProblem.id,
        code: activeCode,
        language,
      })

      setIsCorrect(result.isCorrect)
      setMistake(result.mistake ?? '')
      setConcept(result.concept ?? '')
      setImprovement(result.improvement ?? '')
      setUserOutput(result.userOutput ?? null)
      setExpectedOutput(result.expectedOutput ?? null)
      setStatus('done')

      // Optimistic update keeps the left panel responsive.
      applyOptimisticProgress(currentProblem.id, result.isCorrect)
      await refreshProgress()
      void refreshHistory(currentProblem.id)

      // Broadcast so dashboard/learn pages can refresh progress badges.
      dispatchProgressUpdated({
        problemId: currentProblem.id,
        language,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setStatus('error')
    } finally {
      submittingRef.current = false
    }
  }, [])

  const explain = useCallback(async ({
    currentProblem,
    activeCode,
    language,
  }: ExplainOptions) => {
    if (submittingRef.current || !currentProblem || !activeCode.trim()) return
    submittingRef.current = true

    // Keep explanation status separate from submission status.
    setExplainLoading(true)
    setExplainError('')
    setHasRequestedExplanation(true)

    try {
      // API call: returns steps + summary + complexity.
      const result = await explainCode({
        problemId: currentProblem.id,
        code: activeCode,
        language,
      })
      setExplanation(result)
    } catch (err) {
      setExplanation(null)
      setExplainError(err instanceof Error ? err.message : 'Code explanation unavailable')
    } finally {
      submittingRef.current = false
      setExplainLoading(false)
    }
  }, [])

  return {
    status,
    mistake,
    concept,
    improvement,
    isCorrect,
    error,
    userOutput,
    expectedOutput,
    explainLoading,
    explanation,
    explainError,
    hasRequestedExplanation,
    clearExplanation,
    resetForProblemLoad,
    hydrateFromLatestSubmission,
    submit,
    explain,
  }
}
