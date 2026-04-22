import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
export const UNAUTHORIZED_EVENT = 'codebyte:unauthorized'

const isAuthEndpoint = (url: string | undefined) => {
  if (!url) {
    return false
  }

  return url.includes('/auth/')
}

export const api = axios.create({
  baseURL,
  timeout: 8000,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url as string | undefined

    if (status === 401 && !isAuthEndpoint(requestUrl) && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    const message = error?.response?.data?.message || 'Unexpected API error'
    return Promise.reject(new Error(message))
  }
)
