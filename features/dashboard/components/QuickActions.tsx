import Link from 'next/link'
import { Plus, FileText, Upload, Users } from 'lucide-react'

interface QuickAction {
    label: string
    href: string
    icon: React.ElementType
}

const defaultActions: QuickAction[] = [
    { label: 'New Post', href: '/admin/posts/new', icon: Plus },
    { label: 'All Posts', href: '/admin/posts', icon: FileText },
    { label: 'Upload Media', href: '/admin/media', icon: Upload },
    { label: 'Users', href: '/admin/users', icon: Users },
]

export function QuickActions({ actions = defaultActions }: { actions?: QuickAction[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((action) => {
                const Icon = action.icon
                return (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:bg-background-subtle"
                    >
                        <Icon className="size-5 text-brand-600" />
                        <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
