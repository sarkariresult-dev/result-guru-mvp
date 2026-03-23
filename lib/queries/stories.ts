import { createServerClient } from '../supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { WebStory, WebStorySlide } from '@/types/stories.types'

export async function getStories(options?: {
    page?: number
    limit?: number
    status?: 'draft' | 'published' | string
    authorId?: string
    search?: string
}): Promise<{ data: WebStory[]; count: number }> {
    const supabase = await createServerClient()
    const page = options?.page ?? 1
    const limit = options?.limit ?? 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase.from('web_stories').select('*', { count: 'exact' })

    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status)
    }
    if (options?.authorId) {
        query = query.eq('author_id', options.authorId)
    }
    if (options?.search) {
        query = query.ilike('title', `%${options.search}%`)
    }

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching web stories:', error)
        return { data: [], count: 0 }
    }
    return { data: data as WebStory[], count: count || 0 }
}

export async function getStoryById(id: string): Promise<WebStory | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('web_stories')
        .select(`
            *,
            author:users(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching web story:', error)
        return null
    }
    return data as WebStory
}

export async function getStoryBySlug(slug: string): Promise<WebStory | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('web_stories')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching web story by slug:', error)
        }
        return null
    }
    return data as WebStory
}

export async function getStorySlides(storyId: string): Promise<WebStorySlide[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('web_story_slides')
        .select('*')
        .eq('story_id', storyId)
        .order('position', { ascending: true })

    if (error) {
        console.error('Error fetching story slides:', error)
        return []
    }
    return data as WebStorySlide[]
}

export async function getPublicStories(limit: number = 10, page: number = 1): Promise<{ data: WebStory[]; count: number }> {
    const supabase = createStaticClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from('web_stories')
        .select(`
            *,
            author:users(name, avatar_url)
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching public stories:', error)
        return { data: [], count: 0 }
    }
    return { data: data as WebStory[], count: count || 0 }
}

/** Public story fetch by slug - uses static client (no cookies) for AMP route */
export async function getPublicStoryBySlug(slug: string): Promise<WebStory | null> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('web_stories')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching public story by slug:', error)
        }
        return null
    }
    return data as WebStory
}

/** Public slides fetch - uses static client (no cookies) for AMP route */
export async function getPublicStorySlides(storyId: string): Promise<WebStorySlide[]> {
    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('web_story_slides')
        .select('*')
        .eq('story_id', storyId)
        .order('position', { ascending: true })

    if (error) {
        console.error('Error fetching public story slides:', error)
        return []
    }
    return data as WebStorySlide[]
}

