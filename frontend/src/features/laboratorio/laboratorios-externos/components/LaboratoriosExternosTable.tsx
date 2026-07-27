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
import type { LaboratorioExterno } from '../types/laboratorio-externo.types'

const { Text } = Typography
const columnHelper = createColumnHelper<LaboratorioExterno>()

type LaboratoriosExternosTableProps = {
    items: LaboratorioExterno[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: LaboratorioExterno) => void
    onDelete: (item: LaboratorioExterno) => void
    deletingId: string | null
    className?: string
}

export function LaboratoriosExternosTable({
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
}: LaboratoriosExternosTableProps) {
    const columns = useMemo(
        () =>
            [
                createCodigoColumn<LaboratorioExterno>(),
                columnHelper.accessor('nombre', {
                    header: 'Nombre',
                    cell: ({ row }) => (
                        <div>
                            <Text strong>{row.original.nombre}</Text>
                            {row.original.descripcion ? (
                                <div>
                                    <Text type="secondary">{row.original.descripcion}</Text>
                                </div>
                            ) : null}
                        </div>
                    ),
                }),
                columnHelper.accessor('contacto', {
                    header: 'Contacto',
                    cell: ({ row }) => row.original.contacto?.trim() || '—',
                }),
                columnHelper.accessor('telefono', {
                    header: 'Teléfono',
                    size: 130,
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
                columnHelper.accessor('email', {
                    header: 'Correo',
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 100,
                    cell: ({ getValue }) =>
                        getValue() ? (
                            <Tag color="success">Activo</Tag>
                        ) : (
                            <Tag color="default">Inactivo</Tag>
                        ),
                }),
                createRowActionsColumn<LaboratorioExterno>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar laboratorio externo',
                }),
            ] as ColumnDef<LaboratorioExterno, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay laboratorios externos registrados."
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
