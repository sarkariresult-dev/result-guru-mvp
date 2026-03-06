import 'server-only'

/**
 * Standardized error class for query failures.
 * Provides structured error info for logging and error boundaries.
 */
export class QueryError extends Error {
    public readonly code: string
    public readonly context: string

    constructor(context: string, message: string, code = 'QUERY_ERROR') {
        super(`[${context}] ${message}`)
        this.name = 'QueryError'
        this.code = code
        this.context = context
    }
}

/**
 * Wrap a Supabase query result with consistent error handling.
 *
 * @example
 * ```ts
 * const { data, error } = await supabase.from('posts').select('*')
 * return unwrapQuery('getPosts', data, error)
 * ```
 */
export function unwrapQuery<T>(
    context: string,
    data: T | null,
    error: { message: string; code?: string } | null,
): T {
    if (error) {
        // PGRST116 = "no rows found" — return null for .single() queries
        if (error.code === 'PGRST116') return null as T
        throw new QueryError(context, error.message, error.code)
    }
    return data as T
}

/**
 * Type-safe result wrapper for server actions.
 * Avoids { error } | { success } union confusion.
 */
export type ActionResult<T = void> =
    | { ok: true; data: T }
    | { ok: false; error: string }

export function actionOk<T>(data: T): ActionResult<T> {
    return { ok: true, data }
}

export function actionFail(error: string): ActionResult<never> {
    return { ok: false, error }
}
