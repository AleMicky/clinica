import { Tag, Typography, Card, Col, Row, Statistic } from 'antd'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { useMovimientos, useResumenTurno, useTurnoAbierto } from '../hooks/caja.hooks'
import type { MovimientoCaja } from '../types/caja.types'

const { Title, Text } = Typography
const columnHelper = createColumnHelper<MovimientoCaja>()

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function MovimientosView() {
    const { data: turno } = useTurnoAbierto()
    const { data: resumen } = useResumenTurno(turno?.id)
    const { data, isFetching } = useMovimientos({
        page: 1,
        pageSize: 50,
        turnoCajaId: turno?.id,
    })

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
        <div className="admin-page">
            <header className="admin-page__header">
                <Title level={3} className="admin-page__title">
                    Movimientos de caja
                </Title>
                <Text type="secondary">
                    {turno
                        ? `${turno.cajaCodigo} · ${turno.cajaNombre}`
                        : 'Sin turno abierto'}
                </Text>
            </header>

            <div className="admin-page__workspace">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Monto inicial"
                                value={resumen?.montoInicial ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Ingresos"
                                value={resumen?.ingresos ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Egresos"
                                value={resumen?.egresos ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Efectivo esperado"
                                value={resumen?.efectivoEsperado ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                </Row>

                <AppDataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isFetching}
                    emptyText="No hay movimientos."
                    getRowId={(row) => row.id}
                    pagination={{
                        page: 1,
                        pageSize: 50,
                        total: data?.totalRecords ?? 0,
                        onChange: () => undefined,
                    }}
                    className="rrhh-empleados__table"
                />
            </div>
        </div>
    )
}
