'use client'

import dynamic from 'next/dynamic'

import { LANGUAGE_META, SUPPORTED_LANGUAGES, type Language } from '@/lib/languages'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0d1117]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
    </div>
  ),
})

// ── Props ──

interface CodeEditorPanelProps {
  code: string
  language: Language
  readOnly?: boolean
  onCodeChange: (value: string) => void
  onLanguageChange: (lang: Language) => void
}

export default function CodeEditorPanel({
  code,
  language,
  readOnly = false,
  onCodeChange,
  onLanguageChange,
}: CodeEditorPanelProps) {
  const meta = LANGUAGE_META[language]

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0d1117]">
      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0a0e1a] px-3">
        <div className="flex items-center gap-2">
          {/* Language selector */}
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

          {/* Filename */}
          <span className="font-mono text-[11px] text-slate-600">
            {meta.extension}
          </span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={meta.monacoId}
          theme="vs-dark"
          value={code}
          onChange={(value) => onCodeChange(value ?? '')}
          options={{
            fontSize: 13,
            lineHeight: 20,
            fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            readOnly,
            renderLineHighlight: 'gutter',
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  )
}

export { LANGUAGE_META, SUPPORTED_LANGUAGES as LANGUAGES }
export type { Language }
