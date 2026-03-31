import { cn } from '@/lib/utils'
import Image from 'next/image'
interface AvatarProps {
    src?: string | null
    alt?: string
    fallback?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
}

const sizeMap = { xs: 'size-7', sm: 'size-8', md: 'size-10', lg: 'size-14' }
const pxMap = { xs: 28, sm: 32, md: 40, lg: 56 }

export function Avatar({ src, alt = 'Avatar', fallback, size = 'md', className }: AvatarProps) {
    const initials = fallback?.slice(0, 2).toUpperCase() ?? '?'

    if (!src) {
        return (
            <div
                className={cn(
                    'inline-flex items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
                    sizeMap[size],
                    className
                )}
                aria-label={alt}
            >
                {initials}
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={pxMap[size]}
            height={pxMap[size]}
            className={cn('rounded-full object-cover', sizeMap[size], className)}
            unoptimized
        />
    )
}
