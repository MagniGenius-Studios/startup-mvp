'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  normalizeLanguage,
  resolveLanguageCodeMap,
  type Language,
  type LanguageCodeMap,
} from '@/lib/languages'
import type { ProblemDetail } from '@/lib/problems'
import type { LatestSubmission } from '@/lib/submissions'

interface InitializeEditorInput {
  problem: ProblemDetail
  latestSubmission: LatestSubmission | null
}

// Editor-state hook: language switching and per-language code persistence.
export function useWorkspaceEditorState() {
  // Stores code for each language so switching tabs preserves edits.
  const [codeByLanguage, setCodeByLanguage] = useState<LanguageCodeMap>(() =>
    resolveLanguageCodeMap(null),
  )
  const [language, setLanguage] = useState<Language>('python')

  const activeCode = useMemo(() => codeByLanguage[language] ?? '', [codeByLanguage, language])

  const initializeEditor = useCallback(({ problem, latestSubmission }: InitializeEditorInput) => {
    const starterMap = resolveLanguageCodeMap(problem.starterCode)

    if (latestSubmission) {
      // Resume latest submission language/code when returning to a problem.
      const normalizedSubmissionLanguage = normalizeLanguage(latestSubmission.language)
      const normalizedProblemLanguage = normalizeLanguage(problem.languageSlug)
      const activeLanguage = normalizedSubmissionLanguage ?? normalizedProblemLanguage ?? 'python'

      setCodeByLanguage({
        ...starterMap,
        [activeLanguage]: latestSubmission.code,
      })
      setLanguage(activeLanguage)
      return
    }

    // First-time open: start from problem starter templates.
    setCodeByLanguage(starterMap)
    setLanguage(normalizeLanguage(problem.languageSlug) ?? 'python')
  }, [])

  const changeLanguage = useCallback((newLanguage: Language, currentProblem: ProblemDetail | null) => {
    setLanguage(newLanguage)
    setCodeByLanguage((previous) => {
      if (previous[newLanguage] && previous[newLanguage].length > 0) {
        return previous
      }

      // Backfill missing language tab with starter code for that problem.
      const starterMap = resolveLanguageCodeMap(currentProblem?.starterCode)
      return {
        ...previous,
        [newLanguage]: starterMap[newLanguage],
      }
    })
  }, [])

  const updateActiveCode = useCallback((nextCode: string, onChanged?: () => void) => {
    setCodeByLanguage((previous) => {
      const previousCode = previous[language] ?? ''
      if (previousCode !== nextCode) {
        // Clears stale explanation only when content really changed.
        onChanged?.()
      }

      return {
        ...previous,
        [language]: nextCode,
      }
    })
  }, [language])

  const loadHistoryCode = useCallback((historicalCode: string) => {
    // Overwrite current language buffer with selected past attempt.
    setCodeByLanguage((previous) => ({
      ...previous,
      [language]: historicalCode,
    }))
  }, [language])

  return {
    language,
    activeCode,
    initializeEditor,
    changeLanguage,
    updateActiveCode,
    loadHistoryCode,
  }
}
