import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/features/posts/queries'
import { SITE } from '@/config/site'
import { slugToKey, humanise } from '@/lib/utils'

export const alt = 'Result Guru Update'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ type: string; slug: string }> }) {
    const { type, slug } = await params
    const typeKey = slugToKey(type)

    if (!typeKey) {
        return new Response('Not Found', { status: 404 })
    }

    const post = await getPostBySlug(slug, typeKey)
    if (!post) {
        return new Response('Not Found', { status: 404 })
    }

    const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    const typeLabel = humanise(type).toUpperCase()

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: 'linear-gradient(to bottom right, #001f3f, #0077b5, #0a0a0a)',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Decorative blob top right */}
                <div style={{
                    position: 'absolute',
                    top: -200,
                    right: -200,
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, rgba(0, 136, 204, 0.4) 0%, rgba(0, 136, 204, 0) 70%)',
                    borderRadius: '50%',
                }} />

                {/* Decorative blob bottom left */}
                <div style={{
                    position: 'absolute',
                    bottom: -300,
                    left: -200,
                    width: 700,
                    height: 700,
                    background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0) 70%)',
                    borderRadius: '50%',
                }} />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '85%',
                        height: '75%',
                        justifyContent: 'space-between',
                        padding: '48px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        // No backdropFilter as next/og uses Satori which doesn't fully support blur
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                background: '#0088CC', 
                                color: '#ffffff',
                                padding: '12px 24px',
                                borderRadius: '9999px',
                                fontSize: 24,
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {typeLabel}
                            </div>
                        </div>
                        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                            {SITE.name}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, justifyContent: 'center' }}>
                        <div
                            style={{
                                fontSize: 64,
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em',
                                // Note: WebkitLineClamp works best if height is bounded
                            }}
                        >
                            {post.title}
                        </div>
                        
                        {(post as any).org_name && (
                            <div style={{ fontSize: 36, color: '#93C5FD', fontWeight: 600 }}>
                                {(post as any).org_name}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.7)' }}>
                                {formattedDate}
                            </div>
                        </div>
                        <div style={{ fontSize: 28, color: '#facc15', fontWeight: 800 }}>
                            {SITE.url.replace(/^https?:\/\//, '')}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
