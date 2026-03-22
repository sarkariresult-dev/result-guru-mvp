'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { categorySchema, tagSchema, organizationSchema, stateSchema, qualificationSchema } from '@/lib/validations'
import { z } from 'zod'

// ── Helpers ────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function revalidateTaxonomy() {
    revalidatePath('/admin/categories')
    revalidatePath('/admin/tags')
    revalidatePath('/admin/organizations')
    revalidatePath('/admin/states')
    revalidateTag('taxonomy', 'default')
}

// ── Categories ─────────────────────────────────────────────

export async function createCategory(data: z.infer<typeof categorySchema>) {
    const parsed = categorySchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const row = {
        name: parsed.data.name,
        slug: parsed.data.slug || slugify(parsed.data.name),
        parent_id: parsed.data.parent_id ?? null,
        description: parsed.data.description ?? null,
        icon: parsed.data.icon ?? null,
        sort_order: parsed.data.sort_order ?? 0,
        is_active: parsed.data.is_active ?? true,
        meta_title: parsed.data.meta_title ?? null,
        meta_description: parsed.data.meta_description ?? null,
        meta_robots: parsed.data.meta_robots ?? 'index,follow',
        h1_override: parsed.data.h1_override ?? null,
        intro_html: parsed.data.intro_html ?? null,
    }

    const { error } = await supabase.from('categories').insert(row)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function updateCategory(id: string, data: Partial<z.infer<typeof categorySchema>>) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid category ID' }
    }

    const parsed = categorySchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const updateRow: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
        updateRow[key] = value ?? null
    }

    const { error } = await supabase.from('categories').update(updateRow).eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function deleteCategory(id: string) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid category ID' }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

// ── Tags ───────────────────────────────────────────────────

export async function createTag(data: z.infer<typeof tagSchema>) {
    const parsed = tagSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const row = {
        name: parsed.data.name,
        slug: parsed.data.slug || slugify(parsed.data.name),
        description: parsed.data.description ?? null,
        tag_type: parsed.data.tag_type ?? 'general',
        is_active: parsed.data.is_active ?? true,
        canonical_tag_id: parsed.data.canonical_tag_id ?? null,
        meta_title: parsed.data.meta_title ?? null,
        meta_description: parsed.data.meta_description ?? null,
        meta_robots: parsed.data.meta_robots ?? 'index,follow',
    }

    const { error } = await supabase.from('tags').insert(row)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function updateTag(id: string, data: Partial<z.infer<typeof tagSchema>>) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid tag ID' }
    }

    const parsed = tagSchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const updateRow: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
        updateRow[key] = value ?? null
    }

    const { error } = await supabase.from('tags').update(updateRow).eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function deleteTag(id: string) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid tag ID' }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

// ── Organizations ──────────────────────────────────────────

export async function createOrganization(data: z.infer<typeof organizationSchema>) {
    const parsed = organizationSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const row = {
        name: parsed.data.name,
        slug: parsed.data.slug || slugify(parsed.data.name),
        short_name: parsed.data.short_name ?? null,
        state_slug: parsed.data.state_slug ?? null,
        official_url: parsed.data.official_url || null,
        logo_url: parsed.data.logo_url ?? null,
        description: parsed.data.description ?? null,
        is_active: parsed.data.is_active ?? true,
        meta_title: parsed.data.meta_title ?? null,
        meta_description: parsed.data.meta_description ?? null,
        meta_robots: parsed.data.meta_robots ?? 'index,follow',
        schema_json: parsed.data.schema_json ?? null,
    }

    const { error } = await supabase.from('organizations').insert(row)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function updateOrganization(id: string, data: Partial<z.infer<typeof organizationSchema>>) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid organization ID' }
    }

    const parsed = organizationSchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const updateRow: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
        updateRow[key] = value === '' ? null : (value ?? null)
    }

    const { error } = await supabase.from('organizations').update(updateRow).eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function deleteOrganization(id: string) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid organization ID' }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.from('organizations').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

// ── Qualifications ──────────────────────────────────────────

export async function createQualification(data: z.infer<typeof qualificationSchema>) {
    const parsed = qualificationSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const row = {
        slug: parsed.data.slug || slugify(parsed.data.name),
        name: parsed.data.name,
        short_name: parsed.data.short_name || null,
        sort_order: parsed.data.sort_order || 0,
        is_active: parsed.data.is_active ?? true,
        meta_title: parsed.data.meta_title || null,
        meta_description: parsed.data.meta_description || null,
        meta_robots: parsed.data.meta_robots || 'index,follow',
    }

    const { error } = await supabase.from('qualifications').insert(row)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function updateQualification(slug: string, data: Partial<z.infer<typeof qualificationSchema>>) {
    if (!slug) return { error: 'Invalid slug' }

    const parsed = qualificationSchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const updateRow: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
        if (key === 'slug') continue
        updateRow[key] = value ?? null
    }

    const { error } = await supabase.from('qualifications').update(updateRow).eq('slug', slug)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function deleteQualification(slug: string) {
    if (!slug) return { error: 'Invalid slug' }

    const supabase = await createServerClient()
    const { error } = await supabase.from('qualifications').delete().eq('slug', slug)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

// ── States ─────────────────────────────────────────────────

export async function createState(data: z.infer<typeof stateSchema>) {
    const parsed = stateSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const row = {
        slug: parsed.data.slug,
        name: parsed.data.name,
        abbr: parsed.data.abbr ?? null,
        is_active: parsed.data.is_active ?? true,
        sort_order: parsed.data.sort_order ?? 0,
        meta_title: parsed.data.meta_title ?? null,
        meta_description: parsed.data.meta_description ?? null,
        meta_robots: parsed.data.meta_robots ?? 'index,follow',
        h1_override: parsed.data.h1_override ?? null,
        intro_html: parsed.data.intro_html ?? null,
    }

    const { error } = await supabase.from('states').insert(row)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function updateState(slug: string, data: Partial<z.infer<typeof stateSchema>>) {
    if (!slug || slug.length < 2) {
        return { error: 'Invalid state slug' }
    }

    const parsed = stateSchema.partial().safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const updateRow: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(parsed.data)) {
        if (key === 'slug') continue // Don't update PK
        updateRow[key] = value ?? null
    }

    const { error } = await supabase.from('states').update(updateRow).eq('slug', slug)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}

export async function deleteState(slug: string) {
    if (!slug || slug.length < 2) {
        return { error: 'Invalid state slug' }
    }

    const supabase = await createServerClient()
    const { error } = await supabase.from('states').delete().eq('slug', slug)
    if (error) return { error: error.message }

    revalidateTaxonomy()
    return { success: true }
}
