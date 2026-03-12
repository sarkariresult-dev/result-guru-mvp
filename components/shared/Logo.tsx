import Image from 'next/image'

interface LogoProps {
    /** 'full' renders the full wordmark, 'icon' renders the compact RG icon */
    variant?: 'full' | 'icon'
    /** Height in pixels - width auto-scales from the SVG aspect ratio */
    height?: number
    className?: string
    /** Force a specific theme - skips the automatic dark: swap */
    forceDark?: boolean
}

/**
 * Brand logo - renders the correct SVG for light/dark mode.
 *
 * Uses Tailwind `dark:hidden` / `hidden dark:block` to swap logos
 * without any client-side JS.
 *
 * Logo files:
 *  - /logo/logo-light.svg      → light mode full wordmark
 *  - /logo/logo-dark.svg       → dark mode full wordmark
 *  - /logo/logo-light-small.svg → light mode icon
 *  - /logo/logo-dark-small.svg  → dark mode icon
 */
export function Logo({ variant = 'full', height = 40, className = '', forceDark }: LogoProps) {
    const suffix = variant === 'icon' ? '-small' : ''
    const lightSrc = `/logo/logo-light${suffix}.svg`
    const darkSrc = `/logo/logo-dark${suffix}.svg`
    const alt = 'Result Guru'

    // Approximate width from the SVG's 1:1 viewBox (2000x2000) - actual content is wider
    // The SVG preserveAspectRatio will handle sizing; we just need a reasonable width hint
    const width = variant === 'icon' ? height : height * 4

    if (forceDark) {
        return (
            <Image
                src={darkSrc}
                alt={alt}
                width={width}
                height={height}
                className={className}
                priority
            />
        )
    }

    return (
        <>
            {/* Light mode */}
            <Image
                src={lightSrc}
                alt={alt}
                width={width}
                height={height}
                className={`dark:hidden -my-12 ${className}`}
                priority
            />
            {/* Dark mode */}
            <Image
                src={darkSrc}
                alt={alt}
                width={width}
                height={height}
                className={`hidden dark:block -my-12 ${className}`}
                priority
            />
        </>
    )
}
