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
    } catch (e) {
        return false;
    }
}

/**
 * Browser-side Supabase client.
 * Uses the public anon key - safe to call from client components.
 * Singleton pattern ensures only one instance is created on the client,
 * preventing LockManager contention.
 */
export function createClient() {
    if (client) return client;

    const useStorage = isLocalStorageAvailable();

    client = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: useStorage, // Only persist if storage is available
                autoRefreshToken: useStorage,
                detectSessionInUrl: true,
            }
        }
    )

    return client;
}
