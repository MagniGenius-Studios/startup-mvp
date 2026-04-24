export const PROGRESS_UPDATED_EVENT = 'codebyte:progress-updated'

export interface ProgressUpdatedDetail {
  problemId: string
  language?: string
}

// Emits browser event so other pages can refresh after workspace submission.
export function dispatchProgressUpdated(detail: ProgressUpdatedDetail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent<ProgressUpdatedDetail>(PROGRESS_UPDATED_EVENT, {
      detail,
    }),
  )
}
