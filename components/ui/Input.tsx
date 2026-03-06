import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    ref={ref}
                    className={cn(
                        'flex h-9 w-full rounded-lg border bg-surface px-3 py-1 text-sm shadow-sm transition-colors',
                        'placeholder:text-foreground-subtle',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : 'border-border',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'
