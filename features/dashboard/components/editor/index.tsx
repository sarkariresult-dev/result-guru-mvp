'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { getEditorExtensions } from './extensions'
import { SlashCommandExtension } from './slash-command'
import { LinkModal, ImageModal, TableSizePicker } from './modals'
import { EditorToolbar, TableControls, BubbleToolbar, TableBubbleMenu } from './toolbar'
import { SlashMenu } from './SlashMenu'
import { Save } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────

interface TiptapEditorProps {
    content: string
    onChange: (html: string) => void
    placeholder?: string
    uploadBucket?: string
    uploadFolder?: string
    onAutoSave?: (html: string) => void
    autoSaveInterval?: number
}

// ─── Main Editor Component ──────────────────────────────────

export function TiptapEditor({
    content,
    onChange,
    placeholder = 'Start writing your post... Type "/" for commands',
    uploadBucket = 'posts',
    uploadFolder = '',
    onAutoSave,
    autoSaveInterval = 30000,
}: TiptapEditorProps) {
    // UI state
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)
    const [showTablePicker, setShowTablePicker] = useState(false)
    const [linkData, setLinkData] = useState<{ url: string; title: string } | undefined>()

    // Slash command state
    const [slashMenuActive, setSlashMenuActive] = useState(false)
    const [slashQuery, setSlashQuery] = useState('')
    const [slashCoords, setSlashCoords] = useState({ left: 0, top: 0, bottom: 0 })

    // Auto-save state
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastSavedContent = useRef(content)

    // Internal update tracking to distinguish typing from external content changes
    const isInternalUpdate = useRef(false)

    // Build extensions with slash command hooks
    const extensions = useMemo(() => [
        ...getEditorExtensions(placeholder),
        SlashCommandExtension.configure({
            onActivate: (query: string, coords: { left: number; top: number; bottom: number }) => {
                setSlashQuery(query)
                setSlashCoords(coords)
                setSlashMenuActive(true)
            },
            onDeactivate: () => {
                setSlashMenuActive(false)
                setSlashQuery('')
            },
        }),
    ], [placeholder])

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        content,
        onUpdate: ({ editor: e }) => {
            isInternalUpdate.current = true
            const html = e.getHTML()
            onChange(html)
            setIsDirty(true)

            // Reset auto-save timer on each change
            if (onAutoSave && autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current)
            }
            if (onAutoSave) {
                autoSaveTimer.current = setTimeout(() => {
                    if (html !== lastSavedContent.current) {
                        onAutoSave(html)
                        lastSavedContent.current = html
                        setLastSavedAt(new Date())
                        setIsDirty(false)
                    }
                }, autoSaveInterval)
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none px-5 py-4 min-h-[400px] focus:outline-none ' +
                    'prose-headings:tracking-tight prose-a:text-brand-600 ' +
                    'prose-code:before:content-none prose-code:after:content-none ' +
                    'prose-pre:bg-gray-900 prose-pre:text-gray-100 ' +
                    'prose-img:rounded-lg prose-img:mx-auto ' +
                    'prose-table:border-collapse prose-th:bg-background-subtle ' +
                    'prose-td:border prose-td:border-border prose-td:p-2 ' +
                    'prose-th:border prose-th:border-border prose-th:p-2',
            },
            // Clean up pasted content - strip Word/Google Docs junk
            handlePaste(view, event) {
                const html = event.clipboardData?.getData('text/html')
                return false // Let TipTap handle the paste (TipTap has its own cleanup)
            },
        },
    })

    // ── Sync external content changes (e.g. AI load) ──
    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false
            return
        }
        const currentHTML = editor.getHTML()
        if (content !== currentHTML) {
            editor.commands.setContent(content, { emitUpdate: false })
        }
    }, [content, editor])

    // ── Cleanup auto-save timer ──
    useEffect(() => {
        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        }
    }, [])

    // ── Link handlers ──
    const openLinkModal = useCallback(() => {
        if (!editor) return
        const attrs = editor.getAttributes('link')
        if (attrs.href) {
            setLinkData({ url: attrs.href, title: attrs.title ?? '' })
        } else {
            setLinkData(undefined)
        }
        setShowLinkModal(true)
    }, [editor])

    const handleLinkSubmit = useCallback(
        ({ url, title }: { url: string; title: string }) => {
            if (!editor) return
            editor.chain().focus().extendMarkRange('link').setLink({ href: url, title: title || undefined }).run()
            setShowLinkModal(false)
        },
        [editor],
    )

    const removeLink = useCallback(() => {
        if (!editor) return
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }, [editor])

    // ── Image handler ──
    const handleImageInsert = useCallback(
        ({ url, alt }: { url: string; alt: string }) => {
            if (!editor) return
            editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run()
            setShowImageModal(false)
        },
        [editor],
    )

    // ── Table handler ──
    const handleTableInsert = useCallback(
        (rows: number, cols: number) => {
            if (!editor) return
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
            setShowTablePicker(false)
        },
        [editor],
    )

    // ── Manual save ──
    const handleManualSave = useCallback(() => {
        if (!editor || !onAutoSave) return
        const html = editor.getHTML()
        onAutoSave(html)
        lastSavedContent.current = html
        setLastSavedAt(new Date())
        setIsDirty(false)
    }, [editor, onAutoSave])

    if (!editor) return null

    // ── Stats ──
    const chars = editor.storage.characterCount?.characters() ?? 0
    const words = editor.storage.characterCount?.words() ?? 0
    const readingTime = Math.max(1, Math.ceil(words / 200))

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <>
                {/* Toolbar */}
                <EditorToolbar
                    editor={editor}
                    onLinkClick={openLinkModal}
                    onImageClick={() => setShowImageModal(true)}
                    onTableClick={() => setShowTablePicker(!showTablePicker)}
                    onRemoveLink={removeLink}
                />

                {/* Table size picker (absolute positioned) */}
                {showTablePicker && (
                    <div className="relative">
                        <div className="absolute right-2 top-0 z-30">
                            <TableSizePicker
                                onSelect={handleTableInsert}
                                onClose={() => setShowTablePicker(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Table Controls */}
                <TableControls editor={editor} />

                {/* Bubble menu for text selection */}
                <BubbleMenu
                    editor={editor}
                    options={{ placement: 'top', offset: { mainAxis: 10, crossAxis: 0 } }}
                    shouldShow={({ editor: e, from, to }) => {
                        // Only show when there's a text selection
                        if (from === to) return false
                        // Don't show if we're in a table or other specialized blocks
                        if (e.isActive('table')) return false
                        if (e.isActive('image')) return false
                        if (e.isActive('codeBlock')) return false
                        return true
                    }}
                >
                    <BubbleToolbar editor={editor} onLinkClick={openLinkModal} />
                </BubbleMenu>

                {/* Bubble menu for tables */}
                <BubbleMenu
                    editor={editor}
                    options={{ placement: 'top', offset: { mainAxis: 15, crossAxis: 0 } }}
                    shouldShow={({ editor: e }) => {
                        return e.isActive('table')
                    }}
                >
                    <TableBubbleMenu editor={editor} />
                </BubbleMenu>

                {/* Editor Content */}
                <EditorContent editor={editor} />

                {/* Slash Command Menu */}
                {slashMenuActive && (
                    <SlashMenu
                        editor={editor}
                        query={slashQuery}
                        coords={slashCoords}
                        onClose={() => {
                            setSlashMenuActive(false)
                            setSlashQuery('')
                        }}
                        onImageClick={() => {
                            setSlashMenuActive(false)
                            setShowImageModal(true)
                        }}
                        onTableClick={() => {
                            setSlashMenuActive(false)
                            setShowTablePicker(true)
                        }}
                    />
                )}
            </>

            {/* ── Status bar ── */}
            <div className="flex items-center justify-between border-t border-border bg-background-subtle px-4 py-1.5 text-xs text-foreground-subtle">
                <div className="flex items-center gap-3">
                    <span>{words.toLocaleString()} words</span>
                    <span>{chars.toLocaleString()} characters</span>
                    <span>~{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                    {editor.isActive('codeBlock') && (
                        <span className="rounded bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-mono">
                            Code Block
                        </span>
                    )}
                    {editor.isActive('table') && (
                        <span className="rounded bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                            Table
                        </span>
                    )}
                    <span>HTML</span>
                </div>
            </div>

            {/* ── Modals ── */}
            {showLinkModal && (
                <LinkModal initial={linkData} onSubmit={handleLinkSubmit} onCancel={() => setShowLinkModal(false)} />
            )}
            {showImageModal && (
                <ImageModal
                    uploadBucket={uploadBucket}
                    uploadFolder={uploadFolder}
                    onSubmit={handleImageInsert}
                    onCancel={() => setShowImageModal(false)}
                />
            )}
        </div>
    )
}
