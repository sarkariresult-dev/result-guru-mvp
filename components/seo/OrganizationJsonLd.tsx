import { JsonLd } from './JsonLd'
import { buildOrganizationSchema } from '@/lib/jsonld'

export function OrganizationJsonLd() {
    return <JsonLd data={buildOrganizationSchema()} />
}
