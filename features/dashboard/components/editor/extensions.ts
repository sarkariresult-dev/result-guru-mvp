'use client'

import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

/**
 * Build the full set of TipTap extensions for the production editor.
 */
export function getEditorExtensions(placeholder: string) {
    return [
        StarterKit.configure({
            heading: { levels: [1, 2, 3, 4] },
            codeBlock: false, // we use CodeBlockLowlight instead
        }),
        Underline,
        Highlight.configure({
            multicolor: true,
            HTMLAttributes: { class: 'bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5' },
        }),
        Superscript,
        Subscript,
        Typography,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-brand-600 underline cursor-pointer hover:text-brand-700',
                rel: 'noopener noreferrer',
                target: '_blank',
            },
        }),
        TiptapImage.configure({
            inline: false,
            allowBase64: false,
            HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
        }),
        Placeholder.configure({ placeholder }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        CodeBlockLowlight.configure({
            lowlight,
            HTMLAttributes: {
                class: 'rounded-lg bg-gray-900 text-gray-100 p-4 text-sm font-mono overflow-x-auto',
            },
        }),
        CharacterCount,
        Table.configure({
            resizable: true,
            HTMLAttributes: { class: 'border-collapse border border-border w-full' },
        }),
        TableRow,
        TableCell.configure({
            HTMLAttributes: { class: 'border border-border p-2 min-w-[80px]' },
        }),
        TableHeader.configure({
            HTMLAttributes: { class: 'border border-border p-2 bg-background-subtle font-semibold' },
        }),
    ]
}
