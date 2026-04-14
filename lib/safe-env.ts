/**
 * Safely determines if the application is running inside an iframe.
 * Uses try-catch to avoid SecurityError crashes in highly restricted cross-origin environments
 * like the Google AdSense previewer.
 */
export function isRestrictedIframe(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
        // Simple top vs self check
        if (window.self !== window.top) return true
        
        // If we can't access window.top.location (common in restricted iframes), 
        // it will throw a SecurityError, which we catch.
        const _test = window.top?.location.href
        return false
    } catch (e) {
        // If an error is thrown during access, it's almost certainly a cross-origin restricted iframe
        return true
    }
}

/**
 * Determines if we are in a development or preview environment.
 */
export function isPreviewEnv(): boolean {
    if (typeof window === 'undefined') return false
    return (
        window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('localhost') ||
        isRestrictedIframe()
    )
}
