'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UpdateUserPayload } from '@/types/user.types'

export type ProfileState = {
    success: boolean
    message?: string
    error?: string
}

// ── Update Profile (self) ──────────────────────────────────
export async function updateProfile(
    userId: string,
    prevState: ProfileState | null,
    formData: FormData
): Promise<ProfileState> {
    const supabase = await createServerClient()
    
    const name = formData.get('name')?.toString()
    const avatar_url = formData.get('avatar_url')?.toString() || null

    if (!name) {
        return { success: false, error: 'Name is required' }
    }

    const { error } = await supabase
        .from('users')
        .update({ name, avatar_url })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/user/profile')
    return { success: true, message: 'Profile updated!' }
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
