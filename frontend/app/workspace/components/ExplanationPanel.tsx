'use client'

import { memo } from 'react'

import type { CodeExplanationResponse } from '@/lib/explanations'

interface ExplanationPanelProps {
  visible: boolean
  loading: boolean
  error: string
  explanation: CodeExplanationResponse | null
}

// Inline explanation panel shown after "Explain My Code" action.
function ExplanationPanelComponent({
  visible,
  loading,
  error,
  explanation,
}: ExplanationPanelProps) {
  // Keep layout compact until user explicitly requests explanation.
  if (!visible) {
    return null
  }

  return (
    <div className="shrink-0 border-t border-slate-800 bg-[#0a0e1a] px-4 py-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-slate-100">🧠 Code Breakdown</h3>

      {loading && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-900/70 px-3 py-2.5">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          <span className="text-xs text-slate-300">Explaining your code...</span>
        </div>
      )}

      {!loading && error && (
        <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && explanation && (
        <div className="mt-3 space-y-4 text-slate-300">
          <ul className="space-y-1.5 text-sm">
            {explanation.steps.map((step, index) => (
              <li key={`${index}-${step}`} className="leading-6">
                • {step}
              </li>
            ))}
          </ul>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">📌 Summary</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{explanation.summary}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">📊 Complexity</p>
            <p className="mt-1 text-sm text-slate-300">Time: {explanation.timeComplexity}</p>
            <p className="text-sm text-slate-300">Space: {explanation.spaceComplexity}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const ExplanationPanel = memo(ExplanationPanelComponent)

export default ExplanationPanel
