'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    X, Check, Upload, Loader2,
    LinkIcon, ImageIcon,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────

const inputCls =
    'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none'

const btnSecondary =
    'rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-background-subtle'

const btnPrimary =
    'rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1.5'

// ─── Link Modal ─────────────────────────────────────────────

interface LinkModalProps {
    initial?: { url: string; title: string }
    onSubmit: (data: { url: string; title: string }) => void
    onCancel: () => void
}

export function LinkModal({ initial, onSubmit, onCancel }: LinkModalProps) {
    const [url, setUrl] = useState(initial?.url ?? '')
    const [title, setTitle] = useState(initial?.title ?? '')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
            <div
                className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <LinkIcon className="size-5 text-brand-500" /> Insert Link
                    </h3>
                    <button type="button" onClick={onCancel} className="rounded-lg p-1 hover:bg-background-subtle">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-foreground-muted">URL *</label>
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.example.com"
                            className={inputCls}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-foreground-muted">
                            Link Title (for accessibility)
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Official Website"
                            className={inputCls}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onCancel} className={btnSecondary}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => url && onSubmit({ url, title })}
                            disabled={!url}
                            className={btnPrimary}
                        >
                            <Check className="size-4" /> Insert Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Image Upload Modal ─────────────────────────────────────

interface ImageModalProps {
    uploadBucket: string
    uploadFolder: string
    onSubmit: (data: { url: string; alt: string }) => void
    onCancel: () => void
}

export function ImageModal({ uploadBucket, uploadFolder, onSubmit, onCancel }: ImageModalProps) {
    const [url, setUrl] = useState('')
    const [alt, setAlt] = useState('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Max 5 MB.')
            return
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            setError('Only JPG, PNG, WebP, GIF allowed.')
            return
        }
        setUploading(true)
        setError('')
        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop() || 'jpg'
            const fileName = `content-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
            const filePath = `${uploadFolder}/${fileName}`
            const { error: uploadError } = await supabase.storage
                .from(uploadBucket)
                .upload(filePath, file, { cacheControl: '31536000' })
            if (uploadError) {
                setError(uploadError.message)
                return
            }
            const { data } = supabase.storage.from(uploadBucket).getPublicUrl(filePath)
            setUrl(data.publicUrl)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
            <div
                className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <ImageIcon className="size-5 text-brand-500" /> Insert Image
                    </h3>
                    <button type="button" onClick={onCancel} className="rounded-lg p-1 hover:bg-background-subtle">
                        <X className="size-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Upload area */}
                    <div
                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors
                            ${dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : 'border-border hover:border-brand-300'}
                            ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault()
                            setDragOver(false)
                            const f = e.dataTransfer.files[0]
                            if (f) handleFile(f)
                        }}
                    >
                        {uploading ? (
                            <Loader2 className="size-8 animate-spin text-brand-500" />
                        ) : (
                            <>
                                <Upload className="size-8 text-foreground-subtle" />
                                <p className="text-sm text-foreground-muted">
                                    <span className="font-medium text-brand-600">Click to upload</span> or drag &amp;
                                    drop
                                </p>
                                <p className="text-[10px] text-foreground-subtle">JPG, PNG, WebP, GIF - max 5 MB</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFile(f)
                            e.target.value = ''
                        }}
                    />

                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-foreground-subtle">OR</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* URL & Alt inputs */}
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Image URL</label>
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">
                                Alt Text (SEO &amp; Accessibility)
                            </label>
                            <input
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Describe the image..."
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onCancel} className={btnSecondary}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => url && onSubmit({ url, alt })}
                            disabled={!url}
                            className={btnPrimary}
                        >
                            <Check className="size-4" /> Insert Image
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            </div>
        </div>
    )
}

// ─── Table Size Picker ──────────────────────────────────────

interface TableSizePickerProps {
    onSelect: (rows: number, cols: number) => void
    onClose: () => void
}

export function TableSizePicker({ onSelect, onClose }: TableSizePickerProps) {
    const [hover, setHover] = useState({ r: 0, c: 0 })
    const maxR = 6
    const maxC = 6

    return (
        <div
            className="absolute right-0 top-full z-30 mt-1 rounded-lg border border-border bg-surface p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
        >
            <p className="mb-2 text-xs font-medium text-foreground-muted">
                {hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Select size'}
            </p>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxC}, 1fr)` }}>
                {Array.from({ length: maxR * maxC }, (_, i) => {
                    const r = Math.floor(i / maxC) + 1
                    const c = (i % maxC) + 1
                    const active = r <= hover.r && c <= hover.c
                    return (
                        <div
                            key={i}
                            className={`size-5 rounded-sm border cursor-pointer transition-colors ${active ? 'border-brand-500 bg-brand-500/20' : 'border-border hover:border-brand-300'
                                }`}
                            onMouseEnter={() => setHover({ r, c })}
                            onClick={() => {
                                onSelect(r, c)
                                onClose()
                            }}
                        />
                    )
                })}
            </div>
        </div>
    )
}
