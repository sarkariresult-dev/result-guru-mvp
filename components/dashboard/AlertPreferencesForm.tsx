'use client'

import { useState, useTransition } from 'react'
import { subscribe } from '@/lib/actions/subscribers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface Props {
    userEmail: string
}

const postTypes = [
    { value: 'job', label: 'Jobs' },
    { value: 'result', label: 'Results' },
    { value: 'admit', label: 'Admit Cards' },
    { value: 'scheme', label: 'Schemes' },
    { value: 'exam', label: 'Exams' },
    { value: 'answer_key', label: 'Answer Keys' },
]

export function AlertPreferencesForm({ userEmail }: Props) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [whatsapp, setWhatsapp] = useState(false)
    const [phone, setPhone] = useState('')
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState('')

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const result = await subscribe({
                email: userEmail,
                whatsapp_opt_in: whatsapp,
                preferences: { post_types: selectedTypes },
                phone: phone || undefined,
            } as any)
            if ('error' in result) setMessage('Failed to save preferences')
            else setMessage('Alert preferences saved!')
            setTimeout(() => setMessage(''), 3000)
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium">Alert Types</label>
                <div className="flex flex-wrap gap-2">
                    {postTypes.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => toggleType(t.value)}
                            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${selectedTypes.includes(t.value)
                                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : 'border-border text-foreground-muted hover:border-brand-300'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="whatsapp"
                    checked={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.checked)}
                    className="size-4 rounded border-border"
                />
                <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp Notifications</label>
            </div>

            {whatsapp && (
                <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone Number</label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
            )}

            {message && (
                <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
            )}

            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Preferences'}
            </Button>
        </form>
    )
}
