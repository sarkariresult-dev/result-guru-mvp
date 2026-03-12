// =============================================================
// affiliate.types.ts - Result Guru
// Mirrors 012_affiliate.sql.
// =============================================================

import type {
    AffiliateProductType,
    StockStatus,
    AffiliateRuleSort,
    PostType,
} from './enums'

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

// ── Affiliate product ──────────────────────────────────────
export interface AffiliateProduct {
    id: string
    network_id: string | null
    product_type: AffiliateProductType
    name: string
    slug: string
    description: string | null
    short_description: string | null
    author_publisher: string | null
    edition: string | null
    language: string
    isbn: string | null
    // Pricing
    mrp: number | null
    selling_price: number | null
    discount_percent: number | null
    // Media
    image_url: string
    image_alt: string | null
    // URLs
    product_url: string
    affiliate_url: string | null
    affiliate_product_id: string | null
    // Targeting / matching signals
    relevant_exams: string[] | null
    relevant_subjects: string[] | null
    relevant_post_types: PostType[] | null
    relevant_states: string[] | null
    relevant_qualifications: string[] | null
    keywords: string[] | null
    // Display
    display_priority: number
    badge_text: string | null    // "Bestseller", "New", etc.
    badge_color: string | null
    // State
    is_active: boolean
    is_featured: boolean
    stock_status: StockStatus
    // Analytics
    click_count: number
    // SEO
    meta_title: string | null
    meta_description: string | null
    // Timestamps
    created_at: string
    updated_at: string
}

// ── Product with network info (from v_featured_affiliate_products) ─
export interface AffiliateProductWithNetwork extends AffiliateProduct {
    network_name: string | null
    affiliate_id: string | null    // from network
    tracking_param: string | null
    network_base_url: string | null
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
    product_type: AffiliateProductType
}

// ── Record click payload (RPC) ─────────────────────────────
export interface RecordAffiliateClickPayload {
    product_id: string
    post_id?: string
    device?: string
    referrer?: string
}