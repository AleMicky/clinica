import { useMemo } from 'react'
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type OnChangeFn,
    type SortingState,
} from '@tanstack/react-table'
import { Empty, Flex, Pagination, Skeleton } from 'antd'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'

export type AppDataTablePagination = {
    page: number
    pageSize: number
    total: number
    pageSizeOptions?: number[]
    onChange: (page: number, pageSize: number) => void
}

type AppDataTableProps<TData> = {
    data: TData[]
    columns: ColumnDef<TData, unknown>[]
    loading?: boolean
    emptyText?: string
    emptyContent?: React.ReactNode
    getRowId?: (row: TData) => string
    pagination?: AppDataTablePagination
    selectedRowId?: string
    onRowClick?: (row: TData) => void
    className?: string
    sorting?: SortingState
    onSortingChange?: OnChangeFn<SortingState>
    skeletonRows?: number
}

function SortIndicator({ sorted }: { sorted: false | 'asc' | 'desc' }) {
    if (!sorted) {
        return <span className="app-data-table__sort-idle" aria-hidden />
    }

    return sorted === 'asc' ? (
        <CaretUpOutlined className="app-data-table__sort-icon" aria-hidden />
    ) : (
        <CaretDownOutlined className="app-data-table__sort-icon" aria-hidden />
    )
}

export function AppDataTable<TData>({
    data,
    columns,
    loading = false,
    emptyText = 'No hay registros.',
    emptyContent,
    getRowId,
    pagination,
    selectedRowId,
    onRowClick,
    className,
    sorting,
    onSortingChange,
    skeletonRows = 6,
}: AppDataTableProps<TData>) {
    const pageCount = pagination
        ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
        : 1

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId,
        enableSorting: Boolean(onSortingChange),
        manualPagination: Boolean(pagination),
        manualSorting: Boolean(onSortingChange),
        pageCount,
        state: {
            ...(pagination
                ? {
                      pagination: {
                          pageIndex: pagination.page - 1,
                          pageSize: pagination.pageSize,
                      },
                  }
                : {}),
            ...(sorting ? { sorting } : {}),
        },
        onSortingChange,
    })

    const rows = table.getRowModel().rows
    const showEmpty = !loading && rows.length === 0
    const headerCount = Math.max(columns.length, 1)

    const totalLabel = useMemo(() => {
        if (!pagination) return undefined

        const count = pagination.total
        return `${count} registro${count === 1 ? '' : 's'}`
    }, [pagination])

    return (
        <div className={['app-data-table', className].filter(Boolean).join(' ')}>
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
                                    const canSort = header.column.getCanSort()
                                    const sorted = header.column.getIsSorted()

                                    return (
                                        <th
                                            key={header.id}
                                            className={[
                                                'app-data-table__th',
                                                canSort ? 'app-data-table__th--sortable' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            style={{
                                                width: header.column.columnDef.size
                                                    ? header.getSize()
                                                    : undefined,
                                                textAlign: align,
                                            }}
                                            aria-sort={
                                                sorted === 'asc'
                                                    ? 'ascending'
                                                    : sorted === 'desc'
                                                      ? 'descending'
                                                      : canSort
                                                        ? 'none'
                                                        : undefined
                                            }
                                        >
                                            {header.isPlaceholder ? null : canSort ? (
                                                <button
                                                    type="button"
                                                    className="app-data-table__sort-btn"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <span>
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext(),
                                                        )}
                                                    </span>
                                                    <SortIndicator sorted={sorted} />
                                                </button>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                                  <tr
                                      key={`skeleton-${rowIndex}`}
                                      className="app-data-table__tr app-data-table__tr--skeleton"
                                  >
                                      {Array.from({ length: headerCount }).map((__, cellIndex) => (
                                          <td
                                              key={`skeleton-${rowIndex}-${cellIndex}`}
                                              className="app-data-table__td"
                                          >
                                              <Skeleton
                                                  active
                                                  title={false}
                                                  paragraph={{ rows: 1, width: '80%' }}
                                              />
                                          </td>
                                      ))}
                                  </tr>
                              ))
                            : rows.map((row) => (
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
                                      onKeyDown={
                                          onRowClick
                                              ? (event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault()
                                                        onRowClick(row.original)
                                                    }
                                                }
                                              : undefined
                                      }
                                      tabIndex={onRowClick ? 0 : undefined}
                                      role={onRowClick ? 'button' : undefined}
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
                        {emptyContent ?? <Empty description={emptyText} />}
                    </div>
                )}
            </div>

            {pagination && !showEmpty ? (
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
            ) : null}
        </div>
    )
}
