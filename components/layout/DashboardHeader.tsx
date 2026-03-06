import { Bell, Menu } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import type { PublicUser } from '@/types/user.types'

interface Props {
    user: PublicUser
    /** Fires when the mobile hamburger menu is tapped */
    onMenuToggle?: () => void
}

export function DashboardHeader({ user, onMenuToggle }: Props) {
    const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:h-16 sm:px-6">
            {/* Left side: hamburger + title */}
            <div className="flex items-center gap-3">
                {onMenuToggle && (
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground lg:hidden"
                        aria-label="Toggle sidebar menu"
                    >
                        <Menu className="size-5" />
                    </button>
                )}
                <h1 className="text-base font-semibold text-foreground sm:text-lg">
                    {roleLabel} Dashboard
                </h1>
            </div>

            {/* Right side: actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                    aria-label="Notifications"
                >
                    <Bell className="size-4.5" strokeWidth={1.75} />
                </button>
                <Avatar src={user.avatar_url} fallback={user.name} size="sm" />
            </div>
        </header>
    )
}
