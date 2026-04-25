import axios from 'axios'

// Shared API client: central base URL, credential policy, and error normalization.
const configuredApi = process.env.NEXT_PUBLIC_API_URL?.trim()

if (!configuredApi) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Configure NEXT_PUBLIC_API_URL with your backend base URL (for example: https://startup-mvp-fmoj.onrender.com/api).',
  )
}

export const API = configuredApi
export const UNAUTHORIZED_EVENT = 'codebyte:unauthorized'

type ApiValidationErrors = Record<string, string[] | undefined>

interface ApiErrorPayload {
  message?: string
  statusCode?: number
  errors?: ApiValidationErrors
}

export class ApiError extends Error {
  statusCode: number
  errors?: ApiValidationErrors

  constructor(message: string, statusCode: number, errors?: ApiValidationErrors) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

const isAuthEndpoint = (url: string | undefined) => {
  if (!url) {
    return false
  }

  return url.includes('/auth/')
}

// Axios instance used by all frontend data helpers.
export const apiClient = axios.create({
  baseURL: API,
  timeout: 8000,
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = Number(error?.response?.status ?? 500)
    const requestUrl = error?.config?.url as string | undefined
    const payload = (error?.response?.data ?? {}) as ApiErrorPayload

    // Broadcast auth expiry so auth context can force sign-in.
    if (status === 401 && !isAuthEndpoint(requestUrl) && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    const message = payload.message || 'Unexpected API error'
    return Promise.reject(new ApiError(message, payload.statusCode ?? status, payload.errors))
  },
)
