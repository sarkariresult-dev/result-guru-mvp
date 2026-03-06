import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
    'flex gap-3 rounded-lg border p-4 text-sm',
    {
        variants: {
            variant: {
                info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
                success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300',
                warning: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
                error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300',
            },
        },
        defaultVariants: { variant: 'info' },
    }
)

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle }

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
    title?: string
}

export function Alert({ variant, title, children, className, ...props }: AlertProps) {
    const Icon = icons[variant ?? 'info']
    return (
        <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
            <Icon className="mt-0.5 size-5 shrink-0" />
            <div>
                {title && <p className="mb-1 font-medium">{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    )
}
