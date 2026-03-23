import { Badge } from '@/components/ui/Badge'
import { APPLICATION_STATUS_CONFIG } from '@/config/constants'
import { ApplicationStatus } from '@/types/enums'

const colorMap: Record<ApplicationStatus, 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray'> = {
    [ApplicationStatus.Upcoming]: 'blue',
    [ApplicationStatus.Open]: 'green',
    [ApplicationStatus.ClosingSoon]: 'orange',
    [ApplicationStatus.Closed]: 'red',
    [ApplicationStatus.ResultOut]: 'purple',
    [ApplicationStatus.NA]: 'gray',
    [ApplicationStatus.None]: 'gray',
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
