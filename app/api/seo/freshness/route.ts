import { NextResponse } from 'next/server'
import { findStaleContent } from '@/lib/seo/freshness'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Optional: Add basic auth or secret token check here
        const authHeader = request.headers.get('authorization')
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const report = await findStaleContent()

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                totalChecked: report.totalChecked,
                staleCount: report.stalePosts.length,
                stalePosts: report.stalePosts.map(p => ({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    type: p.type,
                    status: p.application_status,
                    lastUpdated: p.updated_at
                }))
            }
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
