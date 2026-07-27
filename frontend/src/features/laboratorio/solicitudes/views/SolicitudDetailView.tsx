import { useState } from 'react'
import {
    Button,
    Descriptions,
    Empty,
    Flex,
    Table,
    Tag,
    Typography,
} from 'antd'
import { ArrowLeftOutlined, DollarOutlined, ExperimentOutlined, SolutionOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { pacientesService } from '../../../pacientes/services/pacientes.service'
import { WorkflowEntityPanel } from '../../../workflow/components/WorkflowEntityPanel'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import { useMuestras, useTomarMuestra } from '../../muestras/hooks/muestras.hooks'
import { MUESTRA_ESTADO_COLORS, MUESTRA_ESTADO_LABELS } from '../../muestras/types/muestra.types'
import { useRegistrarResultados, useResultados, useValidarResultado } from '../../resultados/hooks/resultados.hooks'
import {
    RESULTADO_ESTADO_COLORS,
    RESULTADO_ESTADO_LABELS,
    type Resultado,
} from '../../resultados/types/resultado.types'
import type { Muestra } from '../../muestras/types/muestra.types'
import { DerivarDetalleModal } from '../components/DerivarDetalleModal'
import { RegistrarResultadosModal } from '../components/RegistrarResultadosModal'
import { TomarMuestraModal } from '../components/TomarMuestraModal'
import { useDerivarDetalle, useEnviarACaja, useSolicitud } from '../hooks/solicitudes.hooks'
import {
    SOLICITUD_ESTADO_COLORS,
    SOLICITUD_ESTADO_LABELS,
    SOLICITUD_ORIGEN_LABELS,
    type SolicitudDetalle,
} from '../types/solicitud.types'

const { Title, Text } = Typography

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

function formatDateTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString('es-BO')
}

type SolicitudDetailViewProps = {
    solicitudId: string
}

