import { Badge } from '@/components/ui/Badge'
import { APPLICATION_STATUS_CONFIG } from '@/config/constants'
import type { ApplicationStatus } from '@/types/enums'

const colorMap: Record<ApplicationStatus, 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray'> = {
    upcoming: 'blue',
    open: 'green',
    closing_soon: 'orange',
    closed: 'red',
    result_out: 'purple',
    na: 'gray',
}

export function ApplicationStatusBadge({ status }: { status: string }) {
    const key = status as ApplicationStatus
    const config = APPLICATION_STATUS_CONFIG[key]
    return (
        <Badge variant={colorMap[key] ?? 'gray'}>
            {config?.label ?? status}
        </Badge>
    )
}
