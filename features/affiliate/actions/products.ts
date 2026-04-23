'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Create / Update ─────────────────────────────────────────

export async function manageAffiliateProductAction(formData: FormData) {
    const supabase = await createServerClient()
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Payload construction
    const id = formData.get('id') as string | null
    const name = formData.get('name') as string
    let slug = formData.get('slug') as string
    
    if (!slug) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    // Slug collision handling for new products
    if (!id) {
        const { data: existing } = await supabase
            .from('affiliate')
            .select('id')
            .eq('slug', slug)
            .single()
        
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
        }
    }

    const badgeText = formData.get('badge_text') as string || null
    let badgeColor = formData.get('badge_color') as string || null

    // Backend Color Handling based on common presets
    if (badgeText && !badgeColor) {
        const text = badgeText.toUpperCase()
        if (text === 'HOT' || text === 'HOT OFFER') badgeColor = '#ef4444'
        else if (text === 'NEW' || text === 'NEW ARRIVAL') badgeColor = '#f59e0b'
        else if (text === 'TRENDING') badgeColor = '#3b82f6'
        else if (text === 'BEST SELLER' || text === 'BESTSELLER') badgeColor = '#10b981'
        else badgeColor = '#6366f1' // Default indigo
    }

    const payload = {
        name,
        slug,
        category: formData.get('category') as string,
        selling_price: formData.get('selling_price') ? parseFloat(formData.get('selling_price') as string) : null,
        mrp: formData.get('mrp') ? parseFloat(formData.get('mrp') as string) : null,
        
        short_description: formData.get('short_description') as string || null,
        description: formData.get('description') as string || null,
        
        is_active: formData.get('is_active') === '1',
        is_featured: formData.get('is_featured') === '1',
        display_priority: parseInt(formData.get('display_priority') as string || '0', 10),
        
        badge_text: badgeText,
        badge_color: badgeColor,
        
        product_url: formData.get('product_url') as string,
        image_url: formData.get('image_url') as string,
        image_alt: `${name} - Result Guru`,
        
        rating: formData.get('rating') ? parseFloat(formData.get('rating') as string) : null,
        rating_count: formData.get('rating') ? 1 : 0,
        faq: formData.get('faq') ? JSON.parse(formData.get('faq') as string) : [],
    }

    try {
        if (id) {
            const { error } = await supabase
                .from('affiliate')
                .update(payload)
                .eq('id', id)
            
            if (error) throw error
        } else {
            const { error } = await supabase
                .from('affiliate')
                .insert(payload)
                
            if (error) throw error
        }
        
        revalidateAffiliate()
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to save product.'
        console.error('Affiliate Product Mutation Error:', e)
        return { error: message }
    }
}

// ── Delete ──────────────────────────────────────────────────

export async function deleteAffiliateProductAction(id: string) {
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('affiliate')
            .delete()
            .eq('id', id)

        if (error) throw error
        
        revalidateAffiliate()
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to delete product.'
        console.error('Affiliate Delete Error:', e)
        return { error: message }
    }
}

// ── Toggle Active ───────────────────────────────────────────

export async function toggleAffiliateActiveAction(id: string, isActive: boolean) {
    const supabase = await createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('affiliate')
            .update({ is_active: isActive })
            .eq('id', id)

        if (error) throw error
        
        revalidateAffiliate()
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to toggle status.'
        console.error('Affiliate Toggle Error:', e)
        return { error: message }
    }
}

// ── Helpers ─────────────────────────────────────────────────

function revalidateAffiliate() {
    revalidatePath('/admin/affiliate')
    revalidatePath('/shop')
    revalidatePath('/shop/[category]', 'page')
}
