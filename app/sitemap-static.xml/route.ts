import { NextResponse } from 'next/server'
import { SITE } from '@/config/site'

const STATIC_PAGES = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/job', changeFrequency: 'daily', priority: 0.9 },
    { path: '/result', changeFrequency: 'daily', priority: 0.9 },
    { path: '/admit-card', changeFrequency: 'daily', priority: 0.9 },
    { path: '/answer-key', changeFrequency: 'daily', priority: 0.8 },
    { path: '/syllabus', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/exam-pattern', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/cut-off', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/previous-paper', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/exam', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/scheme', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/admission', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/scholarship', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/notification', changeFrequency: 'daily', priority: 0.8 },
    { path: '/search', changeFrequency: 'daily', priority: 0.8 },
    { path: '/states', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/qualifications', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/organizations', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/stories', changeFrequency: 'daily', priority: 0.6 },
    { path: '/site-map', changeFrequency: 'weekly', priority: 0.3 },
    { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.2 },
] as const

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function urlEntry(url: string, lastmod: string, changefreq: string, priority: number): string {
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
}

export async function GET() {
    const baseUrl = SITE.url
    const now = new Date().toISOString()
    const entries: string[] = []

    for (const page of STATIC_PAGES) {
        entries.push(urlEntry(`${baseUrl}${page.path}`, now, page.changeFrequency, page.priority))
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}
