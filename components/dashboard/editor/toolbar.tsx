'use client'

import type { Editor } from '@tiptap/react'
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight,
    Link as LinkIcon, ImageIcon, Table as TableIcon,
    Undo, Redo, Code, Minus, Pilcrow, Highlighter,
    Code2, Superscript, Subscript,
    X,
} from 'lucide-react'

// ─── Toolbar Button ─────────────────────────────────────────

function Btn({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`inline-flex size-8 items-center justify-center rounded-md transition-colors ${
                active
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground'
            } disabled:opacity-40`}
        >
            {children}
        </button>
    )
}

function Divider() {
    return <div className="mx-1 h-6 w-px bg-border" />
}

// ─── Main Toolbar ───────────────────────────────────────────

interface ToolbarProps {
    editor: Editor
    onLinkClick: () => void
    onImageClick: () => void
    onTableClick: () => void
    showTablePicker: boolean
    onRemoveLink: () => void
}

export function EditorToolbar({
    editor,
    onLinkClick,
    onImageClick,
    onTableClick,
    showTablePicker,
    onRemoveLink,
}: ToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background-subtle px-2 py-1.5">
            {/* Undo/Redo */}
            <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
                <Undo className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
                <Redo className="size-4" />
            </Btn>
            <Divider />

            {/* Block type */}
            <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">
                <Pilcrow className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                <Heading1 className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                <Heading2 className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                <Heading3 className="size-4" />
            </Btn>
            <Divider />

            {/* Inline formatting */}
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
                <Bold className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
                <Italic className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
                <UnderlineIcon className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                <Strikethrough className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                <Code className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                <Highlighter className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
                <Superscript className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
                <Subscript className="size-4" />
            </Btn>
            <Divider />

            {/* Lists & Blocks */}
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                <List className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                <ListOrdered className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
                <Quote className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
                <Code2 className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
                <Minus className="size-4" />
            </Btn>
            <Divider />

            {/* Alignment */}
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
                <AlignLeft className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
                <AlignCenter className="size-4" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
                <AlignRight className="size-4" />
            </Btn>
            <Divider />

            {/* Media */}
            <Btn onClick={onLinkClick} active={editor.isActive('link')} title="Insert link">
                <LinkIcon className="size-4" />
            </Btn>
            {editor.isActive('link') && (
                <Btn onClick={onRemoveLink} title="Remove link">
                    <X className="size-3.5 text-red-500" />
                </Btn>
            )}
            <Btn onClick={onImageClick} title="Insert image">
                <ImageIcon className="size-4" />
            </Btn>
            <Btn onClick={onTableClick} title="Insert table">
                <TableIcon className="size-4" />
            </Btn>
        </div>
    )
}

// ─── Table Controls ─────────────────────────────────────────

export function TableControls({ editor }: { editor: Editor }) {
    if (!editor.isActive('table')) return null

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-t border-border bg-brand-50/50 dark:bg-brand-900/10 px-2 py-1.5">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                Table
            </span>
            <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column before">
                <span className="text-[10px] font-bold">+Col←</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after">
                <span className="text-[10px] font-bold">+Col→</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row above">
                <span className="text-[10px] font-bold">+Row↑</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row below">
                <span className="text-[10px] font-bold">+Row↓</span>
            </Btn>
            <Divider />
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column">
                <span className="text-[10px] font-bold text-red-500">-Col</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">
                <span className="text-[10px] font-bold text-red-500">-Row</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle header row">
                <span className="text-[10px] font-bold">H</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().mergeCells().run()} title="Merge cells">
                <span className="text-[10px] font-bold">Merge</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().splitCell().run()} title="Split cell">
                <span className="text-[10px] font-bold">Split</span>
            </Btn>
            <Divider />
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">
                <span className="text-[10px] font-bold text-red-500">Delete</span>
            </Btn>
        </div>
    )
}

// ─── Bubble Toolbar (for text selection) ────────────────────

export function BubbleToolbar({
    editor,
    onLinkClick,
}: {
    editor: Editor
    onLinkClick: () => void
}) {
    return (
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface px-1.5 py-1 shadow-xl">
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                <Bold className="size-3.5" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                <Italic className="size-3.5" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                <UnderlineIcon className="size-3.5" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                <Strikethrough className="size-3.5" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
                <Code className="size-3.5" />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
                <Highlighter className="size-3.5" />
            </Btn>
            <Divider />
            <Btn onClick={onLinkClick} active={editor.isActive('link')} title="Link">
                <LinkIcon className="size-3.5" />
            </Btn>
        </div>
    )
}
