import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StoryForm } from '@/components/dashboard/stories/StoryForm'

export default async function AuthorNewWebStoryPage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

    if (!profile) redirect('/login')
    const authorId = profile.id as string

    return (
        <StoryForm
            authUserId={user.id}
            authorId={authorId}
            mode="create"
            baseUrl="/author/stories"
        />
    )
}
