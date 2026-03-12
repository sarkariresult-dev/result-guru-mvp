'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRedirect(formData: FormData) {
    const fromPath = formData.get('from_path') as string
    const toPath = formData.get('to_path') as string | null
    const type = formData.get('type') as string || '301'

    if (!fromPath?.startsWith('/')) {
        return { error: 'From path must start with /' }
    }

    // 410 (Gone) doesn't need a to_path
    if (type !== '410' && !toPath?.startsWith('/')) {
        return { error: 'To path must start with /' }
    }

    const supabase = await createServerClient()

    // Check for chain: does the to_path itself have a redirect?
    let isChained = false
    if (toPath) {
        const { data: existing } = await supabase
            .from('redirects')
            .select('id')
            .eq('from_path', toPath)
            .eq('is_active', true)
            .single()
        isChained = !!existing
    }

    const { error } = await supabase.from('redirects').insert({
        from_path: fromPath,
        to_path: type === '410' ? null : toPath,
        type,
        is_chained: isChained,
    })

    if (error) {
        if (error.code === '23505') {
            return { error: `Redirect from "${fromPath}" already exists` }
        }
        return { error: error.message }
    }

    revalidatePath('/admin/redirects')
    return { success: true }
}

export async function deleteRedirect(id: string) {
    const supabase = await createServerClient()
    const { error } = await supabase.from('redirects').delete().eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/redirects')
    return { success: true }
}

export async function toggleRedirect(id: string, isActive: boolean) {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('redirects')
        .update({ is_active: isActive })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/redirects')
    return { success: true }
}
