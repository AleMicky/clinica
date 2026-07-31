import { useMemo, useState } from 'react'
import {
    DollarOutlined,
    LockOutlined,
    PlusOutlined,
    SwapOutlined,
    UnlockOutlined,
    WalletOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Row,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'

import { AbrirTurnoDrawer } from '../components/AbrirTurnoDrawer'
import { CerrarTurnoDrawer } from '../components/CerrarTurnoDrawer'
import { RegistrarMovimientoDrawer } from '../components/RegistrarMovimientoDrawer'
import {
    useAbrirTurno,
    useCajas,
    useCerrarArqueo,
    useConceptosCaja,
    useMetodosPago,
    useRegistrarEgreso,
    useRegistrarIngreso,
    useResumenTurno,
    useTurnoAbierto,
} from '../hooks/caja.hooks'
import type { RegistrarMovimientoPayload } from '../types/caja.types'

const { Title, Text } = Typography

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function CajaOperacionView() {
    const { data: turno, isFetching } = useTurnoAbierto()
    const { data: resumen } = useResumenTurno(turno?.id)
    const { data: cajasPage } = useCajas({ page: 1, pageSize: 50, activo: true })
    const { data: conceptos } = useConceptosCaja()
    const { data: metodos } = useMetodosPago()
    const abrirTurno = useAbrirTurno()
    const cerrarArqueo = useCerrarArqueo()
    const registrarIngreso = useRegistrarIngreso()
    const registrarEgreso = useRegistrarEgreso()

    const [openApertura, setOpenApertura] = useState(false)
    const [openMovimiento, setOpenMovimiento] = useState<'INGRESO' | 'EGRESO' | null>(null)
    const [openArqueo, setOpenArqueo] = useState(false)

    const conceptosFiltrados = useMemo(() => {
        if (!conceptos || !openMovimiento) return []
        return conceptos
            .filter(
                (c) =>
                    c.activo &&
                    c.tipoMovimiento === openMovimiento &&
                    c.codigo !== 'FONDO_INICIAL',
            )
            .map((c) => ({ value: c.id, label: c.nombre }))
    }, [conceptos, openMovimiento])

    const cajaOptions = useMemo(
        () =>
            (cajasPage?.items ?? []).map((c) => ({
                value: c.id,
                label: `${c.codigo} · ${c.nombre}`,
            })),
        [cajasPage?.items],
    )

    if (isFetching && turno === undefined) {
        return <Text type="secondary">Cargando estado de caja…</Text>
    }

    const handleRegistrarMovimiento = async (payload: RegistrarMovimientoPayload) => {
        if (openMovimiento === 'EGRESO') {
            await registrarEgreso.mutateAsync(payload)
        } else {
            await registrarIngreso.mutateAsync(payload)
        }
        setOpenMovimiento(null)
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16} wrap="wrap" justify="space-between">
                    <Flex align="center" gap={12}>
                        <div className="admin-page__header-icon" aria-hidden>
                            <WalletOutlined />
                        </div>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Operación de caja
                            </Title>
                            <Text type="secondary">
                                Apertura, cobros, movimientos y cierre de turno
                            </Text>
                        </div>
                    </Flex>
                    {turno ? (
                        <Flex className="admin-page__header-stats" gap={8} wrap="wrap">
                            <div className="admin-page__stat">
                                <Statistic
                                    title="Efectivo esperado"
                                    value={resumen?.efectivoEsperado ?? 0}
                                    formatter={(v) => formatMoney(Number(v))}
                                />
                            </div>
                        </Flex>
                    ) : null}
                </Flex>
            </header>

            <div className="admin-page__workspace">
                {turno ? (
                    <Alert
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message={
                            <Flex align="center" gap={8} wrap="wrap">
                                <Text strong>
                                    {turno.cajaCodigo} · {turno.cajaNombre}
                                </Text>
                                <Tag color="success">TURNO ABIERTO</Tag>
                            </Flex>
                        }
                        description={`Abierto desde ${new Date(turno.fechaApertura).toLocaleString('es-BO')}${
                            turno.empleadoAperturaNombre
                                ? ` · ${turno.empleadoAperturaNombre}`
                                : ''
                        }`}
                        action={
                            <Space wrap>
                                <Link to="/caja/cuentas">
                                    <Button type="primary" icon={<DollarOutlined />}>
                                        Registrar cobro
                                    </Button>
                                </Link>
                                <Button
                                    danger
                                    icon={<LockOutlined />}
                                    onClick={() => setOpenArqueo(true)}
                                >
                                    Arqueo / Cerrar
                                </Button>
                            </Space>
                        }
                    />
                ) : (
                    <Alert
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message={
                            <Flex align="center" gap={8} wrap="wrap">
                                <Text strong>No hay turno abierto</Text>
                                <Tag>SIN TURNO</Tag>
                            </Flex>
                        }
                        description="Abra una caja para registrar cobros y movimientos."
                        action={
                            <Button
                                type="primary"
                                icon={<UnlockOutlined />}
                                onClick={() => setOpenApertura(true)}
                            >
                                Abrir caja
                            </Button>
                        }
                    />
                )}

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Monto inicial"
                                value={resumen?.montoInicial ?? turno?.montoInicial ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Ingresos"
                                value={resumen?.ingresos ?? 0}
                                valueStyle={{ color: 'var(--ant-color-success)' }}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Egresos"
                                value={resumen?.egresos ?? 0}
                                valueStyle={{ color: 'var(--ant-color-error)' }}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                        <Card size="small">
                            <Statistic
                                title="Efectivo esperado"
                                value={resumen?.efectivoEsperado ?? 0}
                                valueStyle={{ color: 'var(--ant-color-primary)' }}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                </Row>

                {turno ? (
                    <Card size="small" title="Movimientos del turno">
                        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                            Registre ingresos o egresos manuales, o revise el detalle del turno.
                        </Text>
                        <Flex gap={8} wrap="wrap">
                            <Button
                                type="primary"
                                ghost
                                icon={<PlusOutlined />}
                                onClick={() => setOpenMovimiento('INGRESO')}
                            >
                                Ingreso
                            </Button>
                            <Button
                                danger
                                ghost
                                icon={<SwapOutlined />}
                                onClick={() => setOpenMovimiento('EGRESO')}
                            >
                                Egreso
                            </Button>
                            <Divider type="vertical" style={{ height: 32, margin: '0 4px' }} />
                            <Link to="/caja/movimientos">
                                <Button>Ver movimientos</Button>
                            </Link>
                        </Flex>
                    </Card>
                ) : null}
            </div>

            <AbrirTurnoDrawer
                open={openApertura}
                loading={abrirTurno.isPending}
                cajaOptions={cajaOptions}
                onClose={() => setOpenApertura(false)}
                onSubmit={async (payload) => {
                    await abrirTurno.mutateAsync(payload)
                    setOpenApertura(false)
                }}
            />

            <RegistrarMovimientoDrawer
                open={openMovimiento != null}
                tipo={openMovimiento}
                loading={registrarIngreso.isPending || registrarEgreso.isPending}
                conceptoOptions={conceptosFiltrados}
                metodos={metodos}
                onClose={() => setOpenMovimiento(null)}
                onSubmit={handleRegistrarMovimiento}
            />

            <CerrarTurnoDrawer
                open={openArqueo}
                turno={turno ?? null}
                resumen={resumen}
                loading={cerrarArqueo.isPending}
                onClose={() => setOpenArqueo(false)}
                onSubmit={async (payload) => {
                    if (!turno) return
                    await cerrarArqueo.mutateAsync({ turnoId: turno.id, payload })
                    setOpenArqueo(false)
                }}
            />
        </div>
    )
}
