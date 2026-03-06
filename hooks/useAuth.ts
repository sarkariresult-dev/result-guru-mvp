'use client'

/**
 * useAuth — Result Guru
 *
 * Wraps Supabase Auth with:
 *  - Real-time session / user state via onAuthStateChange
 *  - Role-based helpers: isAdmin, isAuthor
 *  - Sign-in (Google OAuth + email/password), sign-out
 *  - Loading + error state
 *  - React Query cache invalidation on auth change
 *
 * Usage:
 *   const { user, isAdmin, signOut } = useAuth()
 */

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Session, User, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/config/query-keys'
import type { UserRole } from '@/types/enums'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser extends User {
    /** From public.users.role — populated after profile load */
    role?: UserRole
    /** Display name from public.users or OAuth metadata */
    displayName?: string
    /** Avatar from public.users or OAuth metadata */
    avatarUrl?: string
}

export interface UseAuthReturn {
    /** Current Supabase session (null if signed out) */
    session: Session | null
    /** Enriched user object with role */
    user: AuthUser | null
    /** True while the initial session is being loaded */
    loading: boolean
    /** Any auth error */
    error: AuthError | null
    /** Convenience role checks */
    isAdmin: boolean
    isAuthor: boolean
    isLoggedIn: boolean
    /** Sign in with Google OAuth */
    signInWithGoogle: () => Promise<void>
    /** Sign in with email + password */
    signInWithEmail: (email: string, password: string) => Promise<void>
    /** Sign out and clear all query cache */
    signOut: () => Promise<void>
    /** Clear current error */
    clearError: () => void
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
    const supabase = createClient()
    const queryClient = useQueryClient()

    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<AuthError | null>(null)

    // ── Load profile from public.users ────────────────────────────────
    const loadProfile = useCallback(async (authUser: User): Promise<AuthUser> => {
        try {
            const { data } = await supabase
                .from('users')
                .select('role, name, avatar_url')
                .eq('auth_user_id', authUser.id)
                .single()

            return {
                ...authUser,
                role: data?.role as UserRole | undefined,
                displayName: data?.name ?? authUser.user_metadata?.full_name ?? authUser.email,
                avatarUrl: data?.avatar_url ?? authUser.user_metadata?.avatar_url,
            }
        } catch {
            // Profile not yet created — return base user
            return {
                ...authUser,
                role: undefined as UserRole | undefined,
                displayName: authUser.user_metadata?.full_name ?? authUser.email,
                avatarUrl: authUser.user_metadata?.avatar_url,
            }
        }
    }, [supabase])

    // ── Initial session + real-time listener ──────────────────────────
    useEffect(() => {
        let mounted = true

        const init = async () => {
            const { data: { session: s }, error: err } = await supabase.auth.getSession()
            if (!mounted) return
            if (err) setError(err)
            setSession(s)
            if (s?.user) {
                const enriched = await loadProfile(s.user)
                if (mounted) setUser(enriched)
            }
            setLoading(false)
        }
        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (!mounted) return
                setSession(newSession)
                if (newSession?.user) {
                    const enriched = await loadProfile(newSession.user)
                    setUser(enriched)
                } else {
                    setUser(null)
                    // Clear user-specific queries on sign-out
                    queryClient.removeQueries({ queryKey: queryKeys.auth.user() })
                    queryClient.removeQueries({ queryKey: queryKeys.auth.session() })
                }
                setLoading(false)
            },
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase, loadProfile, queryClient])

    // ── Actions ───────────────────────────────────────────────────────

    const signInWithGoogle = useCallback(async () => {
        setError(null)
        const { error: err } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
        if (err) setError(err)
    }, [supabase])

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        setError(null)
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) setError(err)
    }, [supabase])

    const signOut = useCallback(async () => {
        setError(null)
        await supabase.auth.signOut()
        // Full cache flush on sign-out — important for admin / private data
        queryClient.clear()
    }, [supabase, queryClient])

    const clearError = useCallback(() => setError(null), [])

    // ── Derived ───────────────────────────────────────────────────────

    const isAdmin = user?.role === 'admin'
    const isAuthor = user?.role === 'author' || isAdmin
    const isLoggedIn = session !== null && user !== null

    return {
        session,
        user,
        loading,
        error,
        isAdmin,
        isAuthor,
        isLoggedIn,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        clearError,
    }
}