import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Tag, Typography } from 'antd'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import {
    createCodigoColumn,
    createRowActionsColumn,
} from '../../../../shared/components/ui/crud-section'
import type { Prueba } from '../types/prueba.types'

const { Text } = Typography
const columnHelper = createColumnHelper<Prueba>()

type PruebasTableProps = {
    items: Prueba[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (prueba: Prueba) => void
    onDelete: (prueba: Prueba) => void
    deletingId: string | null
    className?: string
}

export function PruebasTable({
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
}: PruebasTableProps) {
    const columns = useMemo(
        () =>
            [
                createCodigoColumn<Prueba>(),
                columnHelper.accessor('nombre', {
                    header: 'Nombre',
                    cell: ({ getValue }) => <Text strong>{getValue()}</Text>,
                }),
                columnHelper.accessor('especialidadNombre', {
                    header: 'Especialidad',
                    cell: ({ getValue }) => getValue(),
                }),
                columnHelper.accessor('tipoExamenNombre', {
                    header: 'Tipo examen',
                    cell: ({ getValue }) => getValue(),
                }),
                columnHelper.accessor('tipoMuestraNombre', {
                    header: 'Muestra',
                    cell: ({ getValue }) => getValue(),
                }),
                columnHelper.accessor('requiereAyuno', {
                    header: 'Ayuno',
                    size: 100,
                    cell: ({ row }) =>
                        row.original.requiereAyuno ? (
                            <Tag color="orange">{row.original.horasAyuno}h</Tag>
                        ) : (
                            <Text type="secondary">No</Text>
                        ),
                }),
                columnHelper.accessor('esDerivable', {
                    header: 'Derivable',
                    size: 100,
                    cell: ({ getValue }) =>
                        getValue() ? (
                            <Tag color="blue">Sí</Tag>
                        ) : (
                            <Text type="secondary">No</Text>
                        ),
                }),
                createRowActionsColumn<Prueba>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar prueba',
                }),
            ] as ColumnDef<Prueba, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay pruebas de laboratorio registradas."
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
