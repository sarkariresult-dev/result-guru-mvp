'use client'

/**
 * safe-env.ts - Result Guru
 *
 * Centralized utilities for detecting restricted browser environments
 * (e.g., Google AdSense preview iframes, cross-origin iframes).
 *
 * These helpers let any client component gracefully degrade instead
 * of crashing with SecurityError.
 */

let _isRestricted: boolean | null = null

/**
 * Detect if the current browsing context is a restricted iframe
 * (cross-origin, sandboxed, or otherwise limited in API access).
 *
 * Results are cached after first call.
 */
export function isRestrictedEnvironment(): boolean {
    if (typeof window === 'undefined') return false
    if (_isRestricted !== null) return _isRestricted

    try {
        // Cross-origin iframes: window.top is inaccessible
        const inIframe = window.self !== window.top
        if (!inIframe) {
            _isRestricted = false
            return false
        }

        // We're in an iframe — test if storage is accessible
        const testKey = '__rg_env_test__'
        window.localStorage.setItem(testKey, '1')
        window.localStorage.removeItem(testKey)
        _isRestricted = false
        return false
    } catch {
        // SecurityError or DOMException — restricted environment
        _isRestricted = true
        return true
    }
}

/**
 * Safe wrapper around localStorage.getItem.
 * Returns null silently on any failure.
 */
export function safeGetItem(key: string): string | null {
    try {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

/**
 * Safe wrapper around localStorage.setItem.
 * Silently fails on any error.
 */
export function safeSetItem(key: string, value: string): void {
    try {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
    } catch {
        // Restricted iframe, quota exceeded, private mode — silently ignore
    }
}

/**
 * Safe wrapper around sessionStorage.getItem.
 * Returns null silently on any failure.
 */
export function safeSessionGet(key: string): string | null {
    try {
        if (typeof window === 'undefined') return null
        return window.sessionStorage.getItem(key)
    } catch {
        return null
    }
}

/**
 * Safe wrapper around sessionStorage.setItem.
 * Silently fails on any error.
 */
export function safeSessionSet(key: string, value: string): void {
    try {
        if (typeof window === 'undefined') return
        window.sessionStorage.setItem(key, value)
    } catch {
        // Silently ignore
    }
}
