// =============================================================
// enums.ts - Result Guru
// Mirrors 002_enums.sql exactly.
// Use these everywhere - never use raw strings for enum values.
// =============================================================

// ── Post type ──────────────────────────────────────────────
export enum PostType {
    Job = 'job',
    Result = 'result',
    Admit = 'admit',
    AnswerKey = 'answer_key',
    CutOff = 'cut_off',
    Syllabus = 'syllabus',
    ExamPattern = 'exam_pattern',
    PreviousPaper = 'previous_paper',
    Scheme = 'scheme',
    Exam = 'exam',
    Admission = 'admission',
    Notification = 'notification',
}

// ── Content lifecycle ──────────────────────────────────────
export enum PostStatus {
    Draft = 'draft',
    Review = 'review',
    Scheduled = 'scheduled',
    Published = 'published',
    Archived = 'archived',
}

// ── Application window status ──────────────────────────────
export enum ApplicationStatus {
    Upcoming = 'upcoming',
    Open = 'open',
    ClosingSoon = 'closing_soon',
    Closed = 'closed',
    ResultOut = 'result_out',
    NA = 'na',
}

// ── Ad lifecycle ───────────────────────────────────────────
export enum AdStatus {
    Draft = 'draft',
    Active = 'active',
    Paused = 'paused',
    Expired = 'expired',
}

// ── Ad creative format ─────────────────────────────────────
export enum AdType {
    DisplayImage = 'display_image',
    DisplayHtml = 'display_html',
    TextLink = 'text_link',
    AffiliateCard = 'affiliate_card',
}

// ── Ad placement zone position ─────────────────────────────
export enum AdZonePosition {
    HeaderTop = 'header_top',
    BelowHeader = 'below_header',
    SidebarTop = 'sidebar_top',
    SidebarSticky = 'sidebar_sticky',
    BelowDatesBox = 'below_dates_box',
    BelowFeeBox = 'below_fee_box',
    MidContent = 'mid_content',
    BelowContent = 'below_content',
    AboveFaq = 'above_faq',
    BelowFaq = 'below_faq',
    AboveRelated = 'above_related',
    ListingBetweenCards = 'listing_between_cards',
    FooterTop = 'footer_top',
    Popup = 'popup',
    FloatingBottom = 'floating_bottom',
}

// ── Affiliate product category ─────────────────────────────
export enum AffiliateProductType {
    Book = 'book',
    TestSeries = 'test_series',
    Course = 'course',
    Stationery = 'stationery',
    Tool = 'tool',
    Software = 'software',
    Other = 'other',
}

// ── Redirect HTTP code ─────────────────────────────────────
export enum RedirectType {
    Permanent = '301',
    Temporary = '302',
    Gone = '410',
}

// ── CMS user role ──────────────────────────────────────────
export enum UserRole {
    Admin = 'admin',
    Author = 'author',
    User = 'user',
}

// ── Ad event type ──────────────────────────────────────────
export enum AdEventType {
    Impression = 'impression',
    Click = 'click',
}

// ── Subscriber status ──────────────────────────────────────
export enum SubscriberStatus {
    Active = 'active',
    Unsubscribed = 'unsubscribed',
    Bounced = 'bounced',
}

// ── Broadcast channel ──────────────────────────────────────
export enum BroadcastChannel {
    Email = 'email',
    WhatsApp = 'whatsapp',
    Telegram = 'telegram',
    Push = 'push',
}

// ── Broadcast status ───────────────────────────────────────
export enum BroadcastStatus {
    Draft = 'draft',
    Sending = 'sending',
    Sent = 'sent',
    Failed = 'failed',
}

// ── Affiliate stock status ─────────────────────────────────
export enum StockStatus {
    InStock = 'in_stock',
    OutOfStock = 'out_of_stock',
    Discontinued = 'discontinued',
}

// ── Sitemap changefreq ─────────────────────────────────────
export enum ChangeFreq {
    Always = 'always',
    Hourly = 'hourly',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
    Yearly = 'yearly',
    Never = 'never',
}

// ── Device type ────────────────────────────────────────────
export enum DeviceType {
    Mobile = 'mobile',
    Desktop = 'desktop',
    Tablet = 'tablet',
    Bot = 'bot',
}

// ── Internal link type ─────────────────────────────────────
export enum InternalLinkType {
    Content = 'content',
    Related = 'related',
    Breadcrumb = 'breadcrumb',
}

// ── Affiliate rule sort ────────────────────────────────────
export enum AffiliateRuleSort {
    Priority = 'priority',
    PriceAsc = 'price_asc',
    Random = 'random',
}

// ── Post attention reason (v_posts_attention) ──────────────
export enum PostAttentionReason {
    Expired = 'expired',
    ApplyClosed = 'apply_closed',
    LowSeo = 'low_seo',
    Stale = 'stale',
    Other = 'other',
}

// ── Twitter card type ──────────────────────────────────────
export enum TwitterCardType {
    Summary = 'summary',
    SummaryLargeImage = 'summary_large_image',
    App = 'app',
    Player = 'player',
}