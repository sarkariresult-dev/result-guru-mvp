'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { DataTable } from '@/features/dashboard/components/DataTable'
import { deleteAffiliateProductAction, toggleAffiliateActiveAction } from '@/features/affiliate/actions/products'
import { Trash2, Star } from 'lucide-react'
import type { AffiliateProduct } from '@/types/post.types'

export function AffiliateTable({ products }: { products: AffiliateProduct[] }) {
    const columns = [
        {
            key: 'name', 
            header: 'Product', 
            render: (p: AffiliateProduct) => (
                <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url} alt={p.name} className="size-10 rounded object-contain bg-white border border-border" />
                    <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex gap-1.5 items-center mt-1">
                            <span className="text-[9px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider capitalize">{p.category}</span>
                            {p.is_featured && (
                                <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                                    <Star className="size-2.5" /> Featured
                                </span>
                            )}
                            {p.badge_text && (
                                <span 
                                    className="text-[9px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                                    style={{ backgroundColor: p.badge_color || '#6366f1' }}
                                >
                                    {p.badge_text}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: 'selling_price', 
            header: 'Price', 
            render: (p: AffiliateProduct) => (
                <div className="text-sm">
                    {p.selling_price ? <span className="font-medium">₹{p.selling_price}</span> : <span className="text-foreground-subtle">-</span>}
                    {p.mrp && p.selling_price && p.mrp > p.selling_price && <span className="text-xs line-through text-foreground-subtle ml-1">₹{p.mrp}</span>}
                </div>
            )
        },
        { 
            key: 'is_active', 
            header: 'Status', 
            render: (p: AffiliateProduct) => <ToggleSwitch product={p} />
        },
        { 
            key: 'created_at', 
            header: 'Added', 
            render: (p: AffiliateProduct) => (
                <span className="text-xs text-foreground-muted">
                    {new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        { 
            key: 'actions', 
            header: '', 
            render: (p: AffiliateProduct) => <ActionButtons product={p} />
        }
    ]

    return (
        <DataTable columns={columns as any[]} data={products as any[]} emptyMessage="No products found matching your criteria." />
    )
}

function ToggleSwitch({ product }: { product: AffiliateProduct }) {
    const [isPending, startTransition] = useTransition()
    const [active, setActive] = useState(product.is_active)

    function handleToggle() {
        const newValue = !active
        setActive(newValue)
        startTransition(async () => {
            const res = await toggleAffiliateActiveAction(product.id, newValue)
            if (res?.error) {
                setActive(!newValue) // Revert on error
            }
        })
    }

    return (
        <button 
            onClick={handleToggle}
            disabled={isPending}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none disabled:opacity-50"
            style={{ backgroundColor: active ? '#16a34a' : '#d1d5db' }}
            aria-label={active ? 'Deactivate product' : 'Activate product'}
        >
            <span 
                className={`inline-block size-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${active ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} 
            />
        </button>
    )
}

function ActionButtons({ product }: { product: AffiliateProduct }) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    function handleDelete() {
        startTransition(async () => {
            await deleteAffiliateProductAction(product.id)
            setShowConfirm(false)
        })
    }

    return (
        <div className="flex justify-end gap-2">
            <Link 
                href={`/admin/affiliate/${product.id}`} 
                className="group/btn relative flex items-center justify-center h-8 px-4 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all overflow-hidden"
            >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">Edit</span>
                <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </Link>

            {showConfirm ? (
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleDelete} 
                        disabled={isPending}
                        className="h-8 px-3 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                        {isPending ? '...' : 'Yes'}
                    </button>
                    <button 
                        onClick={() => setShowConfirm(false)} 
                        className="h-8 px-3 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        No
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setShowConfirm(true)} 
                    className="group/del flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    aria-label="Delete product"
                >
                    <Trash2 className="size-3.5" />
                </button>
            )}
        </div>
    )
}
