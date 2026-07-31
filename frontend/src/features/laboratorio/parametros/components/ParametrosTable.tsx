import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Tag } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import {
    createCodigoColumn,
    createRowActionsColumn,
} from '../../../../shared/components/ui/crud-section'
import { StatusBadge } from '../../../../shared/components/ui/status-badge/StatusBadge'
import { PARAMETRO_TIPO_DATO_OPTIONS, type Parametro } from '../types/parametro.types'

const columnHelper = createColumnHelper<Parametro>()

const tipoDatoLabels = Object.fromEntries(
    PARAMETRO_TIPO_DATO_OPTIONS.map((option) => [option.value, option.label]),
)

type ParametrosTableProps = {
    items: Parametro[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: Parametro) => void
    onDelete: (item: Parametro) => void
    onManageValoresRef: (item: Parametro) => void
    deletingId: string | null
    className?: string
}

export function ParametrosTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    onManageValoresRef,
    deletingId,
    className,
}: ParametrosTableProps) {
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
                createCodigoColumn<Parametro>(),
                columnHelper.accessor('nombre', {
                    header: 'Nombre',
                    cell: ({ getValue }) => getValue(),
                }),
                columnHelper.accessor('pruebaNombre', {
                    header: 'Prueba',
                    cell: ({ getValue }) => getValue(),
                }),
                columnHelper.accessor('tipoDato', {
                    header: 'Tipo de dato',
                    size: 130,
                    cell: ({ getValue }) => tipoDatoLabels[getValue()] ?? getValue(),
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 100,
                    cell: ({ getValue }) => <StatusBadge active={getValue()} />,
                }),
                columnHelper.display({
                    id: 'valoresRef',
                    header: '',
                    size: 44,
                    cell: ({ row }) => (
                        <Button
                            type="text"
                            size="small"
                            icon={<LineChartOutlined />}
                            aria-label={`Valores de referencia de ${row.original.nombre}`}
                            onClick={() => onManageValoresRef(row.original)}
                        />
                    ),
                }),
                createRowActionsColumn<Parametro>({
                    onEdit,
                    onDelete,
                    deletingId,
                    deleteTitle: 'Eliminar parámetro',
                }),
            ] as ColumnDef<Parametro, unknown>[],
        [onEdit, onDelete, onManageValoresRef, deletingId],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay parámetros registrados."
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
