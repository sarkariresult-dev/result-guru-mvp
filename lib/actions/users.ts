'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UpdateUserPayload } from '@/types/user.types'

// ── Update Profile (self) ──────────────────────────────────
export async function updateProfile(
    userId: string,
    data: { name: string; avatar_url: string | null }
) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('users')
        .update({ name: data.name, avatar_url: data.avatar_url })
        .eq('id', userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/user/profile')
    return { success: true }
}

// ── Update User (admin) ───────────────────────────────────
export async function updateUser(
    userId: string,
    data: Partial<UpdateUserPayload>
) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('users')
        .update(data as Record<string, unknown>)
        .eq('id', userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
}
