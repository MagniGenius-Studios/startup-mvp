'use client'

type SubmissionStatus = 'idle' | 'loading' | 'done' | 'error'

interface SubmitBarProps {
  status: SubmissionStatus
  onSubmit: () => void
  onExplain: () => void
  explainLoading: boolean
}

export default function SubmitBar({ status, onSubmit, onExplain, explainLoading }: SubmitBarProps) {
  const isLoading = status === 'loading'
  const isBusy = isLoading || explainLoading

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
          disabled={isBusy}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            isBusy
              ? 'cursor-not-allowed border border-slate-700 bg-transparent text-slate-500'
              : 'border border-slate-600 bg-transparent text-slate-300 hover:border-sky-500/50 hover:text-sky-300'
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
          className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
            isBusy
              ? 'cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-sky-600 text-white hover:bg-sky-500'
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

export type { SubmissionStatus }
