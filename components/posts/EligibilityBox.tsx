import { GraduationCap } from 'lucide-react'

interface Props {
    eligibility: Record<string, unknown>
}

export function EligibilityBox({ eligibility }: Props) {
    if (!eligibility || Object.keys(eligibility).length === 0) return null

    // Format key to human-readable label
    const formatKey = (key: string) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
    }

    // Flatten eligibility into display rows
    // Handles nested objects (like age_limits, age_relaxation) by expanding them
    const rows: Array<{ label: string; value: string; indent?: boolean }> = []

    for (const [key, value] of Object.entries(eligibility)) {
        if (value == null || String(value).trim() === '') continue

        // Skip age_min/age_max/age_relaxation — handled by AgeLimitBox
        if (['age_min', 'age_max', 'age_relaxation'].includes(key)) continue

        if (Array.isArray(value)) {
            // Arrays → comma-separated
            const joined = value.filter(v => v != null && String(v).trim() !== '').join(', ')
            if (joined) rows.push({ label: formatKey(key), value: joined })
        } else if (typeof value === 'object' && value !== null) {
            // Nested objects → section header + sub-rows
            const obj = value as Record<string, unknown>
            const subEntries = Object.entries(obj).filter(([, v]) => v != null && String(v).trim() !== '')
            if (subEntries.length > 0) {
                rows.push({ label: formatKey(key), value: '' }) // section header
                for (const [subKey, subVal] of subEntries) {
                    rows.push({ label: formatKey(subKey), value: String(subVal), indent: true })
                }
            }
        } else {
            rows.push({ label: formatKey(key), value: String(value) })
        }
    }

    if (rows.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-border bg-background-muted/50 px-6 py-4">
                <div className="icon-badge bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <GraduationCap className="size-4.5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Eligibility Criteria</h3>
            </div>
            <div className="divide-y divide-border/60">
                {rows.map((row, index) => (
                    <div
                        key={`${row.label}-${index}`}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-3.5 transition-colors hover:bg-background-subtle ${index % 2 === 0 ? 'bg-surface' : 'bg-background-muted/20'
                            } ${row.indent ? 'pl-10' : ''}`}
                    >
                        <span className={`text-sm font-medium ${row.value === '' ? 'text-foreground font-semibold' : 'text-foreground-muted'} sm:max-w-[45%]`}>
                            {row.label}
                        </span>
                        {row.value && (
                            <span className="text-sm font-bold text-foreground sm:text-right sm:max-w-[55%]">
                                {row.value}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
