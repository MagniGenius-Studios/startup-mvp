'use client'

import { useState } from 'react'

import type { SubmissionStatus } from './SubmitBar'
import type { SubmissionHistoryItem } from '@/lib/submissions'

interface MentorPanelProps {
  isOpen: boolean
  onClose: () => void
  status: SubmissionStatus
  isCorrect: boolean | null
  mistake: string
  concept: string
  improvement: string
  error: string
  userOutput: string | null
  expectedOutput: string | null
  history: SubmissionHistoryItem[]
  onLoadHistoryCode: (code: string) => void
}

function TimeAgo({ date }: { date: string }) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return <span>just now</span>
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return <span>{minutes}m ago</span>
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return <span>{hours}h ago</span>
  return <span>{Math.floor(hours / 24)}d ago</span>
}

export default function MentorPanel({
  isOpen,
  onClose,
  status,
  isCorrect,
  mistake,
  concept,
  improvement,
  error,
  userOutput,
  expectedOutput,
  history,
  onLoadHistoryCode,
}: MentorPanelProps) {
  const [showOutput, setShowOutput] = useState(false)
  const hasResult = status === 'done' && isCorrect !== null
  const hasFeedback = !!(mistake || concept || improvement)
  const hasOutputComparison = expectedOutput !== null && userOutput !== null

  if (!isOpen) return null

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-l border-white/[0.06] bg-surface-0 animate-slide-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <span className="text-[13px] font-semibold text-text-primary">AI Mentor</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text-secondary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {/* Status: loading */}
          {status === 'loading' && (
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-3">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <span className="text-xs text-text-secondary">Analyzing your code...</span>
            </div>
          )}

          {/* Status: error */}
          {status === 'error' && error && (
            <div className="rounded-xl bg-danger/5 px-4 py-3 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Result bubble */}
          {hasResult && (
            <div className={`rounded-xl px-4 py-3 ${isCorrect ? 'bg-success/10' : 'bg-danger/10'}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{isCorrect ? '✨' : '💭'}</span>
                <span className={`text-sm font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                  {isCorrect ? 'Great work!' : 'Not quite right'}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {isCorrect
                  ? 'Your solution is correct. Check the feedback below for ways to improve further.'
                  : 'Review the structured feedback below and try again.'}
              </p>
            </div>
          )}

          {/* ── Structured Feedback Cards ─────────────────── */}
          {hasFeedback && (
            <div className="space-y-2 animate-fade-in">
              {/* What went wrong */}
              {mistake && (
                <div className="rounded-xl bg-surface-2 px-4 py-3 transition-all duration-300">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">⚠️</span>
                    <span className="text-[11px] font-semibold text-amber-300">What went wrong</span>
                  </div>
                  <p className="text-xs leading-5 text-text-secondary">{mistake}</p>
                </div>
              )}

              {/* Concept involved */}
              {concept && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 transition-all duration-300">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">🧠</span>
                    <span className="text-[11px] font-semibold text-accent-light">Concept involved</span>
                  </div>
                  <p className="text-[13px] font-medium leading-5 text-accent-light">{concept}</p>
                </div>
              )}

              {/* How to improve */}
              {improvement && (
                <div className="rounded-xl bg-surface-2 px-4 py-3 transition-all duration-300">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">💡</span>
                    <span className="text-[11px] font-semibold text-emerald-300">How to improve</span>
                  </div>
                  <p className="text-xs leading-5 text-text-secondary">{improvement}</p>
                </div>
              )}
            </div>
          )}

          {/* Output comparison (collapsible) */}
          {hasOutputComparison && (
            <div className="rounded-xl border border-white/[0.06] bg-surface-1">
              <button
                onClick={() => setShowOutput(!showOutput)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary"
              >
                <span>📋 Output Comparison</span>
                <span className="text-[10px]">{showOutput ? '▲' : '▼'}</span>
              </button>
              {showOutput && (
                <div className="space-y-2 border-t border-white/[0.06] px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-text-muted">Expected</p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-0 px-3 py-2 font-mono text-[11px] text-success">
                      {expectedOutput}
                    </pre>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-text-muted">Your Output</p>
                    <pre className={`mt-1 whitespace-pre-wrap rounded-lg bg-surface-0 px-3 py-2 font-mono text-[11px] ${
                      userOutput?.trim() === expectedOutput?.trim() ? 'text-success' : 'text-danger'
                    }`}>
                      {userOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Idle state */}
          {status === 'idle' && !hasFeedback && !error && history.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted">🤖</p>
              <p className="mt-2 text-xs text-text-muted">
                Submit your code or click <strong className="text-text-secondary">Explain My Code</strong> for structured feedback
              </p>
            </div>
          )}
        </div>

        {/* History timeline */}
        {history.length > 0 && (
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              History
            </p>
            <div className="space-y-1">
              {history.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => onLoadHistoryCode(item.code)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-surface-2"
                >
                  <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.isCorrect ? 'bg-success' : 'bg-danger'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-secondary">
                      Attempt {history.length - index}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      <TimeAgo date={String(item.createdAt)} />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
