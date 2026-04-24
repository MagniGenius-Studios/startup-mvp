'use client'

import Link from 'next/link'
import React, { memo } from 'react'

interface WorkspaceLayoutProps {
  header: {
    currentTitle?: string
    selectedLanguageLabel?: string
  }
  problemPanel: React.ReactNode
  editorPanel: React.ReactNode
  mentorPanel: React.ReactNode
  showMentor: boolean
  onToggleMentor: () => void
}

// Workspace shell: fixed header + three-panel coding layout.
function WorkspaceLayoutComponent({
  header,
  problemPanel,
  editorPanel,
  mentorPanel,
  showMentor,
  onToggleMentor,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-surface-0">
      {/* Minimal header */}
      <header className="workspace-panel-header flex h-12 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-text-muted transition hover:bg-white/5 hover:text-text-secondary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="h-4 w-px bg-white/[0.06]" />
          {header.currentTitle && (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-text-primary">{header.currentTitle}</span>
              {header.selectedLanguageLabel && (
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                  {header.selectedLanguageLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggleMentor}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            showMentor
              ? 'bg-accent/10 text-accent-light'
              : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
          }`}
        >
          <span>🤖</span>
          AI Mentor
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Problem panel — narrow */}
        <div className="w-[280px] shrink-0 overflow-y-auto border-r border-white/[0.06] bg-surface-0">
          {problemPanel}
        </div>

        {/* Editor — primary */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {editorPanel}
        </div>

        {/* Mentor panel — collapsible */}
        {mentorPanel}
      </div>
    </div>
  )
}

const WorkspaceLayout = memo(WorkspaceLayoutComponent)

export default WorkspaceLayout
