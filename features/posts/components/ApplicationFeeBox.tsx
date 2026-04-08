import { IndianRupee } from 'lucide-react'

export function ApplicationFeeBox({ fees }: { fees: Record<string, string> }) {
    // Filter out entries with empty/null values
    const entries = Object.entries(fees).filter(([, v]) => v != null && String(v).trim() !== '')
    if (entries.length === 0) return null

    // Keys that should show ₹ prefix (fee amounts)
    const isMonetary = (key: string, value: string) => {
        const lk = key.toLowerCase()
        if (lk.includes('mode') || lk.includes('note') || lk.includes('refund')) return false
        // Check if value looks numeric or starts with a number
        return /^\d/.test(String(value).trim()) || String(value).toLowerCase() === 'exempted' || String(value).toLowerCase() === 'nil' || String(value) === '0'
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-border bg-background-muted/50 px-6 py-4">
                <div className="icon-badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <IndianRupee className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Application Fee</h2>
            </div>
            <div className="divide-y divide-border/60">
                {entries.map(([key, value], index) => (
                    <div
                        key={key}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4 transition-colors hover:bg-background-subtle ${index % 2 === 0 ? 'bg-surface' : 'bg-background-muted/20'}`}
                    >
                        <span className="text-sm font-medium text-foreground-muted sm:max-w-[60%]">{key}</span>
                        <span className="text-sm font-bold text-foreground sm:text-right">
                            {isMonetary(key, value) && /^\d/.test(String(value).trim()) ? `₹${value}` : value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
