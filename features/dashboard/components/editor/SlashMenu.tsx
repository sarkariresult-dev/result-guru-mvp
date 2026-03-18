'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import type { SlashCommandItem } from './slash-command'
import {
    Heading1, Heading2, Heading3, Heading4,
    List, ListOrdered, Quote, Minus, Code2,
    ImageIcon, Table as TableIcon,
    FileCode, Highlighter, Type,
} from 'lucide-react'

// ─── Build slash command items ──────────────────────────────

function buildSlashItems(
    editor: Editor,
    onImageClick: () => void,
    onTableClick: () => void,
): SlashCommandItem[] {
    return [
        {
            title: 'Heading 1',
            description: 'Large section heading',
            icon: <Heading1 className="size-4" />,
            group: 'Headings',
            aliases: ['h1', 'heading1'],
            command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading',
            icon: <Heading2 className="size-4" />,
            group: 'Headings',
            aliases: ['h2', 'heading2'],
            command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            title: 'Heading 3',
            description: 'Small section heading',
            icon: <Heading3 className="size-4" />,
            group: 'Headings',
            aliases: ['h3', 'heading3'],
            command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
            title: 'Heading 4',
            description: 'Subsection heading',
            icon: <Heading4 className="size-4" />,
            group: 'Headings',
            aliases: ['h4', 'heading4'],
            command: (e) => e.chain().focus().toggleHeading({ level: 4 }).run(),
        },
        {
            title: 'Paragraph',
            description: 'Plain text paragraph',
            icon: <Type className="size-4" />,
            group: 'Basic',
            aliases: ['text', 'p'],
            command: (e) => e.chain().focus().setParagraph().run(),
        },
        {
            title: 'Bullet List',
            description: 'Unordered list',
            icon: <List className="size-4" />,
            group: 'Lists',
            aliases: ['ul', 'unordered'],
            command: (e) => e.chain().focus().toggleBulletList().run(),
        },
        {
            title: 'Numbered List',
            description: 'Ordered list',
            icon: <ListOrdered className="size-4" />,
            group: 'Lists',
            aliases: ['ol', 'ordered'],
            command: (e) => e.chain().focus().toggleOrderedList().run(),
        },
        {
            title: 'Blockquote',
            description: 'Quote or callout block',
            icon: <Quote className="size-4" />,
            group: 'Basic',
            aliases: ['quote'],
            command: (e) => e.chain().focus().toggleBlockquote().run(),
        },
        {
            title: 'Code Block',
            description: 'Code with syntax highlighting',
            icon: <Code2 className="size-4" />,
            group: 'Basic',
            aliases: ['code', 'pre', 'codeblock'],
            command: (e) => e.chain().focus().toggleCodeBlock().run(),
        },
        {
            title: 'Horizontal Rule',
            description: 'Divider line',
            icon: <Minus className="size-4" />,
            group: 'Basic',
            aliases: ['hr', 'divider', 'separator'],
            command: (e) => e.chain().focus().setHorizontalRule().run(),
        },
        {
            title: 'Highlight',
            description: 'Highlight selected text',
            icon: <Highlighter className="size-4" />,
            group: 'Inline',
            aliases: ['mark', 'bg'],
            command: (e) => e.chain().focus().toggleHighlight().run(),
        },
        {
            title: 'Image',
            description: 'Upload or embed an image',
            icon: <ImageIcon className="size-4" />,
            group: 'Media',
            aliases: ['img', 'picture', 'photo'],
            command: () => onImageClick(),
        },
        {
            title: 'Table',
            description: 'Insert a data table',
            icon: <TableIcon className="size-4" />,
            group: 'Media',
            aliases: ['grid'],
            command: () => onTableClick(),
        },
    ]
}

// ─── Slash Command Menu Component ───────────────────────────

interface SlashMenuProps {
    editor: Editor
    query: string
    coords: { left: number; top: number; bottom: number }
    onClose: () => void
    onImageClick: () => void
    onTableClick: () => void
}

export function SlashMenu({ editor, query, coords, onClose, onImageClick, onTableClick }: SlashMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const menuRef = useRef<HTMLDivElement>(null)

    const allItems = useMemo(
        () => buildSlashItems(editor, onImageClick, onTableClick),
        [editor, onImageClick, onTableClick],
    )

    // Filter items by query
    const items = useMemo(() => {
        if (!query) return allItems
        const q = query.toLowerCase()
        return allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.aliases?.some((a) => a.includes(q)),
        )
    }, [allItems, query])

    // Reset selected index when items change
    useEffect(() => {
        setSelectedIndex(0)
    }, [items.length])

    // Execute a command: delete the slash text first, then run the block command
    const executeCommand = useCallback(
        (item: SlashCommandItem) => {
            // Delete the slash + query text
            const { state } = editor.view
            const { $from } = state.selection
            const textContent = $from.parent.textContent
            const slashIdx = textContent.lastIndexOf('/')
            if (slashIdx >= 0) {
                const start = $from.before($from.depth) + slashIdx + 1
                const end = $from.pos
                editor.chain().focus().deleteRange({ from: start, to: end }).run()
            }
            item.command(editor)
            onClose()
        },
        [editor, onClose],
    )

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((i) => (i + 1) % items.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((i) => (i - 1 + items.length) % items.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (items[selectedIndex]) {
                    executeCommand(items[selectedIndex])
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [items, selectedIndex, executeCommand, onClose])

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [onClose])

    // Scroll selected item into view
    useEffect(() => {
        const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
        el?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])

    if (items.length === 0) {
        return (
            <div
                ref={menuRef}
                className="fixed z-50 w-64 rounded-lg border border-border bg-surface p-3 shadow-xl"
                style={{ left: coords.left, top: coords.bottom + 8 }}
            >
                <p className="text-sm text-foreground-muted">No matching commands</p>
            </div>
        )
    }

    // Group items
    const groups = items.reduce<Record<string, SlashCommandItem[]>>((acc, item) => {
        if (!acc[item.group]) acc[item.group] = []
        acc[item.group]!.push(item)
        return acc
    }, {})

    let globalIdx = 0

    return (
        <div
            ref={menuRef}
            className="fixed z-50 max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-surface shadow-xl"
            style={{ left: coords.left, top: coords.bottom + 8 }}
        >
            {Object.entries(groups).map(([group, groupItems]) => (
                <div key={group}>
                    <div className="sticky top-0 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                        {group}
                    </div>
                    {groupItems.map((item) => {
                        const idx = globalIdx++
                        return (
                            <button
                                key={item.title}
                                type="button"
                                data-index={idx}
                                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                                    idx === selectedIndex
                                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                                        : 'hover:bg-background-subtle'
                                }`}
                                onClick={() => executeCommand(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                            >
                                <span
                                    className={`flex size-8 items-center justify-center rounded-lg border ${
                                        idx === selectedIndex
                                            ? 'border-brand-300 bg-brand-100 dark:border-brand-700 dark:bg-brand-900/30'
                                            : 'border-border bg-background-subtle'
                                    }`}
                                >
                                    {item.icon}
                                </span>
                                <div>
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-xs text-foreground-muted">{item.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
