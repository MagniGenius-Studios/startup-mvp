export const PROGRESS_UPDATED_EVENT = 'codebyte:progress-updated'

export interface ProgressUpdatedDetail {
  problemId: string
  language?: string
}

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
