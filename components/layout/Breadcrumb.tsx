import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

/**
 * Visual breadcrumb nav. JSON-LD BreadcrumbList is emitted at the page level
 * (e.g. [slug]/page.tsx, [type]/page.tsx) to avoid duplicate structured data.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
            <Link href="/" className="text-foreground-subtle hover:text-foreground transition-colors">
                <Home className="size-3.5" />
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="size-3 text-foreground-subtle" />
                    {item.href && i < items.length - 1 ? (
                        <Link href={item.href} className="text-foreground-subtle hover:text-foreground transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground-muted font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}
