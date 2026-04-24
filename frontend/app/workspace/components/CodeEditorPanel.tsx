'use client'

import dynamic from 'next/dynamic'
import { memo, useCallback, useMemo } from 'react'

import { LANGUAGE_META, SUPPORTED_LANGUAGES, type Language } from '@/lib/languages'

// Editor panel: language selector + Monaco editor instance.
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0d1117]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
    </div>
  ),
})

const BASE_EDITOR_OPTIONS = {
  fontSize: 13,
  lineHeight: 20,
  fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 16, bottom: 16 },
  bracketPairColorization: { enabled: true },
  smoothScrolling: true,
  cursorBlinking: 'smooth' as const,
  renderLineHighlight: 'gutter' as const,
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
}

interface CodeEditorPanelProps {
  code: string
  language: Language
  readOnly?: boolean
  onCodeChange: (value: string) => void
  onLanguageChange: (lang: Language) => void
}

function CodeEditorPanelComponent({
  code,
  language,
  readOnly = false,
  onCodeChange,
  onLanguageChange,
}: CodeEditorPanelProps) {
  const meta = LANGUAGE_META[language]
  // Recompute editor options only when read-only mode changes.
  const options = useMemo(
    () => ({
      ...BASE_EDITOR_OPTIONS,
      readOnly,
    }),
    [readOnly],
  )

  const handleCodeChange = useCallback((value: string | undefined) => {
    onCodeChange(value ?? '')
  }, [onCodeChange])

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0d1117]">
      <div className="workspace-panel-header flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="appearance-none rounded border border-slate-700 bg-[#131822] px-2.5 py-1 pr-7 text-xs text-slate-300 outline-none focus:border-sky-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_META[lang].label}
                </option>
              ))}
            </select>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-mono text-[11px] text-slate-600">{meta.extension}</span>
        </div>
      </div>

      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={meta.monacoId}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={options}
        />
      </div>
    </div>
  )
}

const CodeEditorPanel = memo(CodeEditorPanelComponent)

export default CodeEditorPanel
export { LANGUAGE_META, SUPPORTED_LANGUAGES as LANGUAGES }
export type { Language }
