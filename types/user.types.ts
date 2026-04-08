// =============================================================
// user.types.ts - Result Guru
// Mirrors 006_users.sql.
// =============================================================

import type { UserRole } from './enums'

// ── Base user (DB row) ─────────────────────────────────────
export interface User {
    id: string
    /** Maps to Supabase auth.users.id - may be null until auth account is created */
    auth_user_id: string | null
    email: string
    name: string
    avatar_url: string | null
    role: UserRole
    bio: string | null
    /** E-E-A-T: Academic/Professional credentials (e.g., "M.Ed, Governance Analyst") */
    credentials?: string | null
    /** E-E-A-T: Industry seniority */
    years_of_experience?: number | null
    /** E-E-A-T: Social validation links */
    social_links?: {
        twitter?: string
        linkedin?: string
        facebook?: string
    } | null
    is_active: boolean
    last_login_at: string | null
    /** Granular permission overrides (future use) */
    permissions: UserPermissions
    created_at: string
    updated_at: string
}

// ── Permissions object ─────────────────────────────────────
export interface UserPermissions {
    can_publish?: boolean
    can_delete?: boolean
    can_manage_ads?: boolean
    can_manage_users?: boolean
    can_view_analytics?: boolean
    [key: string]: boolean | undefined
}

// ── Public profile (safe to expose via API) ────────────────
export type PublicUser = Pick<User, 'id' | 'name' | 'avatar_url' | 'role' | 'bio' | 'credentials' | 'years_of_experience' | 'social_links'>

// ── CMS author info (joined onto posts) ───────────────────
export type AuthorInfo = Pick<User, 'id' | 'name' | 'avatar_url' | 'bio' | 'credentials' | 'years_of_experience' | 'social_links'>

// ── Create / update payloads ───────────────────────────────
export interface CreateUserPayload {
    email: string
    name: string
    role?: UserRole
    avatar_url?: string | null
}

export interface UpdateUserPayload {
    name?: string
    avatar_url?: string | null
    bio?: string | null
    role?: UserRole
    is_active?: boolean
    permissions?: Partial<UserPermissions>
}

// ── Auth session context ───────────────────────────────────
export interface AuthSession {
    user: User
    access_token: string
    expires_at: number
}

// ── User filter (CMS admin list) ──────────────────────────
export interface UserFilters {
    role?: UserRole
    is_active?: boolean
    search?: string       // name or email
}