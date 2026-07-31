import { useMemo } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import { Tag, Typography } from 'antd'

import { AppDataTable } from '../../../../shared/components/ui/data-table/AppDataTable'
import type { ResultadoDetalle } from '../types/resultado.types'

const { Text } = Typography
const columnHelper = createColumnHelper<ResultadoDetalle>()

function formatValor(detalle: ResultadoDetalle) {
    if (detalle.valorNumerico != null) return String(detalle.valorNumerico)
    if (detalle.valorTexto?.trim()) return detalle.valorTexto.trim()
    return '—'
}

type ResultadoDetallesTableProps = {
    detalles: ResultadoDetalle[]
    loading?: boolean
}

export function ResultadoDetallesTable({
    detalles,
    loading = false,
}: ResultadoDetallesTableProps) {
    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('parametroNombre', {
                    header: 'Parámetro',
                    cell: ({ getValue }) => <Text strong>{getValue()}</Text>,
                }),
                columnHelper.display({
                    id: 'valor',
                    header: 'Valor',
                    size: 120,
                    cell: ({ row }) => formatValor(row.original),
                }),
                columnHelper.accessor('fueraDeRango', {
                    header: 'Rango',
                    size: 130,
                    cell: ({ getValue }) =>
                        getValue() ? (
                            <Tag color="error">Fuera de rango</Tag>
                        ) : (
                            <Tag color="success">Normal</Tag>
                        ),
                }),
                columnHelper.accessor('observaciones', {
                    header: 'Observaciones',
                    cell: ({ getValue }) => getValue()?.trim() || '—',
                }),
            ] as ColumnDef<ResultadoDetalle, unknown>[],
        [],
    )

    return (
        <AppDataTable
            data={detalles}
            columns={columns}
            loading={loading}
            emptyText="Sin parámetros registrados."
            getRowId={(row) => row.id}
        />
    )
}
