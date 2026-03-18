import type { ApplicationStatus } from '@/types/enums'

const BANNER_CONFIG: Record<ApplicationStatus, { bg: string; text: string; label: string; icon: string }> = {
    upcoming: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-300', label: 'Applications opening soon', icon: '📅' },
    open: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', label: 'Applications are OPEN', icon: '🟢' },
    closing_soon: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-300', label: 'Applications closing soon!', icon: '⚠️' },
    closed: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', label: 'Applications CLOSED', icon: '🔴' },
    result_out: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-300', label: 'Result is OUT', icon: '📋' },
    na: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400', label: '', icon: '' },
}

export function ApplicationStatusBanner({ status }: { status: string }) {
    const c = BANNER_CONFIG[status as ApplicationStatus]
    if (!c || status === 'na' || !c.label) return null

    return (
        <div className={`flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold ${c.bg} ${c.text}`} role="status">
            <span aria-hidden="true">{c.icon}</span>
            {c.label}
        </div>
    )
}
