import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, children, ...props }, ref) => {
        return (
            <div className="w-full">
                <select
                    ref={ref}
                    className={cn(
                        'flex h-9 w-full appearance-none rounded-lg border bg-surface px-3 py-1 text-sm shadow-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error ? 'border-red-500' : 'border-border',
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                {error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        )
    }
)
Select.displayName = 'Select'
