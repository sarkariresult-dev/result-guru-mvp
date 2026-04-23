import { ImageResponse } from 'next/og'
import { getAffiliateProductBySlug } from '@/features/affiliate/queries'
import { SITE } from '@/config/site'

export const alt = 'Student Shop - Result Guru'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params

    const product = await getAffiliateProductBySlug(slug)
    
    // Ensure product exists and matches the category path
    if (product && product.category === category) {
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
                        backgroundColor: '#ffffff',
                        position: 'relative',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(#f0f0f0 2px, transparent 2px)',
                        backgroundSize: '32px 32px',
                        opacity: 0.5
                    }} />

                    <div style={{
                        display: 'flex',
                        width: '90%',
                        height: '80%',
                        backgroundColor: 'white',
                        borderRadius: '32px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        {/* Left Side: Product Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '60%',
                            padding: '60px',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ 
                                    background: '#f3f4f6', 
                                    color: '#374151',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: 18,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    width: 'fit-content'
                                }}>
                                    {product.category}
                                </div>
                                <div style={{ fontSize: 56, fontWeight: 900, color: '#111827', lineHeight: 1.1 }}>
                                    {product.name}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {product.selling_price && (
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                        <div style={{ fontSize: 64, fontWeight: 900, color: '#0088CC' }}>
                                            ₹{product.selling_price}
                                        </div>
                                        {product.mrp && product.mrp > product.selling_price && (
                                            <div style={{ fontSize: 32, color: '#9ca3af', textDecoration: 'line-through' }}>
                                                ₹{product.mrp}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div style={{ fontSize: 24, color: '#6b7280', fontWeight: 600 }}>
                                    Available in Student Shop
                                </div>
                            </div>

                            <div style={{ fontSize: 24, color: '#111827', fontWeight: 800, borderTop: '2px solid #f3f4f6', paddingTop: 24 }}>
                                {SITE.name}
                            </div>
                        </div>

                        {/* Right Side: Image Placeholder */}
                        <div style={{
                            width: '40%',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderLeft: '1px solid #f3f4f6'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 20
                            }}>
                                <div style={{ 
                                    width: 240, 
                                    height: 240, 
                                    borderRadius: '24px', 
                                    backgroundColor: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                                    </svg>
                                </div>
                                <div style={{ 
                                    background: '#0088CC', 
                                    color: 'white', 
                                    padding: '12px 24px', 
                                    borderRadius: '12px', 
                                    fontSize: 22, 
                                    fontWeight: 800 
                                }}>
                                    BUY NOW
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { ...size }
        )
    }

    return new Response('Not Found', { status: 404 })
}
