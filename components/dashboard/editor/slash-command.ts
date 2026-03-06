'use client'

import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * Slash command extension for TipTap.
 * Detects '/' at the start of a line (or after whitespace) and triggers
 * a callback with the query and position info.
 */

export interface SlashCommandItem {
    title: string
    description: string
    icon: React.ReactNode
    command: (editor: any) => void
    group: string
    aliases?: string[]
}

interface SlashCommandStorage {
    query: string
    active: boolean
    range: { from: number; to: number } | null
}

export const SlashCommandExtension = Extension.create<
    { onActivate: (query: string, coords: { left: number; top: number; bottom: number }) => void; onDeactivate: () => void },
    SlashCommandStorage
>({
    name: 'slashCommand',

    addOptions() {
        return {
            onActivate: () => {},
            onDeactivate: () => {},
        }
    },

    addStorage() {
        return {
            query: '',
            active: false,
            range: null,
        }
    },

    addProseMirrorPlugins() {
        const extension = this

        return [
            new Plugin({
                key: new PluginKey('slashCommand'),

                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, old) {
                        return old.map(tr.mapping, tr.doc)
                    },
                },

                props: {
                    handleKeyDown(view, event) {
                        const { state } = view
                        const { selection } = state
                        const { $from } = selection

                        // If slash menu is active
                        if (extension.storage.active) {
                            // Close on Escape
                            if (event.key === 'Escape') {
                                extension.storage.active = false
                                extension.storage.query = ''
                                extension.storage.range = null
                                extension.options.onDeactivate()
                                return false
                            }
                        }

                        return false
                    },

                    handleTextInput(view, from, to, text) {
                        // Detect '/' typed at start of empty block or after whitespace
                        if (text === '/') {
                            const { state } = view
                            const { $from } = state.selection

                            // Only trigger at start of line or after space
                            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)
                            if (textBefore.trim() === '') {
                                // Delay to allow the character to be inserted
                                setTimeout(() => {
                                    const coords = view.coordsAtPos(from)
                                    extension.storage.active = true
                                    extension.storage.query = ''
                                    extension.storage.range = { from, to: from + 1 }
                                    extension.options.onActivate('', {
                                        left: coords.left,
                                        top: coords.top,
                                        bottom: coords.bottom,
                                    })
                                }, 0)
                            }
                        } else if (extension.storage.active) {
                            // Update query as user types after /
                            setTimeout(() => {
                                const { state } = view
                                const { $from } = state.selection
                                const textContent = $from.parent.textContent
                                const slashIdx = textContent.lastIndexOf('/')
                                if (slashIdx >= 0) {
                                    const query = textContent.slice(slashIdx + 1)
                                    extension.storage.query = query
                                    extension.storage.range = {
                                        from: $from.before($from.depth) + slashIdx + 1,
                                        to: $from.pos,
                                    }
                                    const coords = view.coordsAtPos(from)
                                    extension.options.onActivate(query, {
                                        left: coords.left,
                                        top: coords.top,
                                        bottom: coords.bottom,
                                    })
                                }
                            }, 0)
                        }

                        return false
                    },
                },
            }),
        ]
    },
})
