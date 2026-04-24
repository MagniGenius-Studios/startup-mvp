'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { explainCode, type CodeExplanationResponse } from '@/lib/explanations'
import {
  LANGUAGE_META,
  type Language,
  type LanguageCodeMap,
  normalizeLanguage,
  resolveLanguageCodeMap,
} from '@/lib/languages'
import { fetchProblem, fetchProblemsByTrack, type ProblemDetail, type ProblemSummary } from '@/lib/problems'
import { dispatchProgressUpdated } from '@/lib/progressEvents'
import { fetchProblemProgress, type ProblemProgressStatus } from '@/lib/progress'
import { fetchLatestSubmission, fetchSubmissionHistory, submitCode } from '@/lib/submissions'

import type { SubmissionHistoryItem } from '@/lib/submissions'

import WorkspaceLayout from '../components/WorkspaceLayout'
import ProblemPanel from '../components/ProblemPanel'
import CodeEditorPanel from '../components/CodeEditorPanel'
import ExplanationPanel from '../components/ExplanationPanel'
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

export default function WorkspacePageClient({ problemId }: WorkspacePageClientProps) {
  const router = useRouter()

  const [problems, setProblems] = useState<ProblemSummary[]>([])
  const [problemProgressById, setProblemProgressById] = useState<Record<string, ProblemProgressStatus>>({})
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(null)
  const [problemLoading, setProblemLoading] = useState(true)
  const [problemError, setProblemError] = useState('')

  const [codeByLanguage, setCodeByLanguage] = useState<LanguageCodeMap>(() =>
    resolveLanguageCodeMap(null),
  )
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
  const [explanation, setExplanation] = useState<CodeExplanationResponse | null>(null)
  const [explainError, setExplainError] = useState('')
  const [hasRequestedExplanation, setHasRequestedExplanation] = useState(false)

  const submittingRef = useRef(false)
  const loadIdRef = useRef(0)

  const refreshProgress = useCallback(async () => {
    try {
      const progressItems = await fetchProblemProgress()
      setProblemProgressById(toProgressMap(progressItems))
    } catch {
      // Keep the workspace usable if progress refresh fails.
    }
  }, [])

  const clearExplanation = useCallback(() => {
    setExplanation(null)
    setExplainError('')
    setHasRequestedExplanation(false)
  }, [])

  const loadProblem = useCallback(async (id: string) => {
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
    clearExplanation()

    try {
      const problem = await fetchProblem(id)

      if (loadIdRef.current !== thisLoadId) return

      setCurrentProblem(problem)

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

      const starterMap = resolveLanguageCodeMap(problem.starterCode)

      if (latestSubmission) {
        const normalizedSubmissionLanguage = normalizeLanguage(latestSubmission.language)
        const normalizedProblemLanguage = normalizeLanguage(problem.languageSlug)
        const activeLanguage = normalizedSubmissionLanguage ?? normalizedProblemLanguage ?? 'python'

        setCodeByLanguage({
          ...starterMap,
          [activeLanguage]: latestSubmission.code,
        })
        setLanguage(activeLanguage)
        setIsCorrect(latestSubmission.isCorrect)
        setStatus('done')
        setMistake(latestSubmission.mistake ?? '')
        setConcept(latestSubmission.concept ?? '')
        setImprovement(latestSubmission.improvement ?? '')
      } else {
        setCodeByLanguage(starterMap)
        setLanguage(normalizeLanguage(problem.languageSlug) ?? 'python')
      }
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
  }, [clearExplanation])

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

  const activeCode = codeByLanguage[language] ?? ''

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

      await refreshProgress()

      fetchSubmissionHistory(currentProblem.id)
        .then(setHistory)
        .catch(() => undefined)

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
  }, [activeCode, currentProblem, language, refreshProgress])

  const handleExplain = useCallback(async () => {
    if (submittingRef.current || !currentProblem || !activeCode.trim()) return
    submittingRef.current = true
    setExplainLoading(true)
    setExplainError('')
    setHasRequestedExplanation(true)

    try {
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
  }, [activeCode, currentProblem, language])

  const handleLoadHistoryCode = useCallback((historicalCode: string) => {
    setCodeByLanguage((previous) => ({
      ...previous,
      [language]: historicalCode,
    }))
    clearExplanation()
  }, [clearExplanation, language])

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang)
    setCodeByLanguage((previous) => {
      if (previous[newLang] && previous[newLang].length > 0) {
        return previous
      }

      const starterMap = resolveLanguageCodeMap(currentProblem?.starterCode)
      return {
        ...previous,
        [newLang]: starterMap[newLang],
      }
    })
    clearExplanation()
  }, [clearExplanation, currentProblem])

  const handleCodeChange = useCallback((nextCode: string) => {
    setCodeByLanguage((previous) => {
      const previousCode = previous[language] ?? ''
      if (previousCode !== nextCode) {
        clearExplanation()
      }

      return {
        ...previous,
        [language]: nextCode,
      }
    })
  }, [clearExplanation, language])

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

  const [showMentor, setShowMentor] = useState(true)

  const isReadOnly = status === 'loading'
  const canExplain = !!currentProblem && activeCode.trim().length > 0

  return (
    <WorkspaceLayout
      header={{
        currentTitle: currentProblem?.title,
        selectedLanguageLabel: LANGUAGE_META[language].label,
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
            code={activeCode}
            language={language}
            readOnly={isReadOnly || !currentProblem}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
          />
          <ExplanationPanel
            visible={hasRequestedExplanation}
            loading={explainLoading}
            error={explainError}
            explanation={explanation}
          />
          <SubmitBar
            status={status}
            onSubmit={handleSubmit}
            onExplain={handleExplain}
            explainLoading={explainLoading}
            canExplain={canExplain}
          />
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
