import { Card, Col, Row, Statistic, Typography } from 'antd'

import { MovimientosFiltersBar } from '../components/MovimientosFiltersBar'
import { MovimientosTable } from '../components/MovimientosTable'
import { useMovimientosView } from '../hooks/use-movimientos-view'

const { Text } = Typography

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function MovimientosView() {
    const { loading, caption, turno, resumen, filters, table } = useMovimientosView()

    return (
        <div className="rrhh-section-panel rrhh-empleados">
            <div className="rrhh-section-panel__filters">
                <MovimientosFiltersBar
                    tipoMovimiento={filters.tipoMovimiento}
                    conceptoCajaId={filters.conceptoCajaId}
                    metodoPagoId={filters.metodoPagoId}
                    estado={filters.estado}
                    filtroTurnoAbierto={filters.filtroTurnoAbierto}
                    hasTurnoAbierto={filters.hasTurnoAbierto}
                    conceptoOptions={filters.conceptoOptions}
                    metodoOptions={filters.metodoOptions}
                    hasActiveFilters={filters.hasActiveFilters}
                    onTipoChange={filters.onTipoChange}
                    onConceptoChange={filters.onConceptoChange}
                    onMetodoChange={filters.onMetodoChange}
                    onEstadoChange={filters.onEstadoChange}
                    onTurnoAbiertoChange={filters.onTurnoAbiertoChange}
                    onClearFilters={filters.onClearFilters}
                />
            </div>

            <div className="rrhh-section-panel__body">
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    {turno
                        ? `${turno.cajaCodigo} · ${turno.cajaNombre}`
                        : 'Sin turno abierto'}
                </Text>

                {turno ? (
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
                ) : null}

                <p className="rrhh-section-panel__caption rrhh-empleados__caption">{caption}</p>

                <MovimientosTable
                    items={table.items}
                    loading={loading}
                    total={table.total}
                    page={table.page}
                    pageSize={table.pageSize}
                    onPageChange={table.onPageChange}
                />
            </div>
        </div>
    )
}
