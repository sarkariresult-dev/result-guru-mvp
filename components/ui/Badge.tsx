import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-background-subtle text-foreground-muted',
                green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            },
        },
        defaultVariants: { variant: 'default' },
    }
)

interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}
