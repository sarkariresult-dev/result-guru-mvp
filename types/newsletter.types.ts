// =============================================================
// newsletter.types.ts — Result Guru
// Mirrors 014_newsletter.sql.
// =============================================================

import type {
    SubscriberStatus,
    BroadcastChannel,
    BroadcastStatus,
} from './enums'

// ── Subscriber ─────────────────────────────────────────────
export interface Subscriber {
    id: string
    email: string
    name: string | null
    phone: string | null
    whatsapp_opt_in: boolean
    telegram_user_id: string | null
    preferences: SubscriberPreferences
    status: SubscriberStatus
    /** Unique token for one-click unsubscribe links in emails */
    unsubscribe_token: string
    subscribed_at: string
    unsubscribed_at: string | null
}

export interface SubscriberPreferences {
    job?: boolean
    result?: boolean
    admit?: boolean
    answer_key?: boolean
    scheme?: boolean
    exam?: boolean
    admission?: boolean
    notification?: boolean
    /** State slugs the subscriber wants notifications for */
    states?: string[]
    /** Qualification slugs */
    qualifications?: string[]
    [key: string]: boolean | string[] | undefined
}

// ── Broadcast ──────────────────────────────────────────────
export interface Broadcast {
    id: string
    subject: string
    body_html: string | null
    body_text: string | null
    channel: BroadcastChannel
    target_filter: BroadcastTargetFilter
    // Delivery stats
    sent_count: number
    open_count: number
    click_count: number
    status: BroadcastStatus
    scheduled_at: string | null
    sent_at: string | null
    created_by: string | null
    created_at: string
}

export interface BroadcastTargetFilter {
    status?: SubscriberStatus[]
    states?: string[]
    qualifications?: string[]
    post_types?: string[]
    whatsapp?: boolean
    telegram?: boolean
}

// ── Subscribe payload ──────────────────────────────────────
export interface SubscribePayload {
    email: string
    name?: string
    phone?: string
    whatsapp_opt_in?: boolean
    telegram_user_id?: string
    preferences?: Partial<SubscriberPreferences>
}

// ── Unsubscribe payload ────────────────────────────────────
export interface UnsubscribePayload {
    token: string
}