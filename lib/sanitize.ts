/**
 * Node-based HTML sanitizer using sanitize-html.
 *
 * This completely replaces `isomorphic-dompurify`/`jsdom` because `jsdom`'s 
 * deep ESM+CommonJS mixed imports consistently crash Next.js Turbopack builds 
 * in Vercel Serverless/Edge environments (ERR_REQUIRE_ESM).
 *
 * `sanitize-html` uses `htmlparser2` under the hood, heavily optimized for Node.
 */

import sanitizeHtmlLib from 'sanitize-html'

/**
 * Allowed HTML tags for CMS content (TipTap editor output).
 * Anything not in this list is stripped entirely.
 */
const ALLOWED_TAGS = [
    // Block elements
    // Block elements
    'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'div', 'blockquote', 'pre', 'code',
    // Lists
    'ul', 'ol', 'li',
    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Inline formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup', 'small',
    'abbr', 'cite', 'dfn', 'kbd', 'samp', 'var', 'time',
    // Links & media
    'a', 'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
    // Semantic
    'article', 'section', 'aside', 'details', 'summary', 'header', 'footer', 'nav',
    // Other safe elements
    'span', 'dl', 'dt', 'dd', 'ruby', 'rt', 'rp', 'wbr',
]

/**
 * Allowed HTML attributes for CMS content.
 * Event handlers (onclick, onerror, etc.) are stripped by default.
 */
const ALLOWED_ATTRS = [
    // Core attributes
    'id', 'class', 'style', 'title', 'lang', 'dir', 'tabindex', 'role',
    // Links
    'href', 'target', 'rel',
    // Media
    'src', 'alt', 'width', 'height', 'loading', 'decoding',
    'srcset', 'sizes', 'poster', 'controls', 'autoplay', 'muted', 'loop', 'playsinline',
    // Tables
    'colspan', 'rowspan', 'scope', 'headers',
    // Data attributes (for TipTap extensions)
    'data-type', 'data-id', 'data-label', 'data-color',
    // Microdata / accessibility
    'aria-label', 'aria-hidden', 'aria-describedby', 'aria-labelledby',
    'itemscope', 'itemtype', 'itemprop',
    // Other
    'datetime', 'cite', 'start', 'reversed', 'type', 'value', 'name',
]

/**
 * Sanitize HTML string by removing dangerous tags and attributes.
 * Also explicitly prevents meta tags from leaking into the body via CMS content.
 *
 * @param html - Raw HTML string (e.g. from TipTap editor)
 * @returns Sanitized HTML string safe for `dangerouslySetInnerHTML`
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''

    // Next.js 15 SSG strictly restricts Math.random(). `sanitize-html` invokes it internally.
    // We temporarily stub it with a deterministic output to prevent the builder from aborting Static Generation.
    const originalRandom = Math.random
    Math.random = () => 0.5

    try {
        return sanitizeHtmlLib(html, {
            allowedTags: ALLOWED_TAGS,
            allowedAttributes: {
                '*': ALLOWED_ATTRS, // Allow these specific attributes on any allowed tag
            },
            // Explicitly ensure 'meta' is not allowed even as a self-closing catch-all
            exclusiveFilter: (frame) => {
                return frame.tag === 'meta' || frame.tag === 'script' || frame.tag === 'style'
            },
            transformTags: {
                // Demote h1 to h2 to ensure only one h1 per page (the post title)
                h1: 'h2',
            },
            allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'data'],
            allowProtocolRelative: true,
            enforceHtmlBoundary: false,
        })
    } finally {
        // Always restore the original Next.js Sandbox Math.random (whether successful or error)
        Math.random = originalRandom
    }
}

