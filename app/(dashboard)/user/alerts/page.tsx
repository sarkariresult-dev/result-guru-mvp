'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { subscribe } from '@/features/subscribers/actions'
import { POST_TYPE_CONFIG } from '@/config/constants'
import type { SubscriberPreferences } from '@/types/newsletter.types'
import {
    Bell,
    BellOff,
    Check,
    Loader2,
    Mail,
    Smartphone,
    AlertTriangle,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────── */

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/* ── Page ──────────────────────────────────────────────────── */

export default function UserAlertsPage() {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [whatsappOptIn, setWhatsappOptIn] = useState(false)
    const [preferences, setPreferences] = useState<SubscriberPreferences>({})
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)

    /* ── Load existing subscriber record ─────────────────── */
    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user?.email) return

            setEmail(user.email)

            const { data: sub } = await supabase
                .from('subscribers')
                .select('id, phone, whatsapp_opt_in, preferences, status')
                .eq('email', user.email)
                .single()

            if (sub && sub.status === 'active') {
                setIsSubscribed(true)
                setPhone((sub.phone as string) ?? '')
                setWhatsappOptIn((sub.whatsapp_opt_in as boolean) ?? false)
                setPreferences((sub.preferences as SubscriberPreferences) ?? {})
            } else {
                /* Default: opt‑in to job and result alerts */
                setPreferences({ job: true, result: true })
            }
            setLoading(false)
        }
        load()
    }, [])

    /* ── Preference toggle ───────────────────────────────── */
    const handleToggle = useCallback((key: string) => {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
        setSaveStatus('idle')
        setErrorMsg(null)
    }, [])

    /* ── Save via server action ──────────────────────────── */
    async function handleSave() {
        setSaveStatus('saving')
        setErrorMsg(null)

        const formData = new FormData()
        formData.append('email', email)
        if (phone) formData.append('phone', phone)
        formData.append('whatsapp_opt_in', String(whatsappOptIn))
        formData.append('preferences', JSON.stringify(preferences))

        const result = await subscribe(null, formData)

        if (result.success) {
            setSaveStatus('saved')
            setIsSubscribed(true)
            setTimeout(() => setSaveStatus('idle'), 3000)
        } else {
            setSaveStatus('error')
            setErrorMsg(result.error ?? 'Failed to save. Please try again.')
        }
    }

    /* ── Unsubscribe ─────────────────────────────────────── */
    async function handleUnsubscribe() {
        if (
            !window.confirm(
                'Are you sure you want to unsubscribe from all alerts?',
            )
        )
            return

        setSaveStatus('saving')
        const supabase = createClient()
        await supabase
            .from('subscribers')
            .update({
                status: 'unsubscribed',
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email)

        setIsSubscribed(false)
        setPreferences({})
        setSaveStatus('idle')
    }

    /* ── Loading state ───────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-brand-600" />
            </div>
        )
    }

    /* ── Count how many alert types are active ───────────── */
    const activeCount = Object.values(preferences).filter(
        (v) => v === true,
    ).length

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Job Alerts
                    </h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Choose which types of notifications you want to receive
                        via email.
                    </p>
                </div>
                {isSubscribed && (
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 sm:self-auto">
                        <span className="size-1.5 rounded-full bg-green-500" />
                        Subscribed · {activeCount} alert
                        {activeCount !== 1 ? 's' : ''} active
                    </span>
                )}
            </div>

            <div className="max-w-2xl space-y-6">
                {/* ── Contact details ────────────────────────── */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Contact Details
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="alert-email"
                                className="flex items-center gap-2 text-sm font-medium text-foreground"
                            >
                                <Mail className="size-4 text-foreground-subtle" />
                                Email Address
                            </label>
                            <input
                                id="alert-email"
                                type="email"
                                value={email}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-border bg-background-subtle px-4 py-2.5 text-sm text-foreground-muted"
                            />
                            <p className="text-xs text-foreground-subtle">
                                Alerts are sent to your account email.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="alert-phone"
                                className="flex items-center gap-2 text-sm font-medium text-foreground"
                            >
                                <Smartphone className="size-4 text-foreground-subtle" />
                                Phone (Optional)
                            </label>
                            <input
                                id="alert-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value)
                                    setSaveStatus('idle')
                                }}
                                placeholder="+91 9876543210"
                                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={whatsappOptIn}
                                onChange={(e) => {
                                    setWhatsappOptIn(e.target.checked)
                                    setSaveStatus('idle')
                                }}
                                className="size-4 rounded border-border accent-brand-600"
                            />
                            <span className="text-sm text-foreground">
                                Also send alerts via WhatsApp
                            </span>
                        </label>
                    </div>
                </section>

                {/* ── Post type preferences ──────────────────── */}
                <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                        Alert Preferences
                    </h2>
                    <p className="mb-5 text-sm text-foreground-muted">
                        Toggle the categories you&apos;re interested in.
                        We&apos;ll only send relevant updates.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(POST_TYPE_CONFIG).map(([key, cfg]) => {
                            const isOn = !!preferences[key]
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleToggle(key)}
                                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                                        isOn
                                            ? 'border-brand-300 bg-brand-50 shadow-sm dark:border-brand-700 dark:bg-brand-950/30'
                                            : 'border-border bg-background hover:bg-background-subtle'
                                    }`}
                                >
                                    <div
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                            isOn
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-background-subtle text-foreground-subtle'
                                        }`}
                                    >
                                        {isOn ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Bell className="size-4" />
                                        )}
                                    </div>
                                    <div>
                                        <p
                                            className={`text-sm font-medium ${
                                                isOn
                                                    ? 'text-brand-700 dark:text-brand-300'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            {cfg.label}
                                        </p>
                                        <p className="text-xs text-foreground-subtle">
                                            {isOn
                                                ? 'Subscribed'
                                                : 'Not subscribed'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>

                {/* ── Error message ───────────────────────────── */}
                {saveStatus === 'error' && errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                        <AlertTriangle className="size-4 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                {/* ── Action buttons ─────────────────────────── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
                    >
                        {saveStatus === 'saving' && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        {saveStatus === 'saved' && (
                            <Check className="size-4" />
                        )}
                        {saveStatus === 'saving'
                            ? 'Saving…'
                            : saveStatus === 'saved'
                              ? 'Saved!'
                              : isSubscribed
                                ? 'Update Preferences'
                                : 'Subscribe'}
                    </button>

                    {isSubscribed && (
                        <button
                            type="button"
                            onClick={handleUnsubscribe}
                            disabled={saveStatus === 'saving'}
                            className="inline-flex items-center gap-1.5 text-sm text-red-600 transition-colors hover:underline disabled:opacity-50"
                        >
                            <BellOff className="size-3.5" />
                            Unsubscribe from all
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
