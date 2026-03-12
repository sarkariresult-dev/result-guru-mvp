import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'


// ── Post type → gradient color mapping ──────────────────────────
const TYPE_COLORS: Record<string, { from: string; to: string; badge: string }> = {
    job:            { from: '#1e40af', to: '#3b82f6', badge: '#dbeafe' },
    result:         { from: '#166534', to: '#22c55e', badge: '#dcfce7' },
    admit:          { from: '#6b21a8', to: '#a855f7', badge: '#f3e8ff' },
    answer_key:     { from: '#a16207', to: '#eab308', badge: '#fef9c3' },
    cut_off:        { from: '#c2410c', to: '#f97316', badge: '#ffedd5' },
    syllabus:       { from: '#0f766e', to: '#14b8a6', badge: '#ccfbf1' },
    exam_pattern:   { from: '#4338ca', to: '#818cf8', badge: '#e0e7ff' },
    previous_paper: { from: '#be185d', to: '#ec4899', badge: '#fce7f3' },
    scheme:         { from: '#b91c1c', to: '#ef4444', badge: '#fee2e2' },
    exam:           { from: '#0e7490', to: '#06b6d4', badge: '#cffafe' },
    admission:      { from: '#4d7c0f', to: '#84cc16', badge: '#ecfccb' },
    notification:   { from: '#334155', to: '#64748b', badge: '#f1f5f9' },
}

const TYPE_LABELS: Record<string, string> = {
    job: 'JOB', result: 'RESULT', admit: 'ADMIT CARD', answer_key: 'ANSWER KEY',
    cut_off: 'CUT OFF', syllabus: 'SYLLABUS', exam_pattern: 'EXAM PATTERN',
    previous_paper: 'PREVIOUS PAPER', scheme: 'SCHEME', exam: 'EXAM',
    admission: 'ADMISSION', notification: 'NOTIFICATION',
}

const FALLBACK = { from: '#1e3a5f', to: '#3b82f6', badge: '#dbeafe' }

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const title = searchParams.get('title') || 'Result Guru'
    const type = searchParams.get('type') || ''
    const org = searchParams.get('org') || ''
    const state = searchParams.get('state') || ''

    const colors = TYPE_COLORS[type] || FALLBACK
    const typeLabel = TYPE_LABELS[type] || type.toUpperCase()

    // Truncate title to ~80 chars for rendering
    const displayTitle = title.length > 80 ? title.slice(0, 77) + '…' : title

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative circles */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        right: '-80px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-120px',
                        left: '-60px',
                        width: '350px',
                        height: '350px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex',
                    }}
                />

                {/* Top section: type badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                    {typeLabel && (
                        <div
                            style={{
                                background: colors.badge,
                                color: colors.from,
                                padding: '8px 20px',
                                borderRadius: '100px',
                                fontSize: '18px',
                                fontWeight: 800,
                                letterSpacing: '1.5px',
                                display: 'flex',
                            }}
                        >
                            {typeLabel}
                        </div>
                    )}
                </div>

                {/* Middle: Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        zIndex: 1,
                        flex: 1,
                        justifyContent: 'center',
                        paddingTop: '20px',
                        paddingBottom: '20px',
                    }}
                >
                    <div
                        style={{
                            fontSize: displayTitle.length > 50 ? '42px' : '52px',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                            display: 'flex',
                        }}
                    >
                        {displayTitle}
                    </div>
                </div>

                {/* Bottom bar: org, state, site name */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        zIndex: 1,
                    }}
                >
                    {/* Left: org + state */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {org && (
                            <div
                                style={{
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    opacity: 0.9,
                                    display: 'flex',
                                }}
                            >
                                {org}
                            </div>
                        )}
                        {state && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '6px 16px',
                                    borderRadius: '100px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                }}
                            >
                                📍 {state}
                            </div>
                        )}
                    </div>

                    {/* Right: site branding */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '24px',
                                    fontWeight: 800,
                                    letterSpacing: '-0.5px',
                                    display: 'flex',
                                }}
                            >
                                Result Guru
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    opacity: 0.7,
                                    fontWeight: 500,
                                    display: 'flex',
                                }}
                            >
                                resultguru.co.in
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
            },
        },
    )
}
