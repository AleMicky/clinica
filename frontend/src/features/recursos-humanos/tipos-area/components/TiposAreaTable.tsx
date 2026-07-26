import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Tag } from 'antd'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import {
    createCodigoColumn,
    createNombreConDescripcionColumn,
    createRowActionsColumn,
} from '../../../../shared/components/ui/crud-section'
import type { TipoArea } from '../types/tipo-area.types'

type TiposAreaTableProps = {
    items: TipoArea[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (tipoArea: TipoArea) => void
    onDelete: (tipoArea: TipoArea) => void
    deletingId: string | null
    className?: string
}

const columnHelper = createColumnHelper<TipoArea>()

export function TiposAreaTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    deletingId,
    className,
}: TiposAreaTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('orden', {
                    header: 'Orden',
                    size: 80,
                    cell: ({ getValue }) => (
                        <Tag variant="filled" className="rrhh-page__date-tag">
                            {getValue()}
                        </Tag>
                    ),
                }),
                createCodigoColumn<TipoArea>(),
                createNombreConDescripcionColumn<TipoArea>(),
                createRowActionsColumn<TipoArea>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar tipo de área',
                }),
            ] as ColumnDef<TipoArea, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay tipos de área registrados."
            getRowId={(row) => row.id}
            pagination={{
                page,
                pageSize,
                total,
                pageSizeOptions: [10, 20, 50],
                onChange: onPageChange,
            }}
        />
    )
}
