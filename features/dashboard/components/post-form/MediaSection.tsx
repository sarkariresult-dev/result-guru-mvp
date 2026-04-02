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
                <FileUpload
                    bucket="posts"
                    folder={authUserId}
                    value={state.featuredImage}
                    onChange={(url: string) => dispatch({ type: 'SET_FIELD', field: 'featuredImage', value: url })}
                    accept="image/jpeg,image/png,image/webp"
                    maxSizeMB={5}
                    preview="image"
                    hint="JPG, PNG, WebP - max 5 MB (1200×630 recommended)"
                />
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

            {/* Notification PDF Panel */}
            <Panel title="Links & Documents" defaultOpen>
                <FileUpload
                    bucket="posts"
                    folder={authUserId}
                    value={state.notificationPdf}
                    onChange={(url: string) => dispatch({ type: 'SET_FIELD', field: 'notificationPdf', value: url })}
                    accept="application/pdf"
                    maxSizeMB={5}
                    preview="pdf"
                    hint="Upload official notification PDF - max 5 MB"
                />
            </Panel>
        </>
    )
}
