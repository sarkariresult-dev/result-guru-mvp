'use client'

import { useState, useTransition } from 'react'
import { updateSeoSetting } from '@/lib/actions/seo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { SeoSetting } from '@/lib/queries/seo'

interface Props {
    settings: SeoSetting[]
}

export function SeoSettingsForm({ settings }: Props) {
    const [values, setValues] = useState<Record<string, string>>(
        Object.fromEntries(settings.map((s) => [s.key, s.value ?? '']))
    )
    const [isPending, startTransition] = useTransition()
    const [saved, setSaved] = useState<string | null>(null)

    const handleSave = (key: string) => {
        startTransition(async () => {
            const result = await updateSeoSetting(key, values[key] ?? '')
            if (result.success) setSaved(key)
            setTimeout(() => setSaved(null), 2000)
        })
    }

    return (
        <div className="divide-y divide-border">
            {settings.map((setting) => (
                <div key={setting.key} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{setting.key}</p>
                        <p className="truncate text-xs text-foreground-subtle">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:w-80">
                        <Input
                            value={values[setting.key] ?? ''}
                            onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
                            className="text-sm"
                        />
                        <Button size="sm" onClick={() => handleSave(setting.key)} disabled={isPending}>
                            {saved === setting.key ? '✓' : 'Save'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
