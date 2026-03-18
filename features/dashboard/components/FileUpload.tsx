'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'

interface FileUploadProps {
    bucket: string
    folder: string // e.g. user's ID
    value: string
    onChange: (url: string) => void
    accept?: string
    maxSizeMB?: number
    label?: string
    hint?: string
    preview?: 'image' | 'pdf' | 'none'
}

export function FileUpload({
    bucket,
    folder,
    value,
    onChange,
    accept = 'image/jpeg,image/png,image/webp',
    maxSizeMB = 5,
    label,
    hint,
    preview = 'image',
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        setError(null)

        // Size check
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File too large. Max ${maxSizeMB} MB.`)
            return
        }

        // Type check
        const allowed = accept.split(',').map(t => t.trim())
        if (!allowed.includes(file.type)) {
            setError(`Invalid file type. Allowed: ${allowed.join(', ')}`)
            return
        }

        setUploading(true)
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop() || 'jpg'
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
            const filePath = `${folder}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { cacheControl: '3600', upsert: false })

            if (uploadError) {
                setError(uploadError.message)
                return
            }

            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
            onChange(urlData.publicUrl)
        } catch (err: any) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleRemove = async () => {
        if (value) {
            // Extract path from public URL and delete from storage
            try {
                const supabase = createClient()
                const urlParts = value.split(`/storage/v1/object/public/${bucket}/`)
                if (urlParts[1]) {
                    await supabase.storage.from(bucket).remove([urlParts[1]])
                }
            } catch {
                // Silently fail - file might not exist
            }
        }
        onChange('')
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    {label}
                </label>
            )}

            {value ? (
                <div className="relative group">
                    {preview === 'image' ? (
                        <div className="relative overflow-hidden rounded-lg border border-border">
                            <img src={value} alt="Uploaded" className="h-40 w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={handleRemove} className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors">
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>
                    ) : preview === 'pdf' ? (
                        <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-surface">
                            <FileText className="size-8 text-brand-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{value.split('/').pop()}</p>
                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline">
                                    View PDF ↗
                                </a>
                            </div>
                            <button type="button" onClick={handleRemove} className="rounded-full p-1 text-foreground-subtle hover:text-red-500 hover:bg-red-50 transition-colors">
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-surface">
                            <p className="truncate text-sm flex-1">{value}</p>
                            <button type="button" onClick={handleRemove} className="text-foreground-subtle hover:text-red-500">
                                <X className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer
                        ${dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-border hover:border-brand-300 hover:bg-background-subtle'}
                        ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    {uploading ? (
                        <Loader2 className="size-6 animate-spin text-brand-500" />
                    ) : (
                        <>
                            {preview === 'image' ? <ImageIcon className="size-6 text-foreground-subtle" /> : <Upload className="size-6 text-foreground-subtle" />}
                            <p className="text-xs text-foreground-muted">
                                <span className="font-medium text-brand-600">Click to upload</span> or drag & drop
                            </p>
                            {hint && <p className="text-[10px] text-foreground-subtle">{hint}</p>}
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = '' // reset so same file can be re-selected
                }}
            />

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
