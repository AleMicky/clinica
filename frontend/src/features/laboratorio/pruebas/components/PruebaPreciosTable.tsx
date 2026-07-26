import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import type { PruebaPrecio } from '../types/prueba-precio.types'

const { Text } = Typography
const columnHelper = createColumnHelper<PruebaPrecio>()

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function formatDate(value: string | null) {
    if (!value) return '—'
    const date = dayjs(value)
    return date.isValid() ? date.format('DD/MM/YYYY') : value
}

type PruebaPreciosTableProps = {
    items: PruebaPrecio[]
    loading: boolean
    onEdit: (precio: PruebaPrecio) => void
    onDelete: (precio: PruebaPrecio) => void
    deletingId: string | null
}

export function PruebaPreciosTable({
    items,
    loading,
    onEdit,
    onDelete,
    deletingId,
}: PruebaPreciosTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('fechaInicio', {
                    header: 'Vigencia',
                    cell: ({ row }) => {
                        const vigente = !row.original.fechaFin
                        return (
                            <div>
                                <Text>
                                    {formatDate(row.original.fechaInicio)}
                                    {' → '}
                                    {formatDate(row.original.fechaFin)}
                                </Text>
                                {vigente ? (
                                    <div>
                                        <Tag color="green">Vigente</Tag>
                                    </div>
                                ) : null}
                            </div>
                        )
                    },
                }),
                columnHelper.accessor('importeFacturado', {
                    header: 'Facturado',
                    size: 110,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ getValue }) => formatMoney(getValue()),
                }),
                columnHelper.accessor('costoLaboratorio', {
                    header: 'Costo lab.',
                    size: 110,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ getValue }) => formatMoney(getValue()),
                }),
                columnHelper.accessor('costoDerivacion', {
                    header: 'Derivación',
                    size: 110,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ getValue }) => formatMoney(getValue()),
                }),
                columnHelper.accessor('motivoCambio', {
                    header: 'Motivo',
                    cell: ({ getValue }) => (
                        <Text type="secondary">{getValue()}</Text>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 88,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => {
                        const precio = row.original
                        return (
                            <Space size={4}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label="Editar precio"
                                    onClick={() => onEdit(precio)}
                                />
                                <Popconfirm
                                    title="Eliminar precio"
                                    description="¿Eliminar este registro de precio?"
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === precio.id,
                                    }}
                                    onConfirm={() => onDelete(precio)}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label="Eliminar precio"
                                        loading={deletingId === precio.id}
                                    />
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<PruebaPrecio, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    return (
        <AppDataTable
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay precios registrados para esta prueba."
            getRowId={(row) => row.id}
        />
    )
}
