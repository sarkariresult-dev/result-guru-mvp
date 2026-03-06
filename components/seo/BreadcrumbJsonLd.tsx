import { JsonLd } from './JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'

interface Props {
    items: Array<{ name: string; url: string }>
}

export function BreadcrumbJsonLd({ items }: Props) {
    return <JsonLd data={buildBreadcrumbSchema(items)} />
}
