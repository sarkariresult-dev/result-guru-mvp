import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
    className?: string
}

export function Pagination({ currentPage, totalPages, basePath, className }: PaginationProps) {
    if (totalPages <= 1) return null

    const pages: (number | 'ellipsis')[] = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i)
        } else if (pages[pages.length - 1] !== 'ellipsis') {
            pages.push('ellipsis')
        }
    }

    const href = (page: number) =>
        page === 1 ? basePath : `${basePath}?page=${page}`

    return (
        <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
            {currentPage > 1 && (
                <Link
                    href={href(currentPage - 1)}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-subtle"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                </Link>
            )}

            {pages.map((page, i) =>
                page === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-foreground-subtle">…</span>
                ) : (
                    <Link
                        key={page}
                        href={href(page)}
                        className={cn(
                            'inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                            page === currentPage
                                ? 'bg-brand-600 text-white'
                                : 'text-foreground-muted hover:bg-background-subtle'
                        )}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </Link>
                )
            )}

            {currentPage < totalPages && (
                <Link
                    href={href(currentPage + 1)}
                    className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-subtle"
                    aria-label="Next page"
                >
                    <ChevronRight className="size-4" />
                </Link>
            )}
        </nav>
    )
}
