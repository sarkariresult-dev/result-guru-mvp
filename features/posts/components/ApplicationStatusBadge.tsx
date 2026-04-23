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
    
    // Don't show anything for NA or None status
    if (key === ApplicationStatus.NA || key === ApplicationStatus.None || !status) {
        return null
    }

    const config = APPLICATION_STATUS_CONFIG[key]
    const isLive = key === ApplicationStatus.Open || key === ApplicationStatus.ClosingSoon

    return (
        <Badge 
            variant={colorMap[key] ?? 'gray'}
            className={isLive ? 'relative pl-6 overflow-hidden' : ''}
        >
            {isLive && (
                <span className="absolute left-2 flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex size-1.5 rounded-full bg-current"></span>
                </span>
            )}
            {config?.label ?? status}
        </Badge>
    )
}
