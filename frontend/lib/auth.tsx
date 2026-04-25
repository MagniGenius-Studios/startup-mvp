'use client'

import { useRouter } from 'next/navigation'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { apiClient, UNAUTHORIZED_EVENT } from '@/lib/api'

interface User {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
}

interface AuthContextValue {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

// Auth context: keeps session state and exposes login/register/logout actions.
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    // `user` and `loading` drive route guards and nav state across the app.
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // API call: restore existing session from cookie on initial app load.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await apiClient.get('/auth/me')
                setUser(data.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        void checkAuth()
    }, [])

    // React to 401 events emitted by API interceptor.
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null)
            setLoading(false)
            router.push('/login')
        }

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }, [router])

    const login = useCallback(
        async (email: string, password: string) => {
            // API call: creates session and returns user payload.
            const { data } = await apiClient.post('/auth/login', { email, password })
            setUser(data.user)
            router.push('/dashboard')
        },
        [router],
    )

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            // API call: creates account and starts session.
            const { data } = await apiClient.post('/auth/register', { name, email, password })
            setUser(data.user)
            router.push('/dashboard')
        },
        [router],
    )

    const logout = useCallback(async () => {
        try {
            // API call: clears server-side auth cookie.
            await apiClient.post('/auth/logout')
        } catch {
            // ignore logout errors
        }
        setUser(null)
        router.push('/login')
    }, [router])

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
