import { BarChart, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PostPerformance {
    id: string
    title: string
    view_count: number
    total_time_on_page: number
}

interface PostPerformanceWidgetProps {
    stats: PostPerformance[]
}

/**
 * Admin widget to display top-performing posts by engagement (views vs time-on-page).
 */
export function PostPerformanceWidget({ stats }: PostPerformanceWidgetProps) {
    return (
        <Card className="col-span-1 lg:col-span-2 overflow-hidden border-brand-100 dark:border-brand-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-brand-50/50 dark:bg-brand-900/10">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Content Engagement
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium">Top 5 posts by total reading time</p>
                </div>
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {stats.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No analytics data available yet.
                        </div>
                    )}
                    {stats.map((post) => {
                        const avgTime = post.view_count > 0 
                            ? Math.round(post.total_time_on_page / post.view_count) 
                            : 0
                        
                        return (
                            <div key={post.id} className="group flex items-center justify-between space-x-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <p className="text-sm font-bold leading-none truncate group-hover:text-brand-600 transition-colors">
                                        {post.title}
                                    </p>
                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary rounded-full">
                                            <BarChart className="h-3 w-3 text-brand-500" />
                                            {post.view_count.toLocaleString()} views
                                        </span>
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary rounded-full">
                                            <Clock className="h-3 w-3 text-brand-500" />
                                            {avgTime}s avg. read
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-brand-600 dark:text-brand-400">
                                        {Math.round((post.total_time_on_page / 60) * 10) / 10}m
                                    </div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Total</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
