'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/auth'
import { fetchProblem, fetchProblemsByCategory } from '@/lib/problems'
import { dispatchProgressUpdated } from '@/lib/progressEvents'
import { fetchProblemProgress, type ProblemProgressStatus } from '@/lib/progress'
import { fetchLatestSubmission, fetchSubmissionHistory, submitCode } from '@/lib/submissions'

import type { CategoryProblemSummary, ProblemDetail } from '@/lib/problems'
import type { SubmissionHistoryItem } from '@/lib/submissions'

import WorkspaceLayout from '../components/WorkspaceLayout'
import ProblemPanel from '../components/ProblemPanel'
import CodeEditorPanel, { LANGUAGES, type Language } from '../components/CodeEditorPanel'
import SubmitBar, { type SubmissionStatus } from '../components/SubmitBar'
import MentorPanel from '../components/MentorPanel'

interface WorkspacePageClientProps {
  problemId: string
}

const toProgressMap = (items: Array<{ problemId: string; status: ProblemProgressStatus }>) => {
  return items.reduce<Record<string, ProblemProgressStatus>>((acc, item) => {
    acc[item.problemId] = item.status
    return acc
  }, {})
}


const isLanguage = (value: string): value is Language => {
  return LANGUAGES.includes(value as Language)
}


export default function WorkspacePageClient({ problemId }: WorkspacePageClientProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [problems, setProblems] = useState<CategoryProblemSummary[]>([])
  const [problemProgressById, setProblemProgressById] = useState<Record<string, ProblemProgressStatus>>({})
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(null)
  const [problemLoading, setProblemLoading] = useState(true)
  const [problemError, setProblemError] = useState('')

  const [code, setCode] = useState<string>('')
  const [language, setLanguage] = useState<Language>('python')

  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [mistake, setMistake] = useState<string>('')
  const [concept, setConcept] = useState<string>('')
  const [improvement, setImprovement] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [userOutput, setUserOutput] = useState<string | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string | null>(null)
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([])
  const [explainLoading, setExplainLoading] = useState(false)

  const submittingRef = useRef(false)
  // Monotonically increasing counter: guards against stale navigations.
  // When the user switches problems before the previous fetch completes,
  // the earlier call detects its loadId is stale and discards its results.
  const loadIdRef = useRef(0)

  const refreshProgressForCategory = useCallback(async (categoryId: string) => {
    try {
      const progressItems = await fetchProblemProgress(categoryId)
      setProblemProgressById(toProgressMap(progressItems))
    } catch {
      // Keep the workspace usable if progress refresh fails.
    }
  }, [])


  const loadProblem = useCallback(async (id: string) => {
    // Increment load counter — any in-flight fetch with an older id is stale.
    const thisLoadId = ++loadIdRef.current

    setProblemLoading(true)
    setProblemError('')
    setStatus('idle')
    setMistake('')
    setConcept('')
    setImprovement('')
    setIsCorrect(null)
    setError('')
    setUserOutput(null)
    setExpectedOutput(null)
    // NOTE: code and language are intentionally NOT reset here.
    // Clearing them would flash an empty editor while the API responds.
    // The previous code stays visible (read-only via problemLoading) until
    // the new data arrives and replaces it below.

    try {
      const problem = await fetchProblem(id)

      // Guard: if the user navigated away, discard this result.
      if (loadIdRef.current !== thisLoadId) return

      setCurrentProblem(problem)

      const [categoryData, latestSubmission, progressItems, submissionHistory] = await Promise.all([
        fetchProblemsByCategory(problem.categoryId),
        fetchLatestSubmission(problem.id).catch(() => null),
        fetchProblemProgress(problem.categoryId).catch(() => []),
        fetchSubmissionHistory(problem.id).catch(() => []),
      ])

      // Guard again after second async boundary.
      if (loadIdRef.current !== thisLoadId) return

      setProblems(categoryData.problems)
      setProblemProgressById(toProgressMap(progressItems))
      setHistory(submissionHistory)


      if (latestSubmission) {
        setCode(latestSubmission.code)
        setLanguage(isLanguage(latestSubmission.language) ? latestSubmission.language : 'python')
        setIsCorrect(latestSubmission.isCorrect)
        setStatus('done')
        setMistake(latestSubmission.mistake ?? '')
        setConcept(latestSubmission.concept ?? '')
        setImprovement(latestSubmission.improvement ?? '')
      } else {
        setCode(problem.starterCode ?? '# Write your code here\n')
        setLanguage('python')
      }
    } catch (err) {
      // Only apply error state if this is still the current load.
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
  }, [])

  useEffect(() => {
    void loadProblem(problemId)
  }, [loadProblem, problemId])

  const handleSelectProblem = useCallback(
    (id: string) => {
      if (!id || id === problemId) return
      router.push(`/workspace/${id}`)
    },
    [problemId, router],
  )

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || !currentProblem) return
    submittingRef.current = true

    setStatus('loading')
    setMistake('')
    setConcept('')
    setImprovement('')
    setIsCorrect(null)
    setError('')
    setUserOutput(null)
    setExpectedOutput(null)

    try {
      const result = await submitCode({
        problemId: currentProblem.id,
        code,
        language,
      })

      setIsCorrect(result.isCorrect)
      setMistake(result.mistake ?? '')
      setConcept(result.concept ?? '')
      setImprovement(result.improvement ?? '')
      setUserOutput(result.userOutput ?? null)
      setExpectedOutput(result.expectedOutput ?? null)
      setStatus('done')

      setProblemProgressById((previous) => {
        const existing = previous[currentProblem.id]
        const optimisticStatus: ProblemProgressStatus = result.isCorrect
          ? 'COMPLETED'
          : existing === 'COMPLETED'
            ? 'COMPLETED'
            : 'IN_PROGRESS'

        return {
          ...previous,
          [currentProblem.id]: optimisticStatus,
        }
      })

      await refreshProgressForCategory(currentProblem.categoryId)

      // Refresh history after submission
      fetchSubmissionHistory(currentProblem.id)
        .then(setHistory)
        .catch(() => undefined)

      dispatchProgressUpdated({
        problemId: currentProblem.id,
        languageId: currentProblem.languageId,
        categoryId: currentProblem.categoryId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setStatus('error')
    } finally {
      submittingRef.current = false
    }
  }, [code, currentProblem, language, refreshProgressForCategory])

  const handleExplain = useCallback(async () => {
    if (submittingRef.current || !currentProblem) return
    submittingRef.current = true
    setExplainLoading(true)
    setMistake('')
    setConcept('')
    setImprovement('')
    setError('')

    try {
      const result = await submitCode({
        problemId: currentProblem.id,
        code,
        language,
      })

      setIsCorrect(result.isCorrect)
      setMistake(result.mistake ?? '')
      setConcept(result.concept ?? '')
      setImprovement(result.improvement ?? '')
      setUserOutput(result.userOutput ?? null)
      setExpectedOutput(result.expectedOutput ?? null)
      setStatus('done')

      // Refresh history after explain
      fetchSubmissionHistory(currentProblem.id)
        .then(setHistory)
        .catch(() => undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setStatus('error')
    } finally {
      submittingRef.current = false
      setExplainLoading(false)
    }
  }, [code, currentProblem, language])

  const handleLoadHistoryCode = useCallback((historicalCode: string) => {
    setCode(historicalCode)
  }, [])

  const handleLanguageChange = useCallback(
    (newLang: Language) => {
      setLanguage(newLang)
      if (currentProblem?.starterCode) {
        setCode(currentProblem.starterCode)
      }
    },
    [currentProblem],
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void handleSubmit()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit])

  useEffect(() => {
    if (!currentProblem) {
      return
    }

    const handleFocusRefresh = () => {
      void refreshProgressForCategory(currentProblem.categoryId)
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
  }, [currentProblem, refreshProgressForCategory])

  const [showMentor, setShowMentor] = useState(true)

  const isReadOnly = status === 'loading'

  return (
    <WorkspaceLayout
      header={{
        currentTitle: currentProblem?.title,
        languageName: currentProblem?.languageName,
      }}
      showMentor={showMentor}
      onToggleMentor={() => setShowMentor((prev) => !prev)}
      problemPanel={
        <ProblemPanel
          problems={problems}
          problemProgressById={problemProgressById}
          currentProblem={currentProblem}
          onSelectProblem={handleSelectProblem}
          loading={problemLoading}
        />
      }
      editorPanel={
        <>
          {problemError ? (
            <div className="border-b border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {problemError}
            </div>
          ) : null}

          <CodeEditorPanel
            code={code}
            language={language}
            readOnly={isReadOnly || !currentProblem}
            onCodeChange={setCode}
            onLanguageChange={handleLanguageChange}
          />
          <SubmitBar status={status} onSubmit={handleSubmit} onExplain={handleExplain} explainLoading={explainLoading} />
        </>
      }
      mentorPanel={
        <MentorPanel
          isOpen={showMentor}
          onClose={() => setShowMentor(false)}
          status={status}
          isCorrect={isCorrect}
          mistake={mistake}
          concept={concept}
          improvement={improvement}
          error={error}
          userOutput={userOutput}
          expectedOutput={expectedOutput}
          history={history}
          onLoadHistoryCode={handleLoadHistoryCode}
        />
      }
    />
  )
}
