'use client'

import { memo } from 'react'

import type { ProblemDetail, ProblemSummary } from '@/lib/problems'
import type { ProblemProgressStatus } from '@/lib/progress'

interface ProblemPanelProps {
  problems: ProblemSummary[]
  problemProgressById: Record<string, ProblemProgressStatus>
  currentProblem: ProblemDetail | null
  onSelectProblem: (id: string) => void
  loading: boolean
}

// Left sidebar: problem navigation list + quick metadata preview.
function getDot(status: ProblemProgressStatus | undefined): React.ReactNode {
  if (status === 'COMPLETED') {
    return <div className="h-2 w-2 shrink-0 rounded-full bg-success" title="Mastered" />
  }
  if (status === 'IN_PROGRESS') {
    return <div className="h-2 w-2 shrink-0 rounded-full bg-warning" title="Learning" />
  }
  return <div className="h-2 w-2 shrink-0 rounded-full bg-surface-3" title="Not started" />
}

function getDifficultyClass(difficulty?: string): string {
  const d = difficulty?.toLowerCase()
  if (d === 'easy') return 'text-success'
  if (d === 'medium') return 'text-warning'
  return 'text-danger'
}

function ProblemPanelComponent({
  problems,
  problemProgressById,
  currentProblem,
  onSelectProblem,
  loading,
}: ProblemPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Problem list */}
      <div className="workspace-panel-header shrink-0 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Problems</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-8">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span className="text-xs text-text-muted">Loading...</span>
          </div>
        ) : problems.length === 0 ? (
          <p className="px-4 py-8 text-xs text-text-muted">No problems available</p>
        ) : (
          <div className="py-1">
            {problems.map((p) => {
              const isActive = currentProblem?.id === p.id
              const status = problemProgressById[p.id]
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProblem(p.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                    isActive
                      ? 'bg-accent/10 text-accent-light'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  {getDot(status)}
                  <span className="min-w-0 flex-1 truncate text-[13px]">{p.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Current problem detail */}
      {currentProblem && !loading && (
        <div className="shrink-0 border-t border-white/[0.06] px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary">{currentProblem.title}</h2>
            {currentProblem.difficulty && (
              <span className={`text-[10px] font-semibold uppercase ${getDifficultyClass(currentProblem.difficulty)}`}>
                {currentProblem.difficulty}
              </span>
            )}
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <p className="text-xs leading-5 text-text-muted">
              {currentProblem.description ?? 'No description provided.'}
            </p>
          </div>
          {currentProblem.concepts?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentProblem.concepts.map((c) => (
                <span key={c} className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent-light">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ProblemPanel = memo(ProblemPanelComponent)

export default ProblemPanel
