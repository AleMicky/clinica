import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Empty, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, ShopOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { StatusBadge } from '../../../shared/components/ui/status-badge/StatusBadge'
import type { CajaFisica } from '../types/caja.types'

const { Text } = Typography
const columnHelper = createColumnHelper<CajaFisica>()

type CajasTableProps = {
    cajas: CajaFisica[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onEdit: (item: CajaFisica) => void
    onDelete: (item: CajaFisica) => void
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

function CajaIdentityCell({ caja }: { caja: CajaFisica }) {
    return (
        <div className="paciente-cell">
            <span className="paciente-cell__avatar" aria-hidden>
                {getInitials(caja.nombre)}
            </span>
            <span className="paciente-cell__text">
                <Text strong className="paciente-cell__name">
                    {caja.nombre}
                </Text>
                <Text type="secondary" className="paciente-cell__sub">
                    {caja.descripcion?.trim() || 'Sin descripción'}
                </Text>
            </span>
        </div>
    )
}

export function CajasTable({
    cajas,
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
}: CajasTableProps) {
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
                    header: 'Caja',
                    cell: ({ row }) => <CajaIdentityCell caja={row.original} />,
                }),
                columnHelper.accessor('activo', {
                    header: 'Estado',
                    size: 120,
                    cell: ({ getValue }) => (
                        <StatusBadge
                            active={getValue()}
                            activeLabel="Activa"
                            inactiveLabel="Inactiva"
                        />
                    ),
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
                        const caja = row.original

                        return (
                            <Space size={4}>
                                <Tooltip title="Editar caja">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        aria-label={`Editar ${caja.nombre}`}
                                        onClick={() => onEdit(caja)}
                                    />
                                </Tooltip>
                                <Popconfirm
                                    title="Eliminar caja"
                                    description={`¿Eliminar "${caja.nombre}"?`}
                                    okText="Eliminar"
                                    cancelText="Cancelar"
                                    okButtonProps={{
                                        danger: true,
                                        loading: deletingId === caja.id,
                                    }}
                                    onConfirm={() => onDelete(caja)}
                                >
                                    <Tooltip title="Eliminar caja">
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            aria-label={`Eliminar ${caja.nombre}`}
                                            loading={deletingId === caja.id}
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<CajaFisica, unknown>[],
        [onEdit, onDelete, deletingId],
    )

    const showCustomEmpty = !loading && cajas.length === 0

    if (showCustomEmpty) {
        return (
            <div className={className}>
                <div className="app-data-table__wrapper">
                    <div className="pacientes-empty">
                        <Empty
                            image={
                                <ShopOutlined
                                    style={{ fontSize: 48, color: '#94a3b8' }}
                                />
                            }
                            description={
                                hasActiveFilters
                                    ? 'No se encontraron cajas con los filtros aplicados.'
                                    : 'No hay cajas registradas.'
                            }
                        >
                            {!hasActiveFilters && onCreate ? (
                                <Button type="primary" onClick={onCreate}>
                                    Nueva caja
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
            data={cajas}
            columns={columns}
            loading={loading}
            emptyText="No hay cajas registradas."
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
