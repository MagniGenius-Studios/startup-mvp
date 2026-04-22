'use client'

import type { SubmissionStatus } from './SubmitBar'
import type { SubmissionHistoryItem } from '@/lib/submissions'

interface OutputPanelProps {
  status: SubmissionStatus
  isCorrect: boolean | null
  hint: string
  improvement: string
  error: string
  userOutput: string | null
  expectedOutput: string | null
  history: SubmissionHistoryItem[]
  onLoadHistoryCode: (code: string) => void
}

export default function OutputPanel({
  status,
  isCorrect,
  hint,
  improvement,
  error,
  userOutput,
  expectedOutput,
  history,
  onLoadHistoryCode,
}: OutputPanelProps) {
  const hasResult = status === 'done' && isCorrect !== null
  const hasOutputComparison = expectedOutput !== null && userOutput !== null
  const outputsMatch = hasOutputComparison && userOutput.trim() === expectedOutput.trim()

  // Don't render anything when idle and no content
  if (status === 'idle' && !hint && !error && !hasResult && history.length === 0) {
    return null
  }

  return (
    <div className="shrink-0 border-t border-slate-800 bg-[#0a0e1a]">
      <div className="max-h-72 overflow-y-auto px-4 py-4">
        {status === 'loading' ? (
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <span className="text-sm text-slate-400">Evaluating...</span>
          </div>
        ) : status === 'error' ? (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-red-400">✕</span>
            <p className="text-sm leading-6 text-red-400">{error}</p>
          </div>
        ) : hasResult || hint ? (
          <div className="space-y-3">
            {/* Correctness badge */}
            {hasResult && (
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1">
                    <span className="text-sm">✅</span>
                    <span className="text-sm font-semibold text-emerald-400">Correct Solution</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1">
                    <span className="text-sm">❌</span>
                    <span className="text-sm font-semibold text-red-400">Incorrect Solution</span>
                  </div>
                )}
              </div>
            )}

            {/* Output comparison */}
            {hasOutputComparison && (
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg border px-3 py-2 ${outputsMatch ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expected Output</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">{expectedOutput}</pre>
                </div>
                <div className={`rounded-lg border px-3 py-2 ${outputsMatch ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Your Output</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300">{userOutput}</pre>
                </div>
              </div>
            )}

            {/* Hint display */}
            {hint ? (
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-sm">💡</span>
                  <span className="text-xs font-semibold text-sky-400">Hint</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">{hint}</p>
              </div>
            ) : null}

            {/* Improvement suggestion */}
            {improvement ? (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-sm">🔧</span>
                  <span className="text-xs font-semibold text-violet-400">Improvement</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">{improvement}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Submission history */}
        {history.length > 0 && (
          <div className={`${hasResult || hint ? 'mt-4 border-t border-slate-800 pt-4' : ''}`}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Previous Attempts
            </p>
            <div className="space-y-1.5">
              {history.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onLoadHistoryCode(item.code)}
                  className="flex w-full items-center justify-between rounded-md bg-white/5 px-3 py-2 text-left text-xs transition hover:bg-white/10"
                >
                  <span className="text-slate-300">
                    Attempt {history.length - index}
                    <span className={`ml-2 ${item.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.isCorrect ? '✔ Correct' : '✕ Incorrect'}
                    </span>
                  </span>
                  <span className="text-slate-600">
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
