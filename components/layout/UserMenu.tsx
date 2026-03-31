'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { LogOut, User as UserIcon, LayoutDashboard, Loader2 } from 'lucide-react'
import { signOut } from '@/features/auth/actions'
import { Dropdown } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'

interface UserMenuProps {
    user: {
        id: string
        email?: string
        user_metadata?: {
            full_name?: string
            avatar_url?: string
        }
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isPending, startTransition] = useTransition()

    const handleSignOut = () => {
        startTransition(async () => {
            await signOut()
        })
    }

    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const avatarUrl = user.user_metadata?.avatar_url

    const trigger = (
        <button className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface pl-3 pr-1 shadow-sm transition-colors hover:bg-background-subtle">
            <span className="max-w-25 truncate text-sm font-medium text-foreground hidden sm:block">
                {name}
            </span>
            <Avatar src={avatarUrl} alt={name} fallback={name} size="xs" className="ring-1 ring-border" />
        </button>
    )

    return (
        <Dropdown trigger={trigger} align="right" className="w-48">
            <div className="px-4 py-3 border-b border-border">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                <p className="truncate text-xs text-foreground-subtle">{user.email}</p>
            </div>

            <div className="py-1">
                <Link href="/author" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-background-subtle transition-colors">
                    <LayoutDashboard className="size-4 text-foreground-muted" />
                    Dashboard
                </Link>
                <Link href="/author/profile" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-background-subtle transition-colors">
                    <UserIcon className="size-4 text-foreground-muted" />
                    Profile
                </Link>
            </div>

            <div className="border-t border-border py-1">
                <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <LogOut className="size-4" />
                    )}
                    {isPending ? 'Signing out…' : 'Log out'}
                </button>
            </div>
        </Dropdown>
    )
}
