import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Tag } from 'antd'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import type { MovimientoCaja } from '../types/caja.types'

const columnHelper = createColumnHelper<MovimientoCaja>()

type MovimientosTableProps = {
    items: MovimientoCaja[]
    loading: boolean
    total: number
    page: number
    pageSize: number
    onPageChange: (page: number, pageSize: number) => void
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function MovimientosTable({
    items,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
}: MovimientosTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('numero', { header: 'Número' }),
                columnHelper.accessor('fecha', {
                    header: 'Fecha',
                    cell: (info) => new Date(info.getValue()).toLocaleString(),
                }),
                columnHelper.accessor('conceptoNombre', { header: 'Concepto' }),
                columnHelper.accessor('tipoMovimiento', {
                    header: 'Tipo',
                    cell: (info) => (
                        <Tag color={info.getValue() === 'INGRESO' ? 'green' : 'red'}>
                            {info.getValue()}
                        </Tag>
                    ),
                }),
                columnHelper.accessor('metodoPagoCodigo', {
                    header: 'Método',
                    cell: (info) => info.getValue() ?? '—',
                }),
                columnHelper.accessor('descripcion', {
                    header: 'Descripción',
                    cell: (info) => info.getValue() ?? '—',
                }),
                columnHelper.accessor('importe', {
                    header: 'Importe',
                    cell: (info) => formatMoney(info.getValue()),
                }),
                columnHelper.accessor('estado', {
                    header: 'Estado',
                    cell: (info) => <Tag>{info.getValue()}</Tag>,
                }),
                columnHelper.accessor('createdBy', {
                    header: 'Usuario',
                    cell: (info) => info.getValue() ?? '—',
                }),
            ] as ColumnDef<MovimientoCaja, unknown>[],
        [],
    )

    return (
        <AppDataTable
            className="rrhh-empleados__table"
            data={items}
            columns={columns}
            loading={loading}
            emptyText="No hay movimientos."
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
