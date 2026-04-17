import { NextRequest, NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
    success: boolean
    data?: T
    error?: string
    details?: unknown
}

export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(error: unknown, status = 500) {
    // Check for common error structures
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        const zodError = error as { errors?: unknown; issues?: unknown }
        return NextResponse.json({
            success: false,
            error: 'Validation Error',
            details: zodError.errors || zodError.issues
        }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Internal Server Error'
    return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * Standardized API Route wrapper to catch exceptions and guarantee consistent JSON shape.
 */

export function withErrorHandling<TReq extends Request | NextRequest, TContext = unknown>(
    handler: (req: TReq, context: TContext) => Promise<NextResponse | Response>
) {
    return async (req: TReq, context: TContext) => {
        try {
            return await handler(req, context)
        } catch (error: unknown) {
            const err = error as { name?: string; code?: number | string }
            // Next.js 15+ and standard fetch throw AbortError when a request is cancelled.
            // In dev mode (HMR) or during fast navigation, this is common and shouldn't be logged as a server error.
            if (err?.name === 'AbortError' || err?.code === 20 || err?.name === 'CanceledError') {
                return new NextResponse(null, { status: 499 }) // 499 Client Closed Request
            }


            return errorResponse(error)
        }
    }
}
