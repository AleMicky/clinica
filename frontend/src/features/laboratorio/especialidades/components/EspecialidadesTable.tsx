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
import type { EspecialidadLab } from '../types/especialidad.types'

type EspecialidadesTableProps = {
    items: EspecialidadLab[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (especialidad: EspecialidadLab) => void
    onDelete: (especialidad: EspecialidadLab) => void
    deletingId: string | null
    className?: string
}

const columnHelper = createColumnHelper<EspecialidadLab>()

export function EspecialidadesTable({
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
}: EspecialidadesTableProps) {
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
                createCodigoColumn<EspecialidadLab>(),
                createNombreConDescripcionColumn<EspecialidadLab>(),
                createRowActionsColumn<EspecialidadLab>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar especialidad',
                }),
            ] as ColumnDef<EspecialidadLab, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay especialidades de laboratorio registradas."
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
