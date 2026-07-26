import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { createCodigoNombreDescripcionColumns } from '../../../../shared/components/ui/crud-section'
import type { TipoExamen } from '../types/tipo-examen.types'

type TiposExamenTableProps = {
    items: TipoExamen[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (tipo: TipoExamen) => void
    onDelete: (tipo: TipoExamen) => void
    deletingId: string | null
    className?: string
}

export function TiposExamenTable({
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
}: TiposExamenTableProps) {
    const columns = useMemo(
        () =>
            createCodigoNombreDescripcionColumns<TipoExamen>({
                onEdit,
                onDelete,
                deletingId,
                deleteTitle: 'Eliminar tipo de examen',
            }) as ColumnDef<TipoExamen, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay tipos de examen registrados."
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
