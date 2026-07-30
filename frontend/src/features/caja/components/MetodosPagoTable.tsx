import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { CreditCardOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { MetodoPago } from '../types/caja.types'

const { Text } = Typography
const columnHelper = createColumnHelper<MetodoPago>()

type MetodosPagoTableProps = {
    metodos: MetodoPago[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: MetodoPago) => void
    onDelete: (item: MetodoPago) => void
    onCreate?: () => void
    deletingId: string | null
    hasActiveFilters?: boolean
    className?: string
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }

    return nombre.trim().slice(0, 2).toUpperCase()
}

function MetodoIdentityCell({ metodo }: { metodo: MetodoPago }) {
    const meta = [
        metodo.requiereReferencia ? 'Requiere referencia' : null,
        metodo.esEfectivo ? 'Efectivo' : null,
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(metodo.nombre)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {metodo.nombre}
                </Text>
                {meta ? (
                    <Text type="secondary" className="paciente-cell__sub">
                        {meta}
                    </Text>
                ) : (
                    <Text type="secondary" className="paciente-cell__sub">
                        Sin atributos especiales
                    </Text>
                )}
            </span>
        </div>
    )
}

export function MetodosPagoTable({
    metodos,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onEdit,
    onDelete,
    onCreate,
    deletingId,
    hasActiveFilters = false,
    className,
}: MetodosPagoTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigo', {
                    header: 'Código',
                    size: 140,
                    cell: ({ getValue }) => (
                        <Tag className="paciente-hc-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('nombre', {
                    header: 'Método',
                    cell: ({ row }) => <MetodoIdentityCell metodo={row.original} />,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 88,
                    meta: {
                        align: 'right',
                        headerAlign: 'right',
                    },
                    cell: ({ row }) => {
                        const metodo = row.original

                        return (
                            <Space size={4}>
                                <Tooltip title="Editar método de pago">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        aria-label={`Editar ${metodo.nombre}`}
                                        onClick={() => onEdit(metodo)}
                                    />
                                </Tooltip>
                                <Popconfirm
                                    title="Eliminar método de pago"
                                    description={`¿Eliminar "${metodo.nombre}"?`}
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === metodo.id,
                                    }}
                                    onConfirm={() => onDelete(metodo)}
                                >
                                    <Tooltip title="Eliminar método de pago">
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            aria-label={`Eliminar ${metodo.nombre}`}
                                            loading={deletingId === metodo.id}
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<MetodoPago, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && metodos.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <CreditCardOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron métodos de pago con los filtros aplicados.'
                                    : 'No hay métodos de pago registrados.'
                            }
                        >
                            {!hasActiveFilters && onCreate ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nuevo método
                                </Button>
                            ) : null}
                        </Empty>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AppDataTable
            className={className}
            data={metodos}
            columns={columns}
            loading={loading}
            emptyText="No hay métodos de pago registrados."
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
