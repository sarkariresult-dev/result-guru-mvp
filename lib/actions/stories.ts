'use server'

import { createServerClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { WebStory, WebStorySlide } from '@/types/stories.types'

export async function createWebStory(data: {
    title: string
    slug: string
    cover_image: string
    meta_title?: string
    meta_desc?: string
}, revalidateBasePath: string = '/admin/stories'): Promise<{ data?: WebStory; error?: string }> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get the local user ID from our database
    const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

    if (userError || !dbUser) {
        console.error('User mapping error:', userError)
        return { error: 'User profile not found' }
    }

    const { data: story, error } = await supabase
        .from('web_stories')
        .insert({
            title: data.title,
            slug: data.slug,
            cover_image: data.cover_image,
            meta_title: data.meta_title,
            meta_desc: data.meta_desc,
            author_id: dbUser.id
        })
        .select()
        .single()

    if (error) {
        console.error('Create story error:', error)
        return { error: error.message }
    }

    revalidatePath(revalidateBasePath)
    return { data: story as WebStory }
}

export async function updateWebStory(id: string, updates: Partial<WebStory>, revalidateBasePath: string = '/admin/stories'): Promise<{ error?: string }> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('web_stories')
        .update(updates)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(revalidateBasePath)
    revalidatePath(`${revalidateBasePath}/${id}`)
    return {}
}

export async function saveStorySlides(storyId: string, slides: Partial<WebStorySlide>[], revalidateBasePath: string = '/admin/stories'): Promise<{ error?: string }> {
    const supabase = await createServerClient()
    
    // Simplest approach: Delete existing slides and re-insert 
    // This perfectly matches the "position" ordering visual builder pattern
    const { error: delError } = await supabase
        .from('web_story_slides')
        .delete()
        .eq('story_id', storyId)

    if (delError) {
        console.error('Delete slides error:', delError)
        return { error: delError.message }
    }

    if (slides.length > 0) {
        const { error: insError } = await supabase
            .from('web_story_slides')
            .insert(
                slides.map((s, idx) => ({
                    story_id: storyId,
                    position: idx,
                    bg_image: s.bg_image,
                    bg_color: s.bg_color || '#000000',
                    headline: s.headline,
                    description: s.description,
                    text_color: s.text_color || '#ffffff',
                    cta_text: s.cta_text,
                    cta_link: s.cta_link
                }))
            )

        if (insError) {
            console.error('Insert slides error:', insError)
            return { error: insError.message }
        }
    }

    revalidatePath(`${revalidateBasePath}/${storyId}`)
    return {}
}

export async function publishStory(storyId: string, isPublished: boolean, revalidateBasePath: string = '/admin/stories'): Promise<{ error?: string }> {
    const supabase = await createServerClient()
    
    const { error } = await supabase
        .from('web_stories')
        .update({ 
            status: isPublished ? 'published' : 'draft',
            published_at: isPublished ? new Date().toISOString() : null
        })
        .eq('id', storyId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(revalidateBasePath)
    revalidatePath(`${revalidateBasePath}/${storyId}`)
    // Revalidation for public route handled correctly via time-based ISR later
    return {}
}

export async function deleteWebStory(id: string, revalidateBasePath: string = '/admin/stories'): Promise<{ error?: string }> {
    const supabase = await createServerClient()
    
    // Deleting the story will cascade delete slides if the DB is set up correctly,
    // otherwise we delete slides first. Assuming cascade for now, but being safe.
    await supabase.from('web_story_slides').delete().eq('story_id', id)
    
    const { error } = await supabase
        .from('web_stories')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(revalidateBasePath)
    return {}
}

