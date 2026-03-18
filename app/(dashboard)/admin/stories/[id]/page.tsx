import { notFound, redirect } from 'next/navigation'
import { getStoryById, getStorySlides } from '@/lib/queries/stories'
import { StoryForm } from '@/features/dashboard/components/stories/StoryForm'
import { createServerClient } from '@/lib/supabase/server'

export default async function EditWebStoryPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // Next.js 15+ convention for async params
    const { id } = await params

    const supabase = await createServerClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')

    const story = await getStoryById(id)
    if (!story) notFound()

    // Get your local database profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_user_id', authUser.id)
        .single()

    if (!profile) redirect('/login')

    const slides = await getStorySlides(id)

    return (
        <StoryForm
            authUserId={authUser.id}
            authorId={profile.id}
            initialStory={story}
            initialSlides={slides}
            mode="edit"
            baseUrl="/admin/stories"
        />
    )
}
