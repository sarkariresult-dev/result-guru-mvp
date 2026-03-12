export interface WebStory {
    id: string
    title: string
    slug: string
    cover_image: string
    publisher_logo: string | null
    status: 'draft' | 'published'
    meta_title: string | null
    meta_desc: string | null
    author_id: string | null
    published_at: string | null
    created_at: string
    updated_at: string
}

export interface WebStorySlide {
    id: string
    story_id: string
    position: number
    bg_image: string
    bg_color: string | null
    headline: string | null
    description: string | null
    text_color: string | null
    cta_text: string | null
    cta_link: string | null
    created_at: string
    updated_at: string
}
