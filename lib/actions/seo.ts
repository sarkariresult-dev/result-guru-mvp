'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Update SEO Setting ─────────────────────────────────────
export async function updateSeoSetting(key: string, value: string) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('seo_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
