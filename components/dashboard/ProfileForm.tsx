'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/users'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Camera, Loader2, Trash2, User } from 'lucide-react'

interface Props {
    userId: string
    authUserId: string
    initialName: string
    initialAvatar: string | null
}

export function ProfileForm({ userId, authUserId, initialName, initialAvatar }: Props) {
    const [name, setName] = useState(initialName)
    const [avatar, setAvatar] = useState(initialAvatar ?? '')
    const [uploading, setUploading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleAvatarUpload = async (file: File) => {
        if (file.size > 2 * 1024 * 1024) {
            setMessage('Error: File too large. Max 2 MB.')
            return
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setMessage('Error: Only JPG, PNG, WebP allowed.')
            return
        }

        setUploading(true)
        setMessage('')
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop() || 'jpg'
            const fileName = `avatar-${Date.now()}.${ext}`
            const filePath = `${authUserId}/${fileName}`

            // Delete old avatar if exists
            if (avatar) {
                const parts = avatar.split('/storage/v1/object/public/avatars/')
                if (parts[1]) {
                    await supabase.storage.from('avatars').remove([parts[1]])
                }
            }

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true })

            if (uploadError) {
                setMessage(`Error: ${uploadError.message}`)
                return
            }

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatar(urlData.publicUrl)
        } catch (err: any) {
            setMessage(`Error: ${err.message || 'Upload failed'}`)
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (avatar) {
            try {
                const supabase = createClient()
                const parts = avatar.split('/storage/v1/object/public/avatars/')
                if (parts[1]) {
                    await supabase.storage.from('avatars').remove([parts[1]])
                }
            } catch { /* silent */ }
        }
        setAvatar('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        startTransition(async () => {
            const result = await updateProfile(userId, { name, avatar_url: avatar || null })
            if (result.error) setMessage(`Error: ${result.error}`)
            else {
                setMessage('Profile updated!')
                router.refresh()
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex items-start gap-6">
                <div className="relative group shrink-0">
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="size-20 rounded-full object-cover ring-2 ring-border" />
                    ) : (
                        <div className="flex size-20 items-center justify-center rounded-full bg-brand-100 ring-2 ring-border dark:bg-brand-900/30">
                            <User className="size-8 text-brand-600 dark:text-brand-400" />
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileRef.current?.click()}>
                        {uploading
                            ? <Loader2 className="size-5 animate-spin text-white" />
                            : <Camera className="size-5 text-white" />
                        }
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleAvatarUpload(file)
                            e.target.value = ''
                        }}
                    />
                </div>

                <div className="flex-1 space-y-1.5 pt-1">
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-foreground-subtle">JPG, PNG, or WebP. Max 2 MB.</p>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-background-subtle transition-colors disabled:opacity-50"
                        >
                            {uploading ? 'Uploading…' : 'Change Photo'}
                        </button>
                        {avatar && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Trash2 className="inline size-3 mr-1" />Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Name Field */}
            <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Display Name</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
                <p className="mt-1 text-xs text-foreground-subtle">This name will be shown as the author on your posts.</p>
            </div>

            {/* Email (read-only info) */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground-muted">Email</label>
                <p className="text-sm text-foreground-subtle">Managed by your login provider. Contact admin to change.</p>
            </div>

            {message && (
                <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                </p>
            )}

            <div className="flex items-center gap-3 border-t border-border pt-6">
                <Button type="submit" disabled={isPending || uploading}>
                    {isPending ? 'Saving…' : 'Save Changes'}
                </Button>
                <span className="text-xs text-foreground-subtle">Changes will appear across the site.</span>
            </div>
        </form>
    )
}
