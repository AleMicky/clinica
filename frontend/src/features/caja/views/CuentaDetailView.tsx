import { useMemo, useState } from 'react'
import {
    ArrowLeftOutlined,
    EyeOutlined,
    FileTextOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    StopOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import {
    Alert,
    Button,
    Descriptions,
    Flex,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd'

import { WorkflowEmployeeSelect } from '../../workflow/components/WorkflowEmployeeSelect'
import { AnularPagoDrawer } from '../components/AnularPagoDrawer'
import { PagoDetailDrawer } from '../components/PagoDetailDrawer'
import {
    useAnularPago,
    useCuenta,
    useMetodosPago,
    usePago,
    useRegistrarPago,
    useTurnoAbierto,
} from '../hooks/caja.hooks'
import type { AnularPagoPayload, Pago } from '../types/caja.types'

const { Title, Text } = Typography

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

type LineaPago = {
    key: string
    metodoPagoId?: string
    importe: number
    numeroReferencia?: string
}

type CuentaDetailViewProps = {
    cuentaId: string
}

export function CuentaDetailView({ cuentaId }: CuentaDetailViewProps) {
    const { data: cuenta, isFetching } = useCuenta(cuentaId)
    const { data: turno } = useTurnoAbierto()
    const { data: metodos } = useMetodosPago()
    const registrarPago = useRegistrarPago()
    const anularPagoMutation = useAnularPago()
    const [lineas, setLineas] = useState<LineaPago[]>([
        { key: '1', importe: 0 },
    ])
    const [observaciones, setObservaciones] = useState('')
    const [empleadoId, setEmpleadoId] = useState('')
    const [ultimoPago, setUltimoPago] = useState<{ numero: string; recibo?: string } | null>(null)
    const [detailPagoId, setDetailPagoId] = useState<string | null>(null)
    const [anularTarget, setAnularTarget] = useState<Pago | null>(null)
    const { data: pagoDetalle, isFetching: detailLoading } = usePago(detailPagoId ?? undefined)

    const totalIngresado = useMemo(
        () => Math.round(lineas.reduce((acc, l) => acc + (l.importe || 0), 0) * 100) / 100,
        [lineas],
    )

    if (isFetching && !cuenta) {
        return <Text type="secondary">Cargando cuenta…</Text>
    }

    if (!cuenta) {
        return <Text type="danger">No se encontró la cuenta.</Text>
    }

    const canPay = cuenta.estado === 'ABIERTA' || cuenta.estado === 'PARCIAL'
    const diferencia = Math.round((totalIngresado - cuenta.saldo) * 100) / 100

    const metodosInvalidos = lineas.some((linea) => {
        if (!linea.metodoPagoId || linea.importe <= 0) return true
        const metodo = metodos?.find((m) => m.id === linea.metodoPagoId)
        if (!metodo) return true
        if (metodo.requiereReferencia && !linea.numeroReferencia?.trim()) return true
        return false
    })

    const canConfirm =
        Boolean(turno) &&
        canPay &&
        Boolean(empleadoId) &&
        !metodosInvalidos &&
        Math.abs(diferencia) < 0.009 &&
        totalIngresado > 0 &&
        totalIngresado <= cuenta.saldo

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16}>
                    <Link to="/caja/cuentas">
                        <Button type="text" icon={<ArrowLeftOutlined />} />
                    </Link>
                    <div>
                        <Title level={3} className="admin-page__title">
                            Cuenta {cuenta.numero}
                        </Title>
                        <Text type="secondary">
                            {cuenta.moduloOrigen} · {cuenta.entidadOrigen} ·{' '}
                            <Tag>{cuenta.estado}</Tag>
                        </Text>
                    </div>
                </Flex>
            </header>

            <div className="admin-page__workspace">
                {!turno ? (
                    <Alert
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message="No hay turno abierto"
                        description="Debe abrir un turno de caja antes de registrar cobros."
                        action={
                            <Link to="/caja">
                                <Button size="small">Ir a operación</Button>
                            </Link>
                        }
                    />
                ) : null}

                {ultimoPago ? (
                    <Alert
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                        message={`Pago ${ultimoPago.numero} registrado`}
                        description={
                            ultimoPago.recibo
                                ? `Recibo emitido: ${ultimoPago.recibo}`
                                : undefined
                        }
                    />
                ) : null}

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
                        <Descriptions.Item label="Total cargos">
                            {formatMoney(cuenta.totalCargos)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total pagado">
                            {formatMoney(cuenta.totalPagado)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Saldo">
                            {formatMoney(cuenta.saldo)}
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Title level={5}>Cargos</Title>
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={cuenta.cargos}
                        columns={[
                            { title: 'Concepto', dataIndex: 'concepto' },
                            { title: 'Cant.', dataIndex: 'cantidad', width: 80 },
                            {
                                title: 'Unitario',
                                dataIndex: 'montoUnitario',
                                render: (v: number) => formatMoney(v),
                            },
                            {
                                title: 'Total',
                                dataIndex: 'montoTotal',
                                render: (v: number) => formatMoney(v),
                            },
                        ]}
                    />
                </section>

                {cuenta.pagos.length > 0 ? (
                    <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                        <Title level={5}>Pagos</Title>
                        <Table
                            size="small"
                            rowKey="id"
                            pagination={false}
                            dataSource={cuenta.pagos}
                            columns={[
                                { title: 'Número', dataIndex: 'numero' },
                                { title: 'Método', dataIndex: 'metodoPago' },
                                {
                                    title: 'Monto',
                                    dataIndex: 'monto',
                                    render: (v: number) => formatMoney(v),
                                },
                                {
                                    title: 'Estado',
                                    dataIndex: 'estado',
                                    render: (v: string | undefined) =>
                                        v ? <Tag>{v}</Tag> : '—',
                                },
                                {
                                    title: 'Fecha',
                                    dataIndex: 'fechaPago',
                                    render: (v: string) => new Date(v).toLocaleString(),
                                },
                                {
                                    title: '',
                                    key: 'actions',
                                    render: (_: unknown, pago: Pago) => {
                                        const canAnular = pago.estado === 'CONFIRMADO'
                                        return (
                                            <Space>
                                                <Tooltip title="Ver detalle">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<EyeOutlined />}
                                                        onClick={() => setDetailPagoId(pago.id)}
                                                        aria-label="Ver detalle del pago"
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Ver recibo">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<FileTextOutlined />}
                                                        onClick={() => setDetailPagoId(pago.id)}
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
                                                            loading={
                                                                anularPagoMutation.isPending &&
                                                                anularPagoMutation.variables?.id ===
                                                                    pago.id
                                                            }
                                                            onClick={() => setAnularTarget(pago)}
                                                            aria-label="Anular pago"
                                                        />
                                                    </Tooltip>
                                                ) : null}
                                            </Space>
                                        )
                                    },
                                },
                            ]}
                        />
                    </section>
                ) : null}

                {canPay ? (
                    <section className="admin-page__panel">
                        <Title level={5}>Registrar cobro</Title>
                        <Form layout="vertical">
                            <Form.Item label="Empleado (para workflow)" required>
                                <WorkflowEmployeeSelect
                                    value={empleadoId || undefined}
                                    onChange={(value) =>
                                        setEmpleadoId(
                                            typeof value === 'string' ? value : value[0] ?? '',
                                        )
                                    }
                                />
                            </Form.Item>

                            {lineas.map((linea, index) => {
                                const metodo = metodos?.find((m) => m.id === linea.metodoPagoId)
                                return (
                                    <Space
                                        key={linea.key}
                                        align="start"
                                        style={{ display: 'flex', marginBottom: 8 }}
                                        wrap
                                    >
                                        <Form.Item label={index === 0 ? 'Método' : ' '}>
                                            <Select
                                                style={{ width: 200 }}
                                                placeholder="Método"
                                                value={linea.metodoPagoId}
                                                options={(metodos ?? []).map((m) => ({
                                                    value: m.id,
                                                    label: m.nombre,
                                                }))}
                                                onChange={(value) =>
                                                    setLineas((prev) =>
                                                        prev.map((l) =>
                                                            l.key === linea.key
                                                                ? { ...l, metodoPagoId: value }
                                                                : l,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Form.Item>
                                        <Form.Item label={index === 0 ? 'Importe' : ' '}>
                                            <InputNumber
                                                style={{ width: 140 }}
                                                min={0.01}
                                                step={0.01}
                                                value={linea.importe}
                                                onChange={(value) =>
                                                    setLineas((prev) =>
                                                        prev.map((l) =>
                                                            l.key === linea.key
                                                                ? {
                                                                      ...l,
                                                                      importe: Number(value ?? 0),
                                                                  }
                                                                : l,
                                                        ),
                                                    )
                                                }
                                            />
                                        </Form.Item>
                                        {metodo?.requiereReferencia ? (
                                            <Form.Item label={index === 0 ? 'Referencia' : ' '}>
                                                <Input
                                                    style={{ width: 180 }}
                                                    value={linea.numeroReferencia}
                                                    onChange={(e) =>
                                                        setLineas((prev) =>
                                                            prev.map((l) =>
                                                                l.key === linea.key
                                                                    ? {
                                                                          ...l,
                                                                          numeroReferencia:
                                                                              e.target.value,
                                                                      }
                                                                    : l,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </Form.Item>
                                        ) : null}
                                        {lineas.length > 1 ? (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() =>
                                                    setLineas((prev) =>
                                                        prev.filter((l) => l.key !== linea.key),
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </Space>
                                )
                            })}

                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                    setLineas((prev) => [
                                        ...prev,
                                        { key: String(Date.now()), importe: 0 },
                                    ])
                                }
                                style={{ marginBottom: 16 }}
                            >
                                Agregar método
                            </Button>

                            <Descriptions size="small" column={3} style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="Saldo pendiente">
                                    {formatMoney(cuenta.saldo)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Total ingresado">
                                    {formatMoney(totalIngresado)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Diferencia">
                                    <Tag color={Math.abs(diferencia) < 0.009 ? 'green' : 'orange'}>
                                        {formatMoney(diferencia)}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>

                            <Form.Item label="Observaciones">
                                <Input.TextArea
                                    rows={2}
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                loading={registrarPago.isPending}
                                disabled={!canConfirm}
                                onClick={() =>
                                    void registrarPago
                                        .mutateAsync({
                                            id: cuenta.id,
                                            payload: {
                                                observaciones: observaciones || null,
                                                empleadoId: empleadoId || null,
                                                detalles: lineas.map((l) => ({
                                                    metodoPagoId: l.metodoPagoId!,
                                                    importe: l.importe,
                                                    numeroReferencia: l.numeroReferencia || null,
                                                })),
                                            },
                                        })
                                        .then((pago) => {
                                            setUltimoPago({
                                                numero: pago.numero,
                                                recibo: pago.recibo?.numero,
                                            })
                                            setLineas([{ key: '1', importe: 0 }])
                                            setObservaciones('')
                                        })
                                }
                            >
                                Confirmar cobro {formatMoney(totalIngresado)}
                            </Button>
                        </Form>
                    </section>
                ) : null}
            </div>

            <PagoDetailDrawer
                open={Boolean(detailPagoId)}
                pago={pagoDetalle}
                loading={detailLoading}
                onClose={() => setDetailPagoId(null)}
                onAnular={() => {
                    if (!pagoDetalle) return
                    setAnularTarget({
                        id: pagoDetalle.id,
                        numero: pagoDetalle.numero,
                        monto: pagoDetalle.monto,
                        estado: pagoDetalle.estado,
                        fechaPago: pagoDetalle.fechaPago,
                        observaciones: pagoDetalle.observaciones,
                        createdAt: pagoDetalle.createdAt,
                    })
                }}
            />

            <AnularPagoDrawer
                open={Boolean(anularTarget)}
                pago={anularTarget}
                loading={anularPagoMutation.isPending}
                onClose={() => setAnularTarget(null)}
                onSubmit={async (payload: AnularPagoPayload) => {
                    if (!anularTarget) return
                    await anularPagoMutation.mutateAsync({
                        id: anularTarget.id,
                        payload,
                    })
                    setAnularTarget(null)
                    setDetailPagoId(null)
                }}
            />
        </div>
    )
}
