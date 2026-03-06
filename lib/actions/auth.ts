'use server'

import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SITE } from '@/config/site'

// ── Sign In (email + password) ─────────────────────────────
export async function signIn(payload: { email: string; password: string }) {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/user')
}

// ── Sign Up (email + password) ─────────────────────────────
export async function signUp(payload: {
    name: string
    email: string
    password: string
    confirmPassword: string
}) {
    if (payload.password !== payload.confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
    }

    const supabase = await createServerClient()

    const { error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
            data: { name: payload.name },
            emailRedirectTo: `${SITE.url}/callback`,
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// ── Sign In with Google (OAuth) ─────────────────────────────
export async function signInWithGoogle() {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${SITE.url}/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.url) {
        return { url: data.url }
    }

    return { error: 'Failed to initiate Google sign-in' }
}

// ── Forgot Password (send reset link) ──────────────────────
export async function forgotPassword(payload: { email: string }) {
    // 1. Check if user exists using ADMIN client (bypasses RLS)
    const admin = await createAdminClient()
    const email = payload.email.toLowerCase().trim()

    const { data: user, error: lookupError } = await admin
        .from('users')

        .select('id, is_active, email')
        .eq('email', email)
        .maybeSingle()

    if (lookupError) {
        console.error('[forgotPassword] DB lookup failed:', lookupError.message)
        return { success: false, error: 'Something went wrong. Please try again later.' }
    }

    if (!user) {
        return {
            success: false,
            error: 'No account found with this email address. Please check the email or create a new account.',
        }
    }

    if (!user.is_active) {
        return {
            success: false,
            error: 'This account has been deactivated. Please contact support for assistance.',
        }
    }

    // Send the reset email via Supabase Auth
    const { error } = await admin.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE.url}/callback?next=/reset-password`,
    })

    if (error) {
        // Handle rate-limiting from Supabase
        if (error.message.toLowerCase().includes('rate') || error.status === 429) {
            return {
                success: false,
                error: 'Too many requests. Please wait a few minutes before trying again.',
            }
        }
        return { success: false, error: error.message }
    }

    return { success: true }
}

// ── Reset Password (update with new password) ──────────────
export async function resetPassword(payload: { password: string; confirmPassword: string }) {
    if (payload.password !== payload.confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
    }

    const supabase = await createServerClient()

    const { error } = await supabase.auth.updateUser({
        password: payload.password,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// ── Sign Out ───────────────────────────────────────────────
export async function signOut() {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    redirect('/login')
}
