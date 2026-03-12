import { notFound, redirect } from 'next/navigation'
import { getStoryById, getStorySlides } from '@/lib/queries/stories'
import { StoryForm } from '@/components/dashboard/stories/StoryForm'
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

    // Security check: Only author or admin can edit
    // Note: proxy.ts already ensures authors can't visit /admin,
    // but here in /author/ we must ensure authors can't edit each other's stories.
    if (story.author_id !== profile.id && profile.role !== 'admin') {
        return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                <h2 className="text-lg font-bold mb-2">Access Denied</h2>
                <p>You do not have permission to edit this story.</p>
            </div>
        )
    }


    const slides = await getStorySlides(id)

    return (
        <StoryForm
            authUserId={authUser.id}
            authorId={profile.id}
            initialStory={story}
            initialSlides={slides}
            mode="edit"
            baseUrl="/author/stories"
        />
    )
}
