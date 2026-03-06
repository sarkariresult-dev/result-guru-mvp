'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'

interface Column<T> {
    key: string
    header: string
    render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    loading,
    emptyMessage = 'No data found.',
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-foreground-muted">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((col) => (
                        <TableHead key={col.key}>{col.header}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item, i) => (
                    <TableRow key={i}>
                        {columns.map((col) => (
                            <TableCell key={col.key}>
                                {col.render
                                    ? col.render(item)
                                    : String(item[col.key] ?? '')}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
