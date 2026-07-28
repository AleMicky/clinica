import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Tag, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import type { Periodo } from '../types/gestiones.types'

const { Text } = Typography

type PeriodosTableProps = {
    items: Periodo[]
    loading: boolean
    onEdit: (periodo: Periodo) => void
    className?: string
}

const columnHelper = createColumnHelper<Periodo>()

function formatDate(value: string) {
    return dayjs(value).format('DD/MM/YYYY')
}

export function PeriodosTable({
    items,
    loading,
    onEdit,
    className,
}: PeriodosTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', {
                    header: 'N°',
                    size: 72,
                    cell: ({ getValue }) => (
                        <Tag className="catalogo-clinico-code-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('literal', {
                    header: 'Literal',
                    cell: ({ getValue }) => (
                        <Text strong>{getValue()}</Text>
                    ),
                }),
                columnHelper.accessor('fechaInicio', {
                    header: 'Inicio',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Text type="secondary">{formatDate(getValue())}</Text>
                    ),
                }),
                columnHelper.accessor('fechaFin', {
                    header: 'Fin',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Text type="secondary">{formatDate(getValue())}</Text>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 56,
                    cell: ({ row }) => (
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            aria-label={`Editar periodo ${row.original.numero}`}
                            onClick={() => onEdit(row.original)}
                        />
                    ),
                }),
            ] as ColumnDef<Periodo, unknown>[],
        [onEdit],
    )

    return (
        <AppDataTable
            className={className}
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay periodos registrados."
            getRowId={(row) => row.id}
        />
    )
}
