'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { LANGUAGE_META, type Language } from '@/lib/languages'
import type { ProblemDetail } from '@/lib/problems'
import type { LatestSubmission } from '@/lib/submissions'

import CodeEditorPanel from '../components/CodeEditorPanel'
import ExplanationPanel from '../components/ExplanationPanel'
import MentorPanel from '../components/MentorPanel'
import ProblemPanel from '../components/ProblemPanel'
import SubmitBar from '../components/SubmitBar'
import WorkspaceLayout from '../components/WorkspaceLayout'
import { useWorkspaceActions } from '../hooks/useWorkspaceActions'
import { useWorkspaceEditorState } from '../hooks/useWorkspaceEditorState'
import { useWorkspaceProblemData } from '../hooks/useWorkspaceProblemData'

interface WorkspacePageClientProps {
  problemId: string
}

// Workspace page: coordinates problem data, editor state, submit flow, and mentor UI.
export default function WorkspacePageClient({ problemId }: WorkspacePageClientProps) {
  const router = useRouter()
  // Controls right-side mentor panel visibility.
  const [showMentor, setShowMentor] = useState(true)

  // Editor hook owns language switching and per-language code buffers.
  const { activeCode, changeLanguage, initializeEditor, language, loadHistoryCode, updateActiveCode } = useWorkspaceEditorState()
  // Actions hook owns submit/explain requests and feedback state.
  const {
    clearExplanation,
    concept,
    error,
    explain,
    explainError,
    explainLoading,
    explanation,
    hasRequestedExplanation,
    hydrateFromLatestSubmission,
    improvement,
    isCorrect,
    mistake,
    resetForProblemLoad,
    status,
    submit,
    userOutput,
    expectedOutput,
  } = useWorkspaceActions()

  // Reset stale status/feedback before loading a new problem.
  const handleBeforeLoad = useCallback(() => {
    resetForProblemLoad()
  }, [resetForProblemLoad])

  // Hydrate editor + mentor state from fresh problem payload.
  const handleLoaded = useCallback(
    ({
      problem,
      latestSubmission,
    }: {
      problem: ProblemDetail
      latestSubmission: LatestSubmission | null
    }) => {
      initializeEditor({ problem, latestSubmission })
      hydrateFromLatestSubmission(latestSubmission)
    },
    [hydrateFromLatestSubmission, initializeEditor],
  )

  const {
    problems,
    problemProgressById,
    currentProblem,
    problemLoading,
    problemError,
    history,
    refreshProgress,
    refreshHistory,
    applyOptimisticProgress,
  } = useWorkspaceProblemData({
    problemId,
    onBeforeLoad: handleBeforeLoad,
    onLoaded: handleLoaded,
  })

  // Navigate only when a different problem is selected.
  const handleSelectProblem = useCallback(
    (id: string) => {
      if (!id || id === problemId) return
      router.push(`/workspace/${id}`)
    },
    [problemId, router],
  )

  // Submit current code and refresh progress/history side effects.
  const handleSubmit = useCallback(async () => {
    await submit({
      currentProblem,
      activeCode,
      language,
      applyOptimisticProgress,
      refreshProgress,
      refreshHistory,
    })
  }, [activeCode, applyOptimisticProgress, currentProblem, language, refreshHistory, refreshProgress, submit])

  // Request "Explain My Code" breakdown for current editor content.
  const handleExplain = useCallback(async () => {
    await explain({
      currentProblem,
      activeCode,
      language,
    })
  }, [activeCode, currentProblem, explain, language])

  // Loading history code should hide stale explanation content.
  const handleLoadHistoryCode = useCallback((historicalCode: string) => {
    loadHistoryCode(historicalCode)
    clearExplanation()
  }, [clearExplanation, loadHistoryCode])

  // Changing language resets explanation because code context changed.
  const handleLanguageChange = useCallback((newLang: Language) => {
    changeLanguage(newLang, currentProblem)
    clearExplanation()
  }, [changeLanguage, clearExplanation, currentProblem])

  // Any code edit invalidates previous explanation output.
  const handleCodeChange = useCallback((nextCode: string) => {
    updateActiveCode(nextCode, clearExplanation)
  }, [clearExplanation, updateActiveCode])

  useEffect(() => {
    // Keyboard shortcut for faster practice loops.
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        void handleSubmit()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit])

  // Lock editor while submission request is in progress.
  const isReadOnly = status === 'loading'
  // Explain button stays disabled until problem/code are available.
  const canExplain = !!currentProblem && activeCode.trim().length > 0

  return (
    <WorkspaceLayout
      header={{
        currentTitle: currentProblem?.title,
        selectedLanguageLabel: LANGUAGE_META[language].label,
      }}
      showMentor={showMentor}
      onToggleMentor={() => setShowMentor((prev) => !prev)}
      problemPanel={(
        <ProblemPanel
          problems={problems}
          problemProgressById={problemProgressById}
          currentProblem={currentProblem}
          onSelectProblem={handleSelectProblem}
          loading={problemLoading}
        />
      )}
      editorPanel={(
        <>
          {problemError ? (
            <div className="workspace-alert-error border-b px-4 py-3 text-sm">
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
      )}
      mentorPanel={(
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
      )}
    />
  )
}
