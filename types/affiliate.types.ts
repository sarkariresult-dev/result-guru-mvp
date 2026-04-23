// =============================================================
// affiliate.types.ts - Result Guru
// Mirrors 010_affiliate.sql.
// =============================================================

import type {
    AffiliateType,
    StockStatus,
    AffiliateRuleSort,
    PostType,
} from './enums'

// ── Affiliate product type (lookup row) ────────────────────
export interface AffiliateProductTypeRow {
    slug: string
    label: string
    sort_order: number
    is_active: boolean
    created_at: string
}


// ── Affiliate network ──────────────────────────────────────
export interface AffiliateNetwork {
    id: string
    name: string
    slug: string
    base_url: string | null
    tracking_param: string | null    // e.g. "tag", "affid"
    affiliate_id: string | null
    commission_rate: number | null    // %
    cookie_days: number
    is_active: boolean
    notes: string | null
    created_at: string
}



// ── Post ↔ product association ─────────────────────────────
export interface PostAffiliateProduct {
    id: string
    post_id: string
    product_id: string
    sort_order: number
    added_by: string | null
    created_at: string
}

// ── Auto-matching rule ─────────────────────────────────────
export interface AffiliateRule {
    id: string
    name: string
    description: string | null
    // Match conditions (all are AND logic)
    match_post_type: PostType | null
    match_state: string | null
    match_org_slug: string | null
    match_qualification: string | null
    match_keyword: string | null
    match_category_id: string | null
    // Output
    product_ids: string[] | null
    product_tags: string[] | null
    max_products: number
    sort_by: AffiliateRuleSort
    is_active: boolean
    priority: number
    created_at: string
}

// ── Affiliate click event ──────────────────────────────────
export interface AffiliateClick {
    id: number
    product_id: string
    post_id: string | null
    device: string | null
    referrer: string | null
    clicked_at: string
}

// ── Product card (frontend component props) ────────────────
export interface AffiliateProductCard {
    id: string
    name: string
    slug: string
    short_description: string | null
    image_url: string
    image_alt: string | null
    mrp: number | null
    selling_price: number | null
    discount_percent: number | null
    affiliate_url: string | null
    product_url: string
    badge_text: string | null
    badge_color: string | null
    stock_status: StockStatus
    product_type_slug: AffiliateType
    type_label?: string | null
}

// ── Record click payload (RPC) ─────────────────────────────
export interface RecordAffiliateClickPayload {
    product_id: string
    post_id?: string
    device?: string
    referrer?: string
}