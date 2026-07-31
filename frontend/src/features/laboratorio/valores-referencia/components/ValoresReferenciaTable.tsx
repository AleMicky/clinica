import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import { StatusBadge } from '../../../../shared/components/ui/status-badge/StatusBadge'
import type { ValorReferencia } from '../types/valor-referencia.types'

const { Text } = Typography
const columnHelper = createColumnHelper<ValorReferencia>()

function formatRange(
    min: number | null | undefined,
    max: number | null | undefined,
) {
    if (min == null && max == null) return '—'
    if (min != null && max != null) return `${min} – ${max}`
    if (min != null) return `≥ ${min}`
    return `≤ ${max}`
}

function formatSexo(sexo: string | null | undefined) {
    if (!sexo) return 'Todos'
    if (sexo === 'M') return 'Masculino'
    if (sexo === 'F') return 'Femenino'
    return sexo
}

type ValoresReferenciaTableProps = {
    items: ValorReferencia[]
    loading: boolean
    onEdit: (item: ValorReferencia) => void
    onDelete: (item: ValorReferencia) => void
    deletingId: string | null
}

export function ValoresReferenciaTable({
    items,
    loading,
    onEdit,
    onDelete,
    deletingId,
}: ValoresReferenciaTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('sexo', {
                    header: 'Sexo',
                    size: 110,
                    cell: ({ getValue }) => formatSexo(getValue()),
                }),
                columnHelper.display({
                    id: 'edad',
                    header: 'Edad',
                    size: 120,
                    cell: ({ row }) =>
                        formatRange(row.original.edadMin, row.original.edadMax),
                }),
                columnHelper.display({
                    id: 'valor',
                    header: 'Rango / Valor',
                    cell: ({ row }) => {
                        const texto = row.original.valorTexto
                        if (texto) {
                            return <Text>{texto}</Text>
                        }
                        return formatRange(
                            row.original.valorMin,
                            row.original.valorMax,
                        )
                    },
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 100,
                    cell: ({ getValue }) => <StatusBadge active={getValue()} />,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 88,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const item = row.original
                        return (
                            <Space size={4}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label="Editar valor de referencia"
                                    onClick={() => onEdit(item)}
                                />
                                <Popconfirm
                                    title="Eliminar valor de referencia"
                                    description="¿Eliminar este registro?"
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === item.id,
                                    }}
                                    onConfirm={() => onDelete(item)}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label="Eliminar valor de referencia"
                                        loading={deletingId === item.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<ValorReferencia, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay valores de referencia para este parámetro."
            getRowId={(row) => row.id}
        />
    )
}
