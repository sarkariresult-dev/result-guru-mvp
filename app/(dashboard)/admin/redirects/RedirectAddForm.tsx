'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createRedirect } from '@/lib/actions/redirects'

export function RedirectAddForm() {
    const formRef = useRef<HTMLFormElement>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = (formData: FormData) => {
        setError(null)
        setSuccess(false)
        startTransition(async () => {
            const result = await createRedirect(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
                formRef.current?.reset()
                setTimeout(() => setSuccess(false), 2000)
            }
        })
    }

    return (
        <form ref={formRef} action={handleSubmit} className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Add New Redirect</h2>
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-foreground-muted">From Path</label>
                    <input
                        name="from_path"
                        placeholder="/old-url"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-foreground-subtle focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-foreground-muted">To Path</label>
                    <input
                        name="to_path"
                        placeholder="/new-url"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-foreground-subtle focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                </div>
                <div className="w-24">
                    <label className="mb-1 block text-xs font-medium text-foreground-muted">Type</label>
                    <select
                        name="type"
                        defaultValue="301"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                        <option value="301">301</option>
                        <option value="302">302</option>
                        <option value="410">410</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                    <Plus className="size-4" />
                    {isPending ? 'Adding…' : 'Add'}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
            )}
            {success && (
                <p className="text-xs text-green-600 font-medium">Redirect added successfully!</p>
            )}
        </form>
    )
}
