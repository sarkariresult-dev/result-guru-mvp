// =============================================================
// advertising.types.ts — Result Guru
// Mirrors 011_advertising.sql — zones, campaigns, ads, events.
// =============================================================

import type {
    AdStatus,
    AdType,
    AdZonePosition,
    AdEventType,
    DeviceType,
    PostType,
} from './enums'

// ── Ad zone ────────────────────────────────────────────────
export interface AdZone {
    id: string
    slug: string
    name: string
    position: AdZonePosition
    description: string | null
    width: number | null
    height: number | null
    allowed_sizes: AdSize[]
    appears_on: string[]           // page contexts e.g. ['all'] or ['post_detail']
    appears_on_post_types: PostType[] | null
    is_mobile: boolean
    is_desktop: boolean
    is_active: boolean
    sort_order: number
    created_at: string
}

export interface AdSize {
    w: number
    h: number
}

// ── Advertiser ─────────────────────────────────────────────
export interface Advertiser {
    id: string
    name: string
    email: string | null
    phone: string | null
    company: string | null
    notes: string | null
    is_active: boolean
    created_at: string
}

// ── Campaign ───────────────────────────────────────────────
export interface AdCampaign {
    id: string
    advertiser_id: string | null
    name: string
    description: string | null
    budget: number | null
    daily_budget: number | null
    start_date: string           // ISO date
    end_date: string | null
    status: AdStatus
    // Targeting
    target_states: string[] | null
    target_post_types: PostType[] | null
    target_qualifications: string[] | null
    target_devices: string[]
    // Running totals
    total_impressions: number
    total_clicks: number
    total_spend: number
    // Timestamps
    created_at: string
    updated_at: string
}

// ── Ad creative ────────────────────────────────────────────
export interface Ad {
    id: string
    campaign_id: string | null
    zone_id: string
    name: string
    ad_type: AdType
    status: AdStatus
    // Creative
    image_url: string | null
    image_alt: string | null
    html_code: string | null
    text_headline: string | null
    text_description: string | null
    destination_url: string | null
    destination_url_params: string | null
    // Display
    width: number | null
    height: number | null
    open_in_new_tab: boolean
    rel_attribute: string          // e.g. "nofollow sponsored"
    weight: number          // 0–1000, higher = more impressions
    display_order: number
    is_marked_ad: boolean         // "Sponsored" label
    // Schedule
    starts_at: string | null
    ends_at: string | null
    // Counters
    impression_count: number
    click_count: number
    ctr: number          // GENERATED — click_count / impression_count
    // Timestamps
    created_at: string
    updated_at: string
}

// ── v_active_ads (view) ────────────────────────────────────
// Shape returned by the ad-server view.
export interface ActiveAd extends Ad {
    // Zone context
    zone_slug: string
    zone_position: AdZonePosition
    appears_on: string[]
    appears_on_post_types: PostType[] | null
    is_mobile: boolean
    is_desktop: boolean
    // Campaign targeting (may be null if no campaign)
    target_states: string[] | null
    target_post_types: PostType[] | null
    target_qualifications: string[] | null
    target_devices: string[]
}

// ── Ad event ───────────────────────────────────────────────
export interface AdEvent {
    id: number
    ad_id: string
    zone_id: string | null
    event_type: AdEventType
    post_id: string | null
    device: DeviceType | null
    country: string
    occurred_at: string
}

// ── Ad daily stats ─────────────────────────────────────────
export interface AdStatsDaily {
    id: string
    ad_id: string
    stat_date: string   // ISO date
    impressions: number
    clicks: number
}

// ── Ad stats aggregate ─────────────────────────────────────
export interface AdStatsAggregate {
    total_impressions: number
    total_clicks: number
    ctr: number
    by_date: AdStatsDaily[]
}

// ── Ad render context (passed to AdSlot component) ────────
export interface AdRenderContext {
    zone_slug: string
    post_type?: PostType
    state_slug?: string
    device?: DeviceType
    qualification?: string
}

// ── Create / update payloads ───────────────────────────────
export type CreateAdPayload = Omit<
    Ad,
    'id' | 'impression_count' | 'click_count' | 'ctr' | 'created_at' | 'updated_at'
>

export type UpdateAdPayload = Partial<CreateAdPayload>

export type CreateCampaignPayload = Omit<
    AdCampaign,
    'id' | 'total_impressions' | 'total_clicks' | 'total_spend' | 'created_at' | 'updated_at'
>