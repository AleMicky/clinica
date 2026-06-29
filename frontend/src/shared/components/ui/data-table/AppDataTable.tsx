import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table'
import { Empty, Flex, Pagination, Spin } from 'antd'

export type AppDataTablePagination = {
    page: number
    pageSize: number
    total: number
    pageSizeOptions?: number[]
    onChange: (page: number, pageSize: number) => void
}

type AppDataTableProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    loading?: boolean
    emptyText?: string
    getRowId?: (row: TData) => string
    pagination?: AppDataTablePagination
    selectedRowId?: string
    onRowClick?: (row: TData) => void
    className?: string
}

export function AppDataTable<TData>({
    data,
    columns,
    loading = false,
    emptyText = 'No hay registros.',
    getRowId,
    pagination,
    selectedRowId,
    onRowClick,
    className,
}: AppDataTableProps<TData>) {
    const pageCount = pagination
        ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
        : 1

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId,
        manualPagination: Boolean(pagination),
        pageCount,
        state: pagination
            ? {
                  pagination: {
                      pageIndex: pagination.page - 1,
                      pageSize: pagination.pageSize,
                  },
              }
            : undefined,
    })

    const rows = table.getRowModel().rows
    const showEmpty = !loading && rows.length === 0

    const totalLabel = useMemo(() => {
        if (!pagination) return undefined

        const count = pagination.total
        return `${count} registro${count === 1 ? '' : 's'}`
    }, [pagination])

    return (
        <div className={['app-data-table', className].filter(Boolean).join(' ')}>
            <Spin spinning={loading}>
                <div className="app-data-table__wrapper">
                    <table className="app-data-table__table">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const align =
                                            header.column.columnDef.meta?.headerAlign ??
                                            header.column.columnDef.meta?.align ??
                                            'left'

                                        return (
                                            <th
                                                key={header.id}
                                                className="app-data-table__th"
                                                style={{
                                                    width: header.column.columnDef.size
                                                        ? header.getSize()
                                                        : undefined,
                                                    textAlign: align,
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={[
                                        'app-data-table__tr',
                                        selectedRowId === row.id
                                            ? 'app-data-table__tr--selected'
                                            : '',
                                        onRowClick ? 'app-data-table__tr--clickable' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={
                                        onRowClick
                                            ? () => onRowClick(row.original)
                                            : undefined
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const align =
                                            cell.column.columnDef.meta?.align ?? 'left'

                                        return (
                                            <td
                                                key={cell.id}
                                                className="app-data-table__td"
                                                style={{ textAlign: align }}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {showEmpty && (
                        <div className="app-data-table__empty">
                            <Empty description={emptyText} />
                        </div>
                    )}
                </div>
            </Spin>

            {pagination && (
                <Flex justify="flex-end" className="app-data-table__pagination">
                    <Pagination
                        current={pagination.page}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        pageSizeOptions={
                            pagination.pageSizeOptions?.map(String) ?? ['10', '20', '50']
                        }
                        showTotal={() => totalLabel}
                        onChange={pagination.onChange}
                    />
                </Flex>
            )}
        </div>
    )
}
