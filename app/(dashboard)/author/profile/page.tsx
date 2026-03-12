'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/users'
import { profileSchema } from '@/lib/validations'
import { Avatar } from '@/components/ui/Avatar'
import {
    Camera,
    Check,
    Loader2,
    Shield,
    Calendar,
    AlertTriangle,
    KeyRound,
    FileText,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────── */

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface ProfileData {
    id: string
    authUserId: string
    name: string
    email: string
    avatarUrl: string | null
    role: string
    memberSince: string
    totalPosts: number
    publishedPosts: number
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/* ── Page ──────────────────────────────────────────────────── */

export default function AuthorProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [name, setName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    /* ── Load profile + author stats ─────────────────────── */
    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { data: dbUser } = await supabase
                .from('users')
                .select('id, name, avatar_url, role, created_at')
                .eq('auth_user_id', authUser.id)
                .single()

            const userId = (dbUser?.id as string) ?? authUser.id

            // Fetch post counts in parallel
            const [totalRes, publishedRes] = await Promise.all([
                supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId),
                supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'published'),
            ])

            const p: ProfileData = {
                id: userId,
                authUserId: authUser.id,
                name: (dbUser?.name as string) ?? '',
                email: authUser.email ?? '',
                avatarUrl: (dbUser?.avatar_url as string | null) ?? null,
                role: (dbUser?.role as string) ?? 'author',
                memberSince: (dbUser?.created_at as string) ?? authUser.created_at ?? '',
                totalPosts: totalRes.count ?? 0,
                publishedPosts: publishedRes.count ?? 0,
            }

            setProfile(p)
            setName(p.name)
            setAvatarUrl(p.avatarUrl)
            setLoading(false)
        }
        load()
    }, [])

    /* ── Handle avatar upload ────────────────────────────── */
    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrorMsg('Please upload a JPEG, PNG, WebP, or GIF image.')
            setSaveStatus('error')
            return
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setErrorMsg('Avatar must be under 2 MB.')
            setSaveStatus('error')
            return
        }

        setUploading(true)
        setErrorMsg(null)
        setSaveStatus('idle')

        const supabase = createClient()
        const ext = file.name.split('.').pop() ?? 'webp'
        const storagePath = `${profile.authUserId}/avatar.${ext}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(storagePath, file, { upsert: true, contentType: file.type })

        if (uploadError) {
            setErrorMsg(`Upload failed: ${uploadError.message}`)
            setSaveStatus('error')
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(storagePath)
        const newUrl = `${publicUrl}?t=${Date.now()}`
        setAvatarUrl(newUrl)

        const result = await updateProfile(profile.id, { name, avatar_url: publicUrl })
        if (result.error) {
            setErrorMsg(result.error)
            setSaveStatus('error')
        }
        setUploading(false)
    }

    /* ── Handle profile save ─────────────────────────────── */
    async function handleSave() {
        if (!profile) return

        const parsed = profileSchema.safeParse({ name: name.trim(), avatar_url: avatarUrl })
        if (!parsed.success) {
            const firstErr = parsed.error.issues[0]?.message
            setErrorMsg(firstErr ?? 'Invalid input.')
            setSaveStatus('error')
            return
        }

        setSaveStatus('saving')
        setErrorMsg(null)

        const result = await updateProfile(profile.id, { name: name.trim(), avatar_url: avatarUrl })
        if (result.error) {
            setErrorMsg(result.error)
            setSaveStatus('error')
        } else {
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 3000)
        }
    }

    /* ── Handle password change ──────────────────────────── */
    async function handlePasswordChange() {
        if (!profile?.email) return
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(
            profile.email,
            { redirectTo: `${window.location.origin}/reset-password` },
        )
        if (error) {
            setErrorMsg(error.message)
            setSaveStatus('error')
        } else {
            setErrorMsg(null)
            alert('Password reset link sent to your email. Please check your inbox.')
        }
    }

    /* ── Loading state ───────────────────────────────────── */
    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-brand-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Manage your author profile and account settings.
                </p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* Avatar & summary card */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="group relative">
                            <Avatar
                                src={avatarUrl}
                                fallback={name || profile.email}
                                size="lg"
                                className="size-20 border-2 border-border shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-md transition-transform hover:scale-110 dark:border-neutral-900"
                                title="Change avatar"
                            >
                                {uploading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Camera className="size-3.5" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-foreground">
                                {name || 'Anonymous'}
                            </h2>
                            <p className="truncate text-sm text-foreground-muted">{profile.email}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-foreground-subtle">
                                <span className="inline-flex items-center gap-1 capitalize">
                                    <Shield className="size-3" /> {profile.role}
                                </span>
                                {profile.memberSince && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="size-3" /> Joined{' '}
                                        {new Date(profile.memberSince).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Author stats summary */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Content Overview
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg bg-background-subtle px-4 py-3">
                            <FileText className="size-5 text-foreground-subtle" />
                            <div>
                                <p className="text-xs text-foreground-subtle">Total Posts</p>
                                <p className="text-lg font-bold tabular-nums text-foreground">
                                    {profile.totalPosts}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-background-subtle px-4 py-3">
                            <Check className="size-5 text-green-600" />
                            <div>
                                <p className="text-xs text-foreground-subtle">Published</p>
                                <p className="text-lg font-bold tabular-nums text-foreground">
                                    {profile.publishedPosts}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Personal info form */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Personal Information
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    setSaveStatus('idle')
                                    setErrorMsg(null)
                                }}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <input
                                id="profile-email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-border bg-background-subtle px-4 py-2.5 text-sm text-foreground-muted"
                            />
                            <p className="text-xs text-foreground-subtle">
                                Email is set by your login provider and cannot be changed here.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account info */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Account
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-background-subtle px-4 py-3">
                            <p className="text-xs text-foreground-subtle">Role</p>
                            <p className="mt-0.5 text-sm font-medium capitalize text-foreground">
                                {profile.role}
                            </p>
                        </div>
                        <div className="rounded-lg bg-background-subtle px-4 py-3">
                            <p className="text-xs text-foreground-subtle">Member Since</p>
                            <p className="mt-0.5 text-sm font-medium text-foreground">
                                {profile.memberSince
                                    ? new Date(profile.memberSince).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Security
                    </h2>
                    <div className="flex items-center justify-between rounded-lg bg-background-subtle px-4 py-3">
                        <div className="flex items-center gap-3">
                            <KeyRound className="size-4 text-foreground-subtle" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Password</p>
                                <p className="text-xs text-foreground-subtle">
                                    Request a password reset link via email
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background-subtle"
                        >
                            Change
                        </button>
                    </div>
                </section>

                {/* Error message */}
                {saveStatus === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-4 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                {/* Save button */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
                    >
                        {saveStatus === 'saving' && <Loader2 className="size-4 animate-spin" />}
                        {saveStatus === 'saved' && <Check className="size-4" />}
                        {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                    </button>
                    {saveStatus === 'saved' && (
                        <span className="text-sm text-green-600">Profile updated successfully!</span>
                    )}
                </div>
            </div>
        </div>
    )
}
