import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Check if localStorage is accessible in the current browser context.
 * In cross-origin iframes (like AdSense preview), storage access can throw.
 */
function isLocalStorageAvailable() {
    try {
        if (typeof window === 'undefined') return false;
        const test = '__storage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}


/**
 * Browser-side Supabase client.
 * Uses the public anon key - safe to call from client components.
 * Singleton pattern ensures only one instance is created on the client,
 * preventing LockManager contention.
 *
 * Hardened for cross-origin iframes (AdSense preview, embeds):
 * - Disables session persistence when storage is blocked
 * - Provides a no-op lock when navigator.locks is restricted
 * - Disables auto-refresh and URL session detection in restricted contexts
 */
export function createClient() {
    if (client) return client;

    const useStorage = isLocalStorageAvailable();

    client = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: useStorage,
                autoRefreshToken: useStorage,
                detectSessionInUrl: false, // Always disable URL session detection in browser to prevent loops
                // Override the default LockManager to prevent 10s timeout errors 
                // during development hot-reloads or when storage API triggers auth refreshes.
                lock: async <R>(_name: string, _acquireTimeout: number, fn: (lock: unknown) => Promise<R>): Promise<R> => {
                    try {
                        return await fn('noop-lock');
                    } catch (e) {
                        throw e;
                    }
                },
            },
            // Reduce noise in restricted contexts
            global: {
                headers: { 'x-client-info': 'result-guru-hardened' },
            }
        }
    )

    return client;
}
