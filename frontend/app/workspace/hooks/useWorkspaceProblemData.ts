'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchProblemProgress, type ProblemProgressStatus } from '@/lib/progress'
import {
  fetchProblem,
  fetchProblemsByTrack,
  type ProblemDetail,
  type ProblemSummary,
} from '@/lib/problems'
import {
  fetchLatestSubmission,
  fetchSubmissionHistory,
  type LatestSubmission,
  type SubmissionHistoryItem,
} from '@/lib/submissions'

interface UseWorkspaceProblemDataOptions {
  problemId: string
  onBeforeLoad: () => void
  onLoaded: (payload: { problem: ProblemDetail; latestSubmission: LatestSubmission | null }) => void
}

// Workspace data hook: loads problem, list, progress, and history in sync.
const toProgressMap = (items: Array<{ problemId: string; status: ProblemProgressStatus }>) => {
  return items.reduce<Record<string, ProblemProgressStatus>>((acc, item) => {
    acc[item.problemId] = item.status
    return acc
  }, {})
}

export function useWorkspaceProblemData({
  problemId,
  onBeforeLoad,
  onLoaded,
}: UseWorkspaceProblemDataOptions) {
  // Data used by problem list, active problem card, and mentor history timeline.
  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [problemProgressById, setProblemProgressById] = useState<Record<string, ProblemProgressStatus>>({})
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(null)
  const [problemLoading, setProblemLoading] = useState(true)
  const [problemError, setProblemError] = useState('')
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([])

  // Prevents race conditions when user rapidly switches problems.
  const loadIdRef = useRef(0)

  const refreshProgress = useCallback(async () => {
    try {
      // API call: refreshes completion dots in problem sidebar.
      const progressItems = await fetchProblemProgress()
      setProblemProgressById(toProgressMap(progressItems))
    } catch {
      // Keep the workspace usable if progress refresh fails.
    }
  }, [])

  const refreshHistory = useCallback(async (id: string) => {
    // API call: latest submission timeline for selected problem.
    const submissionHistory = await fetchSubmissionHistory(id).catch(() => [])
    setHistory(submissionHistory)
  }, [])

  const applyOptimisticProgress = useCallback((id: string, isCorrect: boolean) => {
    setProblemProgressById((previous) => {
      const existing = previous[id]
      // Never downgrade COMPLETED when an incorrect attempt is submitted later.
      const optimisticStatus: ProblemProgressStatus = isCorrect
        ? 'COMPLETED'
        : existing === 'COMPLETED'
          ? 'COMPLETED'
          : 'IN_PROGRESS'

      return {
        ...previous,
        [id]: optimisticStatus,
      }
    })
  }, [])

  const loadProblem = useCallback(async (id: string) => {
    const thisLoadId = ++loadIdRef.current
    // Let parent clear stale state before new data hydrates.
    onBeforeLoad()

    setProblemLoading(true)
    setProblemError('')

    try {
      // API call: primary problem payload for current route.
      const problem = await fetchProblem(id)

      if (loadIdRef.current !== thisLoadId) return

      setCurrentProblem(problem)

      // Load related datasets in parallel for faster workspace bootstrap.
      const [problemList, latestSubmission, progressItems, submissionHistory] = await Promise.all([
        fetchProblemsByTrack(problem.trackId),
        fetchLatestSubmission(problem.id).catch(() => null),
        fetchProblemProgress().catch(() => []),
        fetchSubmissionHistory(problem.id).catch(() => []),
      ])

      if (loadIdRef.current !== thisLoadId) return

      setProblems(problemList)
      setProblemProgressById(toProgressMap(progressItems))
      setHistory(submissionHistory)
      onLoaded({ problem, latestSubmission })
    } catch (err) {
      if (loadIdRef.current !== thisLoadId) return

      setCurrentProblem(null)
      setProblems([])
      setProblemProgressById({})
      setProblemError(err instanceof Error ? err.message : 'Failed to load problem.')
    } finally {
      if (loadIdRef.current === thisLoadId) {
        setProblemLoading(false)
      }
    }
  }, [onBeforeLoad, onLoaded])

  useEffect(() => {
    // Reload workspace data whenever URL problemId changes.
    void loadProblem(problemId)
  }, [loadProblem, problemId])

  useEffect(() => {
    // Refresh progress when tab regains focus or page is restored.
    const handleFocusRefresh = () => {
      void refreshProgress()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocusRefresh()
      }
    }

    window.addEventListener('focus', handleFocusRefresh)
    window.addEventListener('pageshow', handleFocusRefresh)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocusRefresh)
      window.removeEventListener('pageshow', handleFocusRefresh)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshProgress])

  return {
    problems,
    problemProgressById,
    currentProblem,
    problemLoading,
    problemError,
    history,
    refreshProgress,
    refreshHistory,
    applyOptimisticProgress,
  }
}
