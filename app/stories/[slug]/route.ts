import { NextRequest, NextResponse } from 'next/server'
import { getPublicStoryBySlug, getPublicStorySlides } from '@/lib/queries/stories'
import { SITE } from '@/config/site'


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const story = await getPublicStoryBySlug(slug)

    if (!story) {
        return new NextResponse('Story not found', { status: 404 })
    }

    const slides = await getPublicStorySlides(story.id)
    
    // AMP validation requires minimum 4 slides for Discover
    if (slides.length < 4) {
        return new NextResponse('Story incomplete', { status: 404 })
    }

    const canonicalUrl = `${SITE.url}/stories/${story.slug}`
    const publisherLogo = story.publisher_logo || SITE.publisher.logo
    const publishedAt = story.published_at || story.created_at

    // ── Generate Raw AMP HTML ─────────────────────────────────
    // We do NOT use React here to completely avoid hydration bloat.
    // This string literal is 100% AMP valid by design.
    
    const html = `<!doctype html>
<html amp lang="en">
<head>
    <meta charset="utf-8">
    <title>${story.meta_title || story.title}</title>
    <meta name="description" content="${story.meta_desc || story.title}">
    
    <link rel="canonical" href="${canonicalUrl}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Outfit:wght@400;700&display=swap" rel="stylesheet">

    <style amp-custom>
        :root {
            /* Synced from globals.css brand-600 oklch(0.48 0.192 264) */
            --brand-primary: #4f46e5;
            --brand-primary-hover: #4338ca;
            --glass-bg: rgba(0, 0, 0, 0.6);
        }
        amp-story {
            font-family: 'Outfit', 'Inter', -apple-system, system-ui, sans-serif;
            color: #fff;
        }
        amp-story-page {
            background-color: #0f172a; /* slate-900 equivalent */
        }
        .vignette {
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 85%, rgba(15,23,42,1) 100%);
        }
        .content-container {
            padding: 40px 24px 80px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            height: 100%;
        }
        .headline {
            font-size: 32px;
            font-weight: 800;
            line-height: 1.15;
            margin: 0 0 16px;
            letter-spacing: -0.015em;
            text-wrap: balance;
            color: #ffffff;
            text-shadow: 0 2px 12px rgba(0,0,0,0.6);
        }
        .description {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
            opacity: 0.95;
            color: rgba(255, 255, 255, 0.9);
            text-shadow: 0 1px 6px rgba(0,0,0,0.5);
            text-wrap: pretty;
        }
        /* CTA Section */
        amp-story-page-outlink {
            padding: 0 24px 60px;
        }
        .cta-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--brand-primary);
            color: #ffffff;
            padding: 16px 36px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
            font-family: 'Outfit', sans-serif;
            letter-spacing: 0.025em;
        }
        .cta-button:active {
            background: var(--brand-primary-hover);
        }
        /* Scrim for branding visibility */
        .system-scrim {
            background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);
            height: 90px;
            position: absolute;
            top: 0;
            width: 100%;
        }
    </style>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${canonicalUrl}"
        },
        "headline": "${story.title}",
        "image": ["${story.cover_image}"],
        "datePublished": "${publishedAt}",
        "dateModified": "${story.updated_at}",
        "author": {
            "@type": "Organization",
            "name": "${SITE.name}",
            "url": "${SITE.url}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "${SITE.name}",
            "logo": {
                "@type": "ImageObject",
                "url": "${publisherLogo}"
            }
        }
    }
    </script>
</head>
<body>
    <amp-story 
        standalone
        title="${story.title}"
        publisher="${SITE.name}"
        publisher-logo-src="${publisherLogo}"
        poster-portrait-src="${story.cover_image}"
    >
        <amp-analytics type="googleanalytics">
            <script type="application/json">
            {
                "vars": {
                    "account": "${process.env.NEXT_PUBLIC_GA_ID || ''}"
                },
                "triggers": {
                    "trackPageview": {
                        "on": "visible",
                        "request": "pageview",
                        "vars": {
                            "title": "${story.title}"
                        }
                    }
                }
            }
            </script>
        </amp-analytics>

        ${slides.map((slide, i: number) => {
            // Apply different animations to keep it dynamic
            const bgAnims = ['zoom-in', 'pan-left', 'pan-right', 'zoom-out'];
            const anim = bgAnims[i % bgAnims.length];
            
            return `
        <amp-story-page id="slide-${i}">
            <amp-story-grid-layer template="fill">
                <amp-img src="${slide.bg_image}"
                    width="720" height="1280"
                    layout="responsive"
                    animate-in="${anim}"
                    animate-in-duration="8s"
                    alt="${slide.headline || 'Slide background'}">
                </amp-img>
            </amp-story-grid-layer>
            
            <amp-story-grid-layer template="fill" class="vignette"></amp-story-grid-layer>
            <amp-story-grid-layer template="fill" class="system-scrim"></amp-story-grid-layer>
            
            <amp-story-grid-layer template="vertical" class="content-layer">
                <div class="content-container">
                    ${slide.headline ? `
                    <h2 class="headline" 
                        animate-in="fly-in-bottom" 
                        animate-in-delay="0.1s"
                        style="color: ${slide.text_color || '#fff'}">
                        ${slide.headline}
                    </h2>` : ''}
                    
                    ${slide.description ? `
                    <p class="description" 
                        animate-in="fade-in" 
                        animate-in-delay="0.3s"
                        style="color: ${slide.text_color || '#fff'}">
                        ${slide.description}
                    </p>` : ''}
                </div>
            </amp-story-grid-layer>

            ${slide.cta_link ? `
            <amp-story-page-outlink layout="nodisplay" theme="custom" cta-accent-element="text" cta-accent-color="#ffffff">
                <a href="${slide.cta_link}" class="cta-button">${slide.cta_text || 'Swipe Up'}</a>
            </amp-story-page-outlink>
            ` : ''}
        </amp-story-page>
        `}).join('')}
    </amp-story>
</body>
</html>`

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
    })
}
