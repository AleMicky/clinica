import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Space, Tag } from 'antd'
import { DollarOutlined, StopOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { CuentaListItem } from '../types/caja.types'

const columnHelper = createColumnHelper<CuentaListItem>()

const estadoColor: Record<string, string> = {
    ABIERTA: 'gold',
    PARCIAL: 'orange',
    PAGADA: 'green',
    ANULADA: 'red',
}

type CuentasTableProps = {
    items: CuentaListItem[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onOpen: (cuenta: CuentaListItem) => void
    onAnular: (cuenta: CuentaListItem) => void
    deletingId: string | null
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function CuentasTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onOpen,
    onAnular,
    deletingId,
}: CuentasTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', { header: 'Número' }),
                columnHelper.accessor('moduloOrigen', { header: 'Origen' }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    cell: (info) => (
                        <Tag color={estadoColor[info.getValue()] ?? 'default'}>
                            {info.getValue()}
                        </Tag>
                    ),
                }),
                columnHelper.accessor('totalCargos', {
                    header: 'Total',
                    cell: (info) => formatMoney(info.getValue()),
                }),
                columnHelper.accessor('saldo', {
                    header: 'Saldo',
                    cell: (info) => formatMoney(info.getValue()),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => {
                        const cuenta = row.original
                        const canPay =
                            cuenta.estado === 'ABIERTA' || cuenta.estado === 'PARCIAL'
                        return (
                            <Space>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<DollarOutlined />}
                                    disabled={!canPay}
                                    onClick={() => onOpen(cuenta)}
                                >
                                    Cobrar
                                </Button>
                                <Button
                                    size="small"
                                    danger
                                    icon={<StopOutlined />}
                                    loading={deletingId === cuenta.id}
                                    disabled={
                                        cuenta.estado !== 'ABIERTA' || cuenta.totalPagado > 0
                                    }
                                    onClick={() => onAnular(cuenta)}
                                >
                                    Anular
                                </Button>
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<CuentaListItem, unknown>[],
        [onOpen, onAnular, deletingId],
    )

    return (
        <AppDataTable
            className="rrhh-empleados__table"
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay cuentas pendientes."
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
