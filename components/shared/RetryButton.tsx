'use client'

import { RotateCcw } from 'lucide-react'

interface RetryButtonProps {
    className?: string
}

/**
 * A Client Component button that triggers a page reload.
 * Used in Server Components to provide retry functionality without breaking SSR boundaries.
 */
export function RetryButton({ className }: RetryButtonProps) {
    return (
        <button 
            onClick={() => window.location.reload()}
            className={className || "mt-8 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"}
        >
            <div className="flex items-center gap-2">
                <RotateCcw className="size-4" />
                <span>Retry Connection</span>
            </div>
        </button>
    )
}
