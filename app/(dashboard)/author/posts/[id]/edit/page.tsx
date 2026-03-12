import { createServerClient } from '@/lib/supabase/server'
import { getStates } from '@/lib/queries/states'
import { getOrganizations } from '@/lib/queries/organizations'
import { getCategories, getQualifications } from '@/lib/queries/taxonomy'
import { getTags } from '@/lib/queries/tags'
import { getPostById } from '@/lib/queries/posts'
import { PostForm } from '@/components/dashboard/PostForm'
import { redirect, notFound } from 'next/navigation'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [post, profileResult] = await Promise.all([
        getPostById(id),
        supabase
            .from('users')
            .select('id, role')
            .eq('auth_user_id', user.id)
            .single(),
    ])

    if (!post) notFound()

    const profile = profileResult.data
    if (!profile) redirect('/login')

    const authorId = profile.id as string
    const userRole = profile.role as string

    // Verify ownership - author can only edit their own posts, admins can edit any
    if (post.author_id !== authorId && userRole !== 'admin') {
        redirect('/author/posts')
    }

    const [states, organizations, categories, qualifications, tags] = await Promise.all([
        getStates(),
        getOrganizations(),
        getCategories(),
        getQualifications(),
        getTags(),
    ])

    return (
        <PostForm
            authUserId={user.id}
            authorId={authorId}
            mode="edit"
            initialData={post}
            states={states.map((s: { slug: string; name: string }) => ({ value: s.slug, label: s.name }))}
            organizations={organizations.map((o: { id: string; name: string; short_name?: string | null }) => ({
                value: o.id,
                label: o.short_name ? `${o.name} (${o.short_name})` : o.name
            }))}
            categories={categories.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
            qualifications={qualifications.map((q: { slug: string; name: string }) => ({ value: q.slug, label: q.name }))}
            tags={tags.map((t: { id: string; name: string; tag_type?: string }) => ({ value: t.id, label: t.name, tag_type: t.tag_type }))}
        />
    )
}
