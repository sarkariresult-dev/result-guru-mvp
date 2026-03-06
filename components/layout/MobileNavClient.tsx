'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { MobileNav } from './MobileNav'
import type { PublicUser } from '@/types/user.types'

interface MobileNavClientProps {
    initialUser?: PublicUser | null
}

export function MobileNavClient({ initialUser }: MobileNavClientProps) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted lg:hidden"
                aria-label="Open menu"
            >
                <Menu className="size-5" />
            </button>
            <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} initialUser={initialUser} />
        </>
    )
}
