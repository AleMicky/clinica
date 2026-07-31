import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Button, Space, Tag, Tooltip } from 'antd'
import { EyeOutlined, FileTextOutlined, StopOutlined } from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { PagoListItem } from '../types/caja.types'

const columnHelper = createColumnHelper<PagoListItem>()

const estadoColor: Record<string, string> = {
    CONFIRMADO: 'green',
    ANULADO: 'red',
    DEVUELTO: 'orange',
    PARCIALMENTE_DEVUELTO: 'gold',
}

type PagosTableProps = {
    items: PagoListItem[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
    onOpen: (pago: PagoListItem) => void
    onAnular: (pago: PagoListItem) => void
    onRecibo: (pago: PagoListItem) => void
    anulatingId: string | null
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function PagosTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onOpen,
    onAnular,
    onRecibo,
    anulatingId,
}: PagosTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', { header: 'Número' }),
                columnHelper.accessor('fechaPago', {
                    header: 'Fecha',
                    cell: (info) => new Date(info.getValue()).toLocaleString(),
                }),
                columnHelper.accessor('monto', {
                    header: 'Monto',
                    cell: (info) => formatMoney(info.getValue()),
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    cell: (info) => (
                        <Tag color={estadoColor[info.getValue()] ?? 'default'}>
                            {info.getValue()}
                        </Tag>
                    ),
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Observaciones',
                    cell: (info) => info.getValue() ?? '—',
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => {
                        const pago = row.original
                        const canAnular = pago.estado === 'CONFIRMADO'
                        return (
                            <Space>
                                <Tooltip title="Ver detalle">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => onOpen(pago)}
                                        aria-label="Ver detalle del pago"
                                    />
                                </Tooltip>
                                <Tooltip title="Ver recibo">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<FileTextOutlined />}
                                        onClick={() => onRecibo(pago)}
                                        aria-label="Ver recibo"
                                    />
                                </Tooltip>
                                {canAnular ? (
                                    <Tooltip title="Anular pago">
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<StopOutlined />}
                                            loading={anulatingId === pago.id}
                                            onClick={() => onAnular(pago)}
                                            aria-label="Anular pago"
                                        />
                                    </Tooltip>
                                ) : null}
                            </Space>
                        )
                    },
                }),
            ] as ColumnDef<PagoListItem, unknown>[],
        [onOpen, onAnular, onRecibo, anulatingId],
    )

    return (
        <AppDataTable
            className="rrhh-empleados__table"
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay pagos registrados."
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