export function SolicitudDetailView({ solicitudId }: SolicitudDetailViewProps) {
    const { data: solicitud, isFetching, refetch } = useSolicitud(solicitudId)
    const { data: muestrasData } = useMuestras({ page: 1, pageSize: 50, solicitudId })
    const { data: resultadosData } = useResultados({ page: 1, pageSize: 50, solicitudId })
    const { data: paciente } = useAppQuery({
        queryKey: queryKeys.pacientes.detail(solicitud?.pacienteId ?? ''),
        queryFn: () => pacientesService.getById(solicitud!.pacienteId),
        enabled: Boolean(solicitud?.pacienteId),
    })

    const enviarACaja = useEnviarACaja()
    const derivarDetalle = useDerivarDetalle()
    const tomarMuestra = useTomarMuestra()
    const registrarResultados = useRegistrarResultados()
    const validarResultado = useValidarResultado()

    const [empleadoId, setEmpleadoId] = useState('')
    const [derivarTarget, setDerivarTarget] = useState<SolicitudDetalle | null>(null)
    const [muestraModalOpen, setMuestraModalOpen] = useState(false)
    const [resultadosModalOpen, setResultadosModalOpen] = useState(false)
    const [validarEmpleadoId, setValidarEmpleadoId] = useState('')

    if (isFetching && !solicitud) {
        return <Text type="secondary">Cargando solicitud…</Text>
    }

    if (!solicitud) {
        return <Text type="danger">No se encontró la solicitud.</Text>
    }

    const muestras = muestrasData?.items ?? []
    const resultados = resultadosData?.items ?? []
    const canSendToCaja = solicitud.estado === 'BORRADOR'

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16} justify="space-between" wrap="wrap">
                    <Flex align="center" gap={16}>
                        <Link to="/laboratorio/solicitudes">
                            <Button type="text" icon={<ArrowLeftOutlined />} />
                        </Link>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Solicitud {solicitud.numero}
                            </Title>
                            <Text type="secondary">
                                {formatDateTime(solicitud.fechaSolicitud)} ·{' '}
                                <Tag color={SOLICITUD_ESTADO_COLORS[solicitud.estado] ?? 'default'}>
                                    {SOLICITUD_ESTADO_LABELS[solicitud.estado] ?? solicitud.estado}
                                </Tag>
                            </Text>
                        </div>
                    </Flex>
                    {canSendToCaja ? (
                        <Flex gap={8} align="center" wrap="wrap">
                            <WorkflowEmployeeSelect
                                value={empleadoId || undefined}
                                onChange={(value) =>
                                    setEmpleadoId(typeof value === 'string' ? value : value[0] ?? '')
                                }
                                placeholder="Empleado ejecutor"
                            />
                            <Button
                                type="primary"
                                icon={<DollarOutlined />}
                                loading={enviarACaja.isPending}
                                disabled={!empleadoId}
                                onClick={() =>
                                    void enviarACaja
                                        .mutateAsync({ id: solicitud.id, data: { empleadoId } })
                                        .then(() => refetch())
                                }
                            >
                                Enviar a caja
                            </Button>
                        </Flex>
                    ) : null}
                </Flex>
            </header>

            <div className="admin-page__workspace">
                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
                        <Descriptions.Item label="Paciente">
                            {paciente?.personaNombreCompleto ?? solicitud.pacienteId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Origen">
                            {SOLICITUD_ORIGEN_LABELS[solicitud.origen] ?? solicitud.origen}
                        </Descriptions.Item>
                        <Descriptions.Item label="Médico externo">
                            {solicitud.medicoExternoNombre?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Observaciones" span={3}>
                            {solicitud.observaciones?.trim() || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            Pruebas solicitadas
                        </Title>
                    </Flex>
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={solicitud.detalles}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Sin pruebas registradas"
                                />
                            ),
                        }}
                        columns={[
                            { title: 'Prueba', dataIndex: 'pruebaNombre' },
                            {
                                title: 'Cant.',
                                dataIndex: 'cantidad',
                                width: 80,
                            },
                            {
                                title: 'Precio unitario',
                                dataIndex: 'precioUnitario',
                                width: 140,
                                render: (value: number) => formatMoney(value),
                            },
                            {
                                title: 'Subtotal',
                                key: 'subtotal',
                                width: 140,
                                render: (_, record: SolicitudDetalle) =>
                                    formatMoney(record.precioUnitario * record.cantidad),
                            },
                            {
                                title: 'Derivación',
                                key: 'derivacion',
                                width: 220,
                                render: (_, record: SolicitudDetalle) =>
                                    record.esDerivada ? (
                                        <Tag color="purple">
                                            {record.laboratorioExternoNombre || 'Derivada'}
                                        </Tag>
                                    ) : (
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={() => setDerivarTarget(record)}
                                        >
                                            Derivar
                                        </Button>
                                    ),
                            },
                        ]}
                    />
                </section>

                {solicitud.pagos.length > 0 ? (
                    <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                        <Title level={5}>Pagos / cuentas asociadas</Title>
                        <Table
                            size="small"
                            rowKey="id"
                            pagination={false}
                            dataSource={solicitud.pagos}
                            columns={[
                                {
                                    title: 'Fecha de envío',
                                    dataIndex: 'fechaEnvio',
                                    render: (value: string) => formatDateTime(value),
                                },
                                {
                                    title: 'Monto total',
                                    dataIndex: 'montoTotal',
                                    render: (value: number) => formatMoney(value),
                                },
                                { title: 'Estado', dataIndex: 'estado' },
                            ]}
                        />
                    </section>
                ) : null}

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <WorkflowEntityPanel
                        referenceModule="Laboratorio"
                        referenceEntity="Solicitud"
                        referenceId={solicitud.id}
                        definitionCode="LABORATORIO"
                        variant="embedded"
                        onStateChange={() => {
                            void refetch()
                        }}
                    />
                </section>

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            <ExperimentOutlined /> Muestras
                        </Title>
                        <Button size="small" onClick={() => setMuestraModalOpen(true)}>
                            Tomar muestra
                        </Button>
                    </Flex>
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={muestras}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Sin muestras registradas"
                                />
                            ),
                        }}
                        columns={[
                            { title: 'Código', dataIndex: 'codigo' },
                            {
                                title: 'Fecha de toma',
                                dataIndex: 'fechaToma',
                                render: (value: string) => formatDateTime(value),
                            },
                            {
                                title: 'Estado',
                                dataIndex: 'estado',
                                render: (value: string) => (
                                    <Tag color={MUESTRA_ESTADO_COLORS[value] ?? 'default'}>
                                        {MUESTRA_ESTADO_LABELS[value] ?? value}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Pruebas',
                                key: 'detalles',
                                render: (_, record: Muestra) => (
                                    <Tag>{record.detalles.length}</Tag>
                                ),
                            },
                        ]}
                    />
                </section>

                <section className="admin-page__panel">
                    <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            <SolutionOutlined /> Resultados
                        </Title>
                        <Flex gap={8} align="center">
                            <WorkflowEmployeeSelect
                                value={validarEmpleadoId || undefined}
                                onChange={(value) =>
                                    setValidarEmpleadoId(
                                        typeof value === 'string' ? value : value[0] ?? '',
                                    )
                                }
                                placeholder="Empleado validador"
                            />
                            <Button size="small" onClick={() => setResultadosModalOpen(true)}>
                                Registrar resultados
                            </Button>
                        </Flex>
                    </Flex>
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        dataSource={resultados}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Sin resultados registrados"
                                />
                            ),
                        }}
                        columns={[
                            {
                                title: 'Estado',
                                dataIndex: 'estado',
                                render: (value: string) => (
                                    <Tag color={RESULTADO_ESTADO_COLORS[value] ?? 'default'}>
                                        {RESULTADO_ESTADO_LABELS[value] ?? value}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Parámetros',
                                key: 'detalles',
                                render: (_, record: Resultado) => (
                                    <Tag>{record.detalles.length}</Tag>
                                ),
                            },
                            {
                                title: 'Validado',
                                dataIndex: 'fechaValidacion',
                                render: (value: string | null) =>
                                    value ? formatDateTime(value) : '—',
                            },
                            {
                                title: '',
                                key: 'actions',
                                render: (_, record: Resultado) =>
                                    record.estado === 'REGISTRADO' ? (
                                        <Button
                                            type="link"
                                            size="small"
                                            disabled={!validarEmpleadoId}
                                            loading={validarResultado.isPending}
                                            onClick={() =>
                                                void validarResultado.mutateAsync({
                                                    id: record.id,
                                                    data: { empleadoId: validarEmpleadoId },
                                                })
                                            }
                                        >
                                            Validar
                                        </Button>
                                    ) : null,
                            },
                        ]}
                    />
                </section>
            </div>

            <DerivarDetalleModal
                key={derivarTarget?.id ?? 'none'}
                open={derivarTarget !== null}
                detalle={derivarTarget}
                loading={derivarDetalle.isPending}
                onClose={() => setDerivarTarget(null)}
                onSubmit={async (values) => {
                    if (!derivarTarget) return
                    await derivarDetalle.mutateAsync({
                        id: solicitud.id,
                        detalleId: derivarTarget.id,
                        data: values,
                    })
                    setDerivarTarget(null)
                }}
            />

            <TomarMuestraModal
                key={muestraModalOpen ? 'open' : 'closed'}
                open={muestraModalOpen}
                detalles={solicitud.detalles}
                loading={tomarMuestra.isPending}
                onClose={() => setMuestraModalOpen(false)}
                onSubmit={async (data) => {
                    await tomarMuestra.mutateAsync({ solicitudId: solicitud.id, data })
                    setMuestraModalOpen(false)
                }}
            />

            <RegistrarResultadosModal
                key={resultadosModalOpen ? 'open' : 'closed'}
                open={resultadosModalOpen}
                detalles={solicitud.detalles}
                muestras={muestras}
                loading={registrarResultados.isPending}
                onClose={() => setResultadosModalOpen(false)}
                onSubmit={async (data) => {
                    await registrarResultados.mutateAsync({
                        solicitudId: solicitud.id,
                        data,
                    })
                    setResultadosModalOpen(false)
                }}
            />
        </div>
    )
}
