import { cn } from '@/lib/utils'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' }
    return (
        <div
            className={cn('animate-spin rounded-full border-2 border-border border-t-brand-600', sizes[size], className)}
            role="status"
            aria-label="Loading"
        />
    )
}
