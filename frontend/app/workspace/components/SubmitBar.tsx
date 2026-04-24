'use client'

import { memo } from 'react'

type SubmissionStatus = 'idle' | 'loading' | 'done' | 'error'

interface SubmitBarProps {
  status: SubmissionStatus
  onSubmit: () => void
  onExplain: () => void
  explainLoading: boolean
  canExplain: boolean
}

// Bottom action bar: submit/explain controls with busy-state handling.
function SubmitBarComponent({ status, onSubmit, onExplain, explainLoading, canExplain }: SubmitBarProps) {
  const isLoading = status === 'loading'
  const isBusy = isLoading || explainLoading
  const isExplainDisabled = isBusy || !canExplain

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-slate-800 bg-[#0a0e1a] px-4 py-2.5">
      {/* Shortcut hint */}
      <span className="text-[11px] text-slate-600">
        Ctrl + Enter to submit
      </span>

      <div className="flex items-center gap-2">
        {/* Explain My Code button */}
        <button
          onClick={onExplain}
          disabled={isExplainDisabled}
          className={`workspace-button-secondary flex items-center gap-2 ${
            isExplainDisabled
              ? 'cursor-not-allowed border-slate-700 text-slate-500 hover:border-slate-700 hover:text-slate-500'
              : ''
          }`}
        >
          {explainLoading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Explain My Code
            </>
          )}
        </button>

        {/* Submit button */}
        <button
          onClick={onSubmit}
          disabled={isBusy}
          className={`workspace-button-primary flex items-center gap-2 ${
            isBusy
              ? 'cursor-not-allowed bg-slate-800 text-slate-500 hover:bg-slate-800'
              : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Submit
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const SubmitBar = memo(SubmitBarComponent)

export default SubmitBar
export type { SubmissionStatus }
