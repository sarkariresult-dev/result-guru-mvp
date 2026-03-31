'use client'

import { useState, useRef, useActionState } from 'react'
import { updateProfile } from '@/features/dashboard/actions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Camera, Loader2, Trash2, User } from 'lucide-react'

interface Props {
    userId: string
    authUserId: string
    initialName: string
    initialAvatar: string | null
    initialBio: string | null
}

export function ProfileForm({ userId, authUserId, initialName, initialAvatar, initialBio }: Props) {
    const [avatar, setAvatar] = useState(initialAvatar ?? '')
    const [uploading, setUploading] = useState(false)
    const [uploadMsg, setUploadMsg] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    
    // Bind userId to the action for useActionState
    const updateProfileAction = updateProfile.bind(null, userId)
    const [state, formAction, isPending] = useActionState(updateProfileAction, null)

    const handleAvatarUpload = async (file: File) => {
        if (file.size > 2 * 1024 * 1024) {
            setUploadMsg('Error: File too large. Max 2 MB.')
            return
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setUploadMsg('Error: Only JPG, PNG, WebP allowed.')
            return
        }

        setUploading(true)
        setUploadMsg('')
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop() || 'jpg'
            const fileName = `avatar-${Date.now()}.${ext}`
            const filePath = `${authUserId}/${fileName}`

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
                setUploadMsg(`Error: ${uploadError.message}`)
                return
            }

            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatar(urlData.publicUrl)
        } catch (err: any) {
            setUploadMsg(`Error: ${err.message || 'Upload failed'}`)
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

    return (
        <form action={formAction} className="space-y-8">
            {/* Hidden field to pass avatar_url to formData */}
            <input type="hidden" name="avatar_url" value={avatar} />

            {/* Avatar Upload */}
            <div className="flex items-start gap-6">
                <div className="relative group shrink-0">
                    {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dynamic avatar from Supabase Storage
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
                            disabled={uploading || isPending}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-background-subtle transition-colors disabled:opacity-50"
                        >
                            {uploading ? 'Uploading…' : 'Change Photo'}
                        </button>
                        {avatar && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                disabled={isPending}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="inline size-3 mr-1" />Remove
                            </button>
                        )}
                    </div>
                    {uploadMsg && <p className="text-xs font-medium text-rose-500">{uploadMsg}</p>}
                </div>
            </div>

            {/* Name Field */}
            <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Display Name</label>
                <Input id="name" name="name" defaultValue={initialName} required placeholder="Your name" disabled={isPending} />
                <p className="mt-1 text-xs text-foreground-subtle">This name will be shown as the author on your posts.</p>
            </div>

            {/* Bio Field */}
            <div>
                <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">Short Bio</label>
                <textarea
                    id="bio"
                    name="bio"
                    defaultValue={initialBio ?? ''}
                    rows={3}
                    maxLength={300}
                    placeholder="Tell us a bit about your expertise..."
                    disabled={isPending}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-subtle focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-foreground-subtle">A short biography for your public profile. Max 300 characters.</p>
            </div>

            {/* Email (read-only info) */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground-muted">Email</label>
                <p className="text-sm text-foreground-subtle">Managed by your login provider. Contact admin to change.</p>
            </div>

            {state?.message && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{state.message}</p>
            )}
            {state?.error && (
                <p className="text-sm font-medium text-rose-500">{state.error}</p>
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
