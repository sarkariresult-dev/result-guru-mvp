'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileUpload } from '@/features/dashboard/components/FileUpload'
import { Loader2, Plus, X, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { manageAffiliateProductAction } from '../actions/products'
import { generateAffiliateData } from '@/lib/actions/ai'
import { Badge } from '@/components/ui/Badge'

interface Props {
    types: { slug: string; label: string }[]
    initialData?: any
    pageTitle: string
    pageDescription: string
}

export function AffiliateProductForm({ types, initialData, pageTitle, pageDescription }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State (Controlled for AI fill)
    const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
    const [name, setName] = useState(initialData?.name || '')
    const [category, setCategory] = useState(initialData?.category || 'other')
    const [shortDesc, setShortDesc] = useState(initialData?.short_description || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [mrp, setMrp] = useState(initialData?.mrp || '')
    const [sellingPrice, setSellingPrice] = useState(initialData?.selling_price || '')
    const [badgeText, setBadgeText] = useState(initialData?.badge_text?.toUpperCase() || '')
    const [productUrl, setProductUrl] = useState(initialData?.product_url || '')
    const [rating, setRating] = useState(initialData?.rating || '')
    const [faq, setFaq] = useState<Array<{ q: string; a: string }>>(initialData?.faq || [])

    async function handleAiGenerate() {
        if (!productUrl) {
            setError('Please enter an affiliate link first.')
            return
        }

        setError(null)
        setIsGenerating(true)
        try {
            const res = await generateAffiliateData(productUrl)
            if (res.error) {
                setError(res.error)
            } else if (res.data) {
                const d = res.data
                setName(d.name || name)
                setCategory(d.category || category)
                setShortDesc(d.short_description || shortDesc)
                setDescription(d.description || description)
                if (d.mrp) setMrp(d.mrp)
                if (d.selling_price) setSellingPrice(d.selling_price)
                if (d.badge_text) setBadgeText(d.badge_text.toUpperCase())
                if (d.rating) setRating(d.rating)
                if (d.faq && d.faq.length > 0) setFaq(d.faq)
            }
        } catch {
            setError('AI Generation failed. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    async function onSubmit(formData: FormData) {
        setError(null)

        const finalImageUrl = imageUrl || (formData.get('image_url') as string)
        if (!finalImageUrl) {
            setError('Image is required.')
            return
        }

        if (isUploading) {
            setError('Please wait for the image upload to complete.')
            return
        }

        // Ensure all state values are in the FormData
        formData.set('image_url', finalImageUrl)
        formData.set('name', name)
        formData.set('category', category)
        formData.set('short_description', shortDesc)
        formData.set('description', description)
        formData.set('mrp', mrp.toString())
        formData.set('selling_price', sellingPrice.toString())
        formData.set('badge_text', badgeText)
        formData.set('product_url', productUrl)
        if (rating) formData.set('rating', rating.toString())
        formData.set('faq', JSON.stringify(faq))

        startTransition(async () => {
            const res = await manageAffiliateProductAction(formData)
            if (res?.error) {
                setError(res.error)
            } else {
                router.push('/admin/affiliate')
                router.refresh()
            }
        })
    }

    return (
        <form action={onSubmit} className="space-y-8">
            <input type="hidden" name="image_url" value={imageUrl} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
                    <p className="text-sm text-foreground-muted">{pageDescription}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <button type="button" onClick={() => router.push('/admin/affiliate')} className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-widest text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-all">
                        Cancel
                    </button>
                    <button type="submit" disabled={isPending || isUploading || isGenerating} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50">
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-3 border border-red-100"><AlertCircle className="size-4" /> {error}</div>}

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">General Information</h3>
                        {initialData && <input type="hidden" name="id" value={initialData.id} />}
                        {initialData?.slug && <input type="hidden" name="slug" value={initialData.slug} />}

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">Product Name</label>
                                <div className="relative">
                                    <input name="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. SSC Mathematics Guide" className={`w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background-subtle outline-none focus:border-brand-500 transition-all ${isGenerating ? 'opacity-50' : ''}`} />
                                    {isGenerating && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="size-4 animate-spin text-brand-500" /></div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">Category</label>
                                    <select name="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background-subtle outline-none appearance-none">
                                        <option value="books">Books</option>
                                        <option value="stationery">Stationery</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="software">Software</option>
                                        <option value="tools">Tools</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Description */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Product Description</h3>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">Short Tagline</label>
                            <input name="short_description" value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Brief highlight..." className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background-subtle outline-none focus:border-brand-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider block mb-2">Full Description</label>
                            <textarea name="description" rows={20} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product features..." className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background-subtle outline-none focus:border-brand-500 resize-none" />
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">FAQ</h3>
                            <button
                                type="button"
                                onClick={() => setFaq([...faq, { q: '', a: '' }])}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded-md"
                            >
                                <Plus className="size-3" /> Add Q&A
                            </button>
                        </div>
                        {faq.length === 0 && (
                            <p className="text-xs text-foreground-subtle italic">No FAQ items yet. Click "Add Q&A" or use Magic Fill.</p>
                        )}
                        {faq.map((item, i) => (
                            <div key={i} className="space-y-2 border border-border rounded-xl p-3 relative">
                                <button
                                    type="button"
                                    onClick={() => setFaq(faq.filter((_, idx) => idx !== i))}
                                    className="absolute right-2 top-2 p-1 rounded-md hover:bg-red-50 text-foreground-subtle hover:text-red-600 transition-colors"
                                >
                                    <X className="size-3" />
                                </button>
                                <input
                                    value={item.q}
                                    onChange={e => {
                                        const updated = [...faq]
                                        updated[i] = { q: e.target.value, a: updated[i]?.a || '' }
                                        setFaq(updated)
                                    }}
                                    placeholder="Question..."
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none focus:border-brand-500"
                                />
                                <textarea
                                    value={item.a}
                                    onChange={e => {
                                        const updated = [...faq]
                                        updated[i] = { q: updated[i]?.q || '', a: e.target.value }
                                        setFaq(updated)
                                    }}
                                    placeholder="Answer..."
                                    rows={2}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none focus:border-brand-500 resize-none"
                                />
                            </div>
                        ))}
                    </section>

                </div>

                <div className="space-y-6">
                    {/* Link & AI Generation (Primary Action) */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4 border-brand-100 ring-1 ring-brand-50">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Product</h3>
                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={!productUrl || isGenerating}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-brand-50 px-2 py-1 rounded-md"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="size-3 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-3" />
                                        Magic Fill
                                    </>
                                )}
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block mb-2">Affiliate Link</label>
                            <input name="product_url" value={productUrl} onChange={e => setProductUrl(e.target.value)} required placeholder="Paste store URL here..." className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-background-subtle outline-none focus:border-brand-500" />
                            <p className="mt-2 text-[10px] text-foreground-subtle italic leading-relaxed">
                                Tip: Paste the link first, then click "Magic Fill" to save time!
                            </p>
                        </div>
                    </section>

                    {/* Media */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Media</h3>
                        <FileUpload label="Product Image" bucket="affiliate" folder="products" value={imageUrl} onChange={setImageUrl} onLoading={setIsUploading} />
                    </section>

                    {/* Pricing */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Pricing</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">Selling Price</label>
                                <input name="selling_price" type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">MRP</label>
                                <input name="mrp" type="number" step="0.01" value={mrp} onChange={e => setMrp(e.target.value)} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Rating */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Rating</h3>
                        <div>
                            <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">Rating (1.0 - 5.0)</label>
                            <input name="rating" type="number" step="0.1" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} placeholder="e.g. 4.5" className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none" />
                        </div>
                    </section>

                    {/* Visibility */}
                    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-3">Visibility & Badge</h3>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input name="is_active" type="hidden" value={initialData?.is_active === false ? '0' : '1'} />
                                <input type="checkbox" defaultChecked={initialData?.is_active !== false} onChange={(e) => {
                                    const hidden = e.target.previousElementSibling as HTMLInputElement;
                                    if (hidden) hidden.value = e.target.checked ? '1' : '0';
                                }} className="size-4 rounded border-border text-brand-600" />
                                <span className="text-sm font-bold">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input name="is_featured" type="hidden" value={initialData?.is_featured ? '1' : '0'} />
                                <input type="checkbox" defaultChecked={initialData?.is_featured} onChange={(e) => {
                                    const hidden = e.target.previousElementSibling as HTMLInputElement;
                                    if (hidden) hidden.value = e.target.checked ? '1' : '0';
                                }} className="size-4 rounded border-border text-brand-600" />
                                <span className="text-sm font-bold">Featured</span>
                            </label>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-1">Priority (higher first)</label>
                            <input name="display_priority" type="number" defaultValue={initialData?.display_priority || 0} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background-subtle outline-none" />
                        </div>
                        <div className="pt-2 border-t border-border">
                            <label className="text-[10px] font-bold text-foreground-muted uppercase block mb-2">Product Badge</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: '', label: 'None', color: 'bg-gray-100 text-gray-600 border-gray-200' },
                                    { value: 'HOT', label: 'HOT', color: 'bg-red-50 text-red-600 border-red-200' },
                                    { value: 'NEW', label: 'NEW', color: 'bg-amber-50 text-amber-600 border-amber-200' },
                                    { value: 'TRENDING', label: 'TRENDING', color: 'bg-blue-50 text-blue-600 border-blue-200' },
                                    { value: 'BEST SELLER', label: 'BEST SELLER', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
                                ].map((badge) => (
                                    <label key={badge.value} className="cursor-pointer relative group">
                                        <input
                                            type="radio"
                                            name="badge_text"
                                            value={badge.value}
                                            checked={badgeText === badge.value}
                                            onChange={e => setBadgeText(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <span className={`inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all opacity-70 peer-checked:opacity-100 peer-checked:ring-2 peer-checked:ring-brand-500 peer-checked:ring-offset-2 ${badge.color} hover:opacity-100`}>
                                            {badge.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>


        </form>
    )
}


