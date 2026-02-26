import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL,
  timeout: 8000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || 'Unexpected API error'
    return Promise.reject(new Error(message))
  }
)
