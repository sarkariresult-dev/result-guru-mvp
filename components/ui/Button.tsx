import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm
   font-medium transition-all duration-150 focus-visible:outline-2
   focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
    {
        variants: {
            variant: {
                primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-brand-600',
                secondary: 'bg-background-subtle text-foreground border border-border hover:bg-background-muted focus-visible:outline-ring',
                ghost: 'text-foreground-muted hover:bg-background-subtle hover:text-foreground',
                danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
                link: 'text-brand-600 underline-offset-4 hover:underline dark:text-brand-400 p-0 h-auto',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-9 px-4',
                lg: 'h-11 px-6 text-base',
                icon: 'size-9',
            },
        },
        defaultVariants: { variant: 'primary', size: 'md' },
    }
)

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            >
                {loading && (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { buttonVariants }
