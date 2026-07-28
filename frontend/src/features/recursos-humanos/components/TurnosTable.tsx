import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Tag, Typography } from 'antd'

import {
    createCodigoColumn,
    createRowActionsColumn,
} from '../../../shared/components/ui/crud-section'
import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { Turno } from '../types/turnos.types'

const { Text } = Typography

type TurnosTableProps = {
    items: Turno[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (turno: Turno) => void
    onDelete: (turno: Turno) => void
    deletingId: string | null
    className?: string
}

const columnHelper = createColumnHelper<Turno>()

function formatHora(value: string) {
    return value.slice(0, 5)
}

export function TurnosTable({
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
}: TurnosTableProps) {
    const columns = useMemo(
        () =>
            [
                createCodigoColumn<Turno>(),
                columnHelper.accessor('nombre', {
                    header: 'Nombre',
                    cell: ({ row }) => (
                        <div className="rrhh-page__employee-cell">
                            <Text strong>{row.original.nombre}</Text>
                            <Text type="secondary" className="rrhh-page__employee-meta">
                                {formatHora(row.original.horaInicio)} –{' '}
                                {formatHora(row.original.horaFin)}
                                {row.original.cruceDia ? ' · Cruce de día' : ''}
                            </Text>
                        </div>
                    ),
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 110,
                    cell: ({ getValue }) => {
                        const activo = getValue()
                        return (
                            <Tag color={activo ? 'success' : 'default'}>
                                {activo ? 'Activo' : 'Inactivo'}
                            </Tag>
                        )
                    },
                }),
                columnHelper.accessor('permiteMultiplesMedicosTurno', {
                    header: 'Múltiples médicos',
                    size: 140,
                    cell: ({ getValue }) => (getValue() ? 'Sí' : 'No'),
                }),
                createRowActionsColumn<Turno>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar turno',
                }),
            ] as ColumnDef<Turno, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay turnos registrados."
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
