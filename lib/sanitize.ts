/**
 * DOM-based HTML sanitizer using DOMPurify.
 *
 * Replaces the previous regex-based approach which was fundamentally
 * bypassable with crafted payloads. DOMPurify uses proper DOM parsing
 * to strip dangerous content — it's the industry standard used by
 * Mozilla, WordPress, and Atlassian.
 *
 * `isomorphic-dompurify` works in both server (Node/jsdom) and client
 * environments, making it safe for Next.js Server Components.
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Allowed HTML tags for CMS content (TipTap editor output).
 * Anything not in this list is stripped entirely.
 */
const ALLOWED_TAGS = [
    // Block elements
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
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
 * Event handlers (onclick, onerror, etc.) are blocked by default by DOMPurify.
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
 * Uses DOMPurify with proper DOM parsing — not bypassable like regex.
 *
 * @param html - Raw HTML string (e.g. from TipTap editor)
 * @returns Sanitized HTML string safe for `dangerouslySetInnerHTML`
 */
export function sanitizeHtml(html: string): string {
    if (!html) return ''
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTRS,
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ['target'],
        KEEP_CONTENT: true,
    })
}

