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

import { api, UNAUTHORIZED_EVENT } from '@/lib/api'

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Check session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.get('/auth/me')
                setUser(data.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        void checkAuth()
    }, [])

    // Handle global unauthorized events (e.g., expired token)
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
            const { data } = await api.post('/auth/login', { email, password })
            setUser(data.user)
            router.push('/dashboard')
        },
        [router],
    )

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            const { data } = await api.post('/auth/register', { name, email, password })
            setUser(data.user)
            router.push('/dashboard')
        },
        [router],
    )

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout')
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
