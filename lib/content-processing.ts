/**
 * Pure HTML-processing utilities for post content.
 * These are safe to call from Server Components (no React hooks/state).
 */

interface TocItem {
    id: string
    text: string
    level: number
}

export type { TocItem }

/**
 * Parse HTML content and extract headings for the TOC.
 * Adds `id` attributes to headings for anchor links.
 */
export function extractTocFromHtml(html: string): { tocItems: TocItem[]; processedHtml: string } {
    const tocItems: TocItem[] = []
    const usedIds = new Set<string>()

    // Match h2, h3, h4 headings from the HTML content
    const headingRegex = /<h([2-4])([^>]*)>(.*?)<\/h[2-4]>/gi

    const processedHtml = html.replace(headingRegex, (match, level, attrs, content) => {
        // Strip HTML tags from heading text for TOC display
        const text = content.replace(/<[^>]*>/g, '').trim()
        if (!text) return match

        // Generate a slug-based ID
        let id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 60)

        // Ensure unique IDs
        if (usedIds.has(id)) {
            let counter = 2
            while (usedIds.has(`${id}-${counter}`)) counter++
            id = `${id}-${counter}`
        }
        usedIds.add(id)

        tocItems.push({ id, text, level: parseInt(level) })

        // Add id attribute to the heading, preserve existing attributes
        const existingId = attrs.match(/id="([^"]*)"/)
        if (existingId) {
            return match
        }
        return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    })

    return { tocItems, processedHtml }
}

/**
 * Wrap <table> elements in responsive containers and add SEO-friendly classes.
 */
export function wrapTablesForResponsive(html: string): string {
    return html
        // Wrap <table> in a responsive scrollable container
        .replace(
            /<table([^>]*)>/g,
            '<div class="not-prose overflow-x-auto rounded-lg border border-border my-6" role="region" aria-label="Data table" tabindex="0"><table$1 class="w-full text-sm border-collapse">',
        )
        .replace(
            /<\/table>/g,
            '</table></div>',
        )
        // Ensure th gets proper styling
        .replace(
            /<th([^>]*)>/g,
            (_, attrs: string) => {
                if (attrs.includes('class=')) return `<th${attrs}>`
                return `<th${attrs} class="px-4 py-3 text-left font-semibold bg-surface-raised border-b border-border">`
            },
        )
        // Ensure td gets proper styling
        .replace(
            /<td([^>]*)>/g,
            (_, attrs: string) => {
                if (attrs.includes('class=')) return `<td${attrs}>`
                return `<td${attrs} class="px-4 py-3 border-b border-border">`
            },
        )
}

/**
 * Add lazy loading to content images and ensure alt text.
 */
export function optimizeContentImages(html: string): string {
    return html.replace(
        /<img([^>]*?)>/g,
        (match, attrs: string) => {
            // Add loading="lazy" if not present
            if (!attrs.includes('loading=')) {
                attrs += ' loading="lazy"'
            }
            // Add decoding="async" if not present
            if (!attrs.includes('decoding=')) {
                attrs += ' decoding="async"'
            }
            // Ensure alt text exists
            if (!attrs.includes('alt=')) {
                attrs += ' alt=""'
            }
            return `<img${attrs}>`
        },
    )
}

/**
 * Process HTML content for production rendering:
 * 1. Extract TOC headings and add IDs
 * 2. Wrap tables for responsiveness
 * 3. Optimize images
 */
export function processContentHtml(html: string): { tocItems: TocItem[]; processedHtml: string } {
    const { tocItems, processedHtml: withToc } = extractTocFromHtml(html)
    let processed = wrapTablesForResponsive(withToc)
    processed = optimizeContentImages(processed)
    return { tocItems, processedHtml: processed }
}
