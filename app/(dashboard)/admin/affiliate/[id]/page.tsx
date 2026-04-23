import { notFound } from 'next/navigation'
import { AffiliateProductForm } from '@/features/affiliate/components/AffiliateProductForm'
import { getAffiliateTypes, getAffiliateProduct } from '@/features/affiliate/queries'

export default async function AffiliateFormPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const isNew = id === 'new'

    // Fetch types and conditionally fetch product if not new
    const [types, product] = await Promise.all([
        getAffiliateTypes(),
        !isNew ? getAffiliateProduct(id) : Promise.resolve(null)
    ])

    if (!isNew && !product) {
        notFound()
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <AffiliateProductForm
                types={types}
                initialData={product || undefined}
                pageTitle={isNew ? "Add New Product" : "Edit Product"}
                pageDescription={isNew
                    ? "Fill in the details below to list a new product in the shop."
                    : `Modifying information for: ${product?.name}`
                }
            />
        </div>
    )
}
