import { cn } from '@/lib/utils'

export function Tooltip({ children, text, className }: { children: React.ReactNode; text: string; className?: string }) {
    return (
        <span className={cn('group relative inline-flex', className)}>
            {children}
            <span className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {text}
            </span>
        </span>
    )
}
