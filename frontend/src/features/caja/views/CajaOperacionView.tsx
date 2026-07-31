import { useMemo, useState } from 'react'
import {
    DollarOutlined,
    LockOutlined,
    PlusOutlined,
    SwapOutlined,
    UnlockOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'
import {
    Button,
    Card,
    Col,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'

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
    const [cajaId, setCajaId] = useState<string>()
    const [montoInicial, setMontoInicial] = useState(0)
    const [obsApertura, setObsApertura] = useState('')
    const [conceptoId, setConceptoId] = useState<string>()
    const [metodoId, setMetodoId] = useState<string>()
    const [importeMov, setImporteMov] = useState<number>(0)
    const [descMov, setDescMov] = useState('')
    const [montoContado, setMontoContado] = useState<number>(0)
    const [obsArqueo, setObsArqueo] = useState('')

    const conceptosFiltrados = useMemo(() => {
        if (!conceptos || !openMovimiento) return []
        return conceptos.filter(
            (c) =>
                c.activo &&
                c.tipoMovimiento === openMovimiento &&
                c.codigo !== 'FONDO_INICIAL',
        )
    }, [conceptos, openMovimiento])

    const diferenciaArqueo = useMemo(() => {
        const esperado = resumen?.efectivoEsperado ?? 0
        return Math.round((montoContado - esperado) * 100) / 100
    }, [montoContado, resumen?.efectivoEsperado])

    if (isFetching && turno === undefined) {
        return <Text type="secondary">Cargando estado de caja…</Text>
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Title level={3} className="admin-page__title">
                    Operación de caja
                </Title>
                <Text type="secondary">Apertura, cobros, movimientos y cierre</Text>
            </header>

            <div className="admin-page__workspace">
                <Card style={{ marginBottom: 16 }}>
                    {turno ? (
                        <Flex justify="space-between" align="center" wrap gap={12}>
                            <Space direction="vertical" size={0}>
                                <Text strong>
                                    {turno.cajaCodigo} · {turno.cajaNombre}
                                </Text>
                                <Text type="secondary">
                                    Abierto desde {new Date(turno.fechaApertura).toLocaleString()}
                                </Text>
                                <Tag color="green">TURNO ABIERTO</Tag>
                            </Space>
                            <Space wrap>
                                <Link to="/caja/cuentas">
                                    <Button type="primary" icon={<DollarOutlined />}>
                                        Registrar cobro
                                    </Button>
                                </Link>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setOpenMovimiento('INGRESO')}
                                >
                                    Ingreso
                                </Button>
                                <Button
                                    icon={<SwapOutlined />}
                                    onClick={() => setOpenMovimiento('EGRESO')}
                                >
                                    Egreso
                                </Button>
                                <Link to="/caja/movimientos">
                                    <Button>Ver movimientos</Button>
                                </Link>
                                <Button
                                    danger
                                    icon={<LockOutlined />}
                                    onClick={() => {
                                        setMontoContado(resumen?.efectivoEsperado ?? 0)
                                        setOpenArqueo(true)
                                    }}
                                >
                                    Arqueo / Cerrar
                                </Button>
                            </Space>
                        </Flex>
                    ) : (
                        <Flex justify="space-between" align="center" wrap gap={12}>
                            <Space direction="vertical" size={0}>
                                <Text strong>No hay turno abierto</Text>
                                <Text type="secondary">
                                    Abra una caja para registrar cobros y movimientos.
                                </Text>
                                <Tag color="default">SIN TURNO</Tag>
                            </Space>
                            <Button
                                type="primary"
                                icon={<UnlockOutlined />}
                                onClick={() => setOpenApertura(true)}
                            >
                                Abrir caja
                            </Button>
                        </Flex>
                    )}
                </Card>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Monto inicial"
                                value={resumen?.montoInicial ?? turno?.montoInicial ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Ingresos"
                                value={resumen?.ingresos ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Egresos"
                                value={resumen?.egresos ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Efectivo esperado"
                                value={resumen?.efectivoEsperado ?? 0}
                                formatter={(v) => formatMoney(Number(v))}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Abrir turno de caja"
                open={openApertura}
                onCancel={() => setOpenApertura(false)}
                confirmLoading={abrirTurno.isPending}
                onOk={() => {
                    if (!cajaId) return
                    void abrirTurno.mutateAsync({
                        cajaId,
                        montoInicial,
                        observacionApertura: obsApertura || null,
                    }).then(() => setOpenApertura(false))
                }}
                okButtonProps={{ disabled: !cajaId || montoInicial < 0 }}
            >
                <Form layout="vertical">
                    <Form.Item label="Caja" required>
                        <Select
                            placeholder="Seleccione caja"
                            value={cajaId}
                            onChange={setCajaId}
                            options={(cajasPage?.items ?? []).map((c) => ({
                                value: c.id,
                                label: `${c.codigo} · ${c.nombre}`,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Monto inicial" required>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            value={montoInicial}
                            onChange={(v) => setMontoInicial(Number(v ?? 0))}
                        />
                    </Form.Item>
                    <Form.Item label="Observación">
                        <Input.TextArea
                            rows={2}
                            value={obsApertura}
                            onChange={(e) => setObsApertura(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={openMovimiento === 'EGRESO' ? 'Registrar egreso' : 'Registrar ingreso'}
                open={openMovimiento != null}
                onCancel={() => setOpenMovimiento(null)}
                confirmLoading={registrarIngreso.isPending || registrarEgreso.isPending}
                onOk={() => {
                    if (!conceptoId || importeMov <= 0) return
                    const payload = {
                        conceptoCajaId: conceptoId,
                        importe: importeMov,
                        metodoPagoId: metodoId || null,
                        descripcion: descMov || null,
                    }
                    const action =
                        openMovimiento === 'EGRESO'
                            ? registrarEgreso.mutateAsync(payload)
                            : registrarIngreso.mutateAsync(payload)
                    void action.then(() => {
                        setOpenMovimiento(null)
                        setConceptoId(undefined)
                        setImporteMov(0)
                        setDescMov('')
                    })
                }}
            >
                <Form layout="vertical">
                    <Form.Item label="Concepto" required>
                        <Select
                            value={conceptoId}
                            onChange={setConceptoId}
                            options={conceptosFiltrados.map((c) => ({
                                value: c.id,
                                label: c.nombre,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Método">
                        <Select
                            allowClear
                            value={metodoId}
                            onChange={setMetodoId}
                            options={(metodos ?? []).map((m) => ({
                                value: m.id,
                                label: m.nombre,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Importe" required>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0.01}
                            step={0.01}
                            value={importeMov}
                            onChange={(v) => setImporteMov(Number(v ?? 0))}
                        />
                    </Form.Item>
                    <Form.Item label="Descripción">
                        <Input.TextArea
                            rows={2}
                            value={descMov}
                            onChange={(e) => setDescMov(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Arqueo y cierre de caja"
                open={openArqueo}
                onCancel={() => setOpenArqueo(false)}
                okText="Confirmar cierre"
                okButtonProps={{
                    danger: true,
                    disabled:
                        Math.abs(diferenciaArqueo) > 0.009 && !obsArqueo.trim(),
                }}
                confirmLoading={cerrarArqueo.isPending}
                onOk={() => {
                    if (!turno) return
                    void cerrarArqueo
                        .mutateAsync({
                            turnoId: turno.id,
                            payload: {
                                montoContado,
                                observaciones: obsArqueo || null,
                            },
                        })
                        .then(() => setOpenArqueo(false))
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Statistic
                        title="Monto esperado"
                        value={resumen?.efectivoEsperado ?? 0}
                        formatter={(v) => formatMoney(Number(v))}
                    />
                    <Form layout="vertical">
                        <Form.Item label="Monto contado" required>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={0.01}
                                value={montoContado}
                                onChange={(v) => setMontoContado(Number(v ?? 0))}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Diferencia"
                            help={
                                Math.abs(diferenciaArqueo) > 0.009
                                    ? 'Debe indicar observación si hay diferencia.'
                                    : undefined
                            }
                        >
                            <Tag color={diferenciaArqueo === 0 ? 'green' : 'orange'}>
                                {formatMoney(diferenciaArqueo)}
                            </Tag>
                        </Form.Item>
                        <Form.Item
                            label="Observación"
                            required={Math.abs(diferenciaArqueo) > 0.009}
                        >
                            <Input.TextArea
                                rows={2}
                                value={obsArqueo}
                                onChange={(e) => setObsArqueo(e.target.value)}
                            />
                        </Form.Item>
                    </Form>
                </Space>
            </Modal>
        </div>
    )
}
