/**
 * Media Section - Featured image + Notification PDF.
 */
'use client'

import { Info } from 'lucide-react'
import { usePostForm } from './PostFormContext'
import { Panel, Field, inputCls } from './primitives'
import { FileUpload } from '@/features/dashboard/components/FileUpload'

interface MediaSectionProps {
    authUserId: string
}

export function MediaSection({ authUserId }: MediaSectionProps) {
    const { state, dispatch } = usePostForm()

    return (
        <>
            {/* Featured Image Panel */}
            <Panel title="Featured Image" defaultOpen>
                <Field label="Social & Card Image" hint="Main image for social shares and listing cards (1200×630 recommended)">
                    <FileUpload
                        bucket="posts"
                        folder={authUserId}
                        value={state.featuredImage}
                        onChange={(url: string) => dispatch({ type: 'SET_FIELD', field: 'featuredImage', value: url })}
                        accept="image/jpeg,image/png,image/webp"
                        maxSizeMB={5}
                        preview="image"
                        hint="JPG, PNG, WebP - max 5 MB"
                    />
                </Field>
                {state.featuredImage && (
                    <>
                        <Field label="Alt Text" hint="Describe the image for accessibility and SEO">
                            <input
                                value={state.featuredImageAlt}
                                onChange={e => dispatch({ type: 'SET_FIELD', field: 'featuredImageAlt', value: e.target.value })}
                                placeholder="Descriptive alt text…"
                                maxLength={255}
                                className={inputCls}
                            />
                        </Field>
                        {!state.featuredImageAlt && (
                            <p className="text-[10px] text-foreground-subtle flex items-center gap-1">
                                <Info className="size-3" /> Alt text will default to post title if not set
                            </p>
                        )}
                    </>
                )}
            </Panel>

            {/* Links & Documents Panel */}
            <Panel title="Links & Documents" defaultOpen>
                {/* Unified Action Link */}
                <Field 
                    label={getActionLinkLabel(state.type)} 
                    hint="Paste the direct URL for the primary action (Apply, Check Result, Download, etc.)"
                >
                    <input
                        value={state.primaryLink}
                        onChange={e => dispatch({ type: 'SET_PRIMARY_LINK', payload: e.target.value })}
                        placeholder="https://..."
                        className={inputCls}
                    />
                </Field>

                {/* Notification PDF */}
                <Field label="Official Notification PDF" hint="Upload the official PDF document - max 5 MB">
                    <FileUpload
                        bucket="posts"
                        folder={authUserId}
                        value={state.notificationPdf}
                        onChange={(url: string) => dispatch({ type: 'SET_FIELD', field: 'notificationPdf', value: url })}
                        accept="application/pdf"
                        maxSizeMB={5}
                        preview="pdf"
                        hint="Official PDF for transparency and trust"
                    />
                </Field>
            </Panel>
        </>
    )
}

/**
 * Helper to get the semantic label for the primary action link
 */
function getActionLinkLabel(postType: string): string {
    switch (postType) {
        case 'job': return 'Apply Online Link'
        case 'result': return 'Check Result Link'
        case 'admit': return 'Download Admit Card'
        case 'answer_key': return 'Download Answer Key'
        case 'syllabus': return 'Download Syllabus'
        case 'previous_paper': return 'Download Paper'
        case 'admission': return 'Admission / Apply Link'
        case 'scholarship': return 'Apply Online Link'
        case 'scheme': return 'Official Scheme Link'
        case 'exam':
        case 'exam_pattern': return 'Official Exam Info Link'
        case 'notification': return 'Official Notification Link'
        case 'cut_off': return 'Check Cut-off'
        default: return 'Primary Action Link'
    }
}
