import { useMemo, useState } from 'react'
import {
    Button,
    Empty,
    Flex,
    Popconfirm,
    Skeleton,
    Table,
    Tabs,
    Tag,
    Typography,
} from 'antd'
import {
    ArrowLeftOutlined,
    DollarOutlined,
    ExperimentOutlined,
    NodeIndexOutlined,
    SolutionOutlined,
} from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { pacientesService } from '../../../pacientes/services/pacientes.service'
import { WorkflowEntityModal } from '../../../workflow/components/WorkflowEntityModal'
import { WorkflowEmployeeSelect } from '../../../workflow/components/WorkflowEmployeeSelect'
import { useMuestras, useTomarMuestra } from '../../muestras/hooks/muestras.hooks'
import { MUESTRA_ESTADO_COLORS, MUESTRA_ESTADO_LABELS } from '../../muestras/types/muestra.types'
import {
    useEntregarResultado,
    useRegistrarResultados,
    useResultados,
    useValidarResultado,
} from '../../resultados/hooks/resultados.hooks'
import { ResultadoDetallesTable } from '../../resultados/components/ResultadoDetallesTable'
import {
    RESULTADO_ESTADO_COLORS,
    RESULTADO_ESTADO_LABELS,
    type Resultado,
} from '../../resultados/types/resultado.types'
import type { Muestra } from '../../muestras/types/muestra.types'
import { RegistrarResultadosModal } from '../components/RegistrarResultadosModal'
import { TomarMuestraModal } from '../components/TomarMuestraModal'
import { useEnviarACaja, useSetSolicitudEstado, useSolicitud } from '../hooks/solicitudes.hooks'
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
    return date.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
}

function getInitials(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }
    return nombre.trim().slice(0, 2).toUpperCase() || '—'
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
    const setSolicitudEstado = useSetSolicitudEstado()
    const tomarMuestra = useTomarMuestra()
    const registrarResultados = useRegistrarResultados()
    const validarResultado = useValidarResultado()
    const entregarResultado = useEntregarResultado()

    const [empleadoId, setEmpleadoId] = useState('')
    const [muestraModalOpen, setMuestraModalOpen] = useState(false)
    const [resultadosModalOpen, setResultadosModalOpen] = useState(false)
    const [workflowModalOpen, setWorkflowModalOpen] = useState(false)
    const [validarEmpleadoId, setValidarEmpleadoId] = useState('')

    const muestras = muestrasData?.items ?? []
    const resultados = resultadosData?.items ?? []

    const totalPruebas = useMemo(() => {
        if (!solicitud) return 0
        return solicitud.detalles.reduce(
            (acc, detalle) => acc + detalle.precioUnitario * detalle.cantidad,
            0,
        )
    }, [solicitud])

    if (isFetching && !solicitud) {
        return (
            <div className="solicitud-detail">
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        )
    }

    if (!solicitud) {
        return (
            <div className="solicitud-detail">
                <Empty description="No se encontró la solicitud." />
            </div>
        )
    }

    const canSendToCaja = solicitud.estado === 'BORRADOR'
    const canTomarMuestra =
        solicitud.estado === 'PENDIENTE_MUESTRA' || solicitud.estado === 'MUESTRA_TOMADA'
    const canRegistrarResultados =
        solicitud.estado === 'MUESTRA_TOMADA' || solicitud.estado === 'EN_PROCESO'
    const canValidarResultado = solicitud.estado === 'RESULTADO_REGISTRADO'
    const pacienteNombre =
        paciente?.personaNombreCompleto?.trim() || 'Paciente no disponible'
    const origenLabel = SOLICITUD_ORIGEN_LABELS[solicitud.origen] ?? solicitud.origen

    return (
        <div className="solicitud-detail">
            <header className="solicitud-detail__header">
                <Flex align="flex-start" gap={12} justify="space-between" wrap="wrap">
                    <Flex align="flex-start" gap={10} className="solicitud-detail__heading">
                        <Link to="/laboratorio/solicitudes">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                aria-label="Volver a solicitudes"
                            />
                        </Link>
                        <div className="solicitud-detail__heading-text">
                            <Flex align="center" gap={8} wrap="wrap">
                                <Tag className="paciente-hc-tag">{solicitud.numero}</Tag>
                                <Tag
                                    color={
                                        SOLICITUD_ESTADO_COLORS[solicitud.estado] ?? 'default'
                                    }
                                >
                                    {SOLICITUD_ESTADO_LABELS[solicitud.estado] ??
                                        solicitud.estado}
                                </Tag>
                            </Flex>
                            <Title level={4} className="solicitud-detail__title">
                                Detalle de solicitud
                            </Title>
                            <Text type="secondary" className="solicitud-detail__subtitle">
                                {formatDateTime(solicitud.fechaSolicitud)} · {origenLabel}
                            </Text>
                        </div>
                    </Flex>

                    <Flex
                        gap={8}
                        align="center"
                        wrap="wrap"
                        className="solicitud-detail__actions"
                    >
                        <Button
                            icon={<NodeIndexOutlined />}
                            onClick={() => setWorkflowModalOpen(true)}
                        >
                            Flujo
                        </Button>
                        {canSendToCaja ? (
                            <>
                                <WorkflowEmployeeSelect
                                    value={empleadoId || undefined}
                                    onChange={(value) =>
                                        setEmpleadoId(
                                            typeof value === 'string'
                                                ? value
                                                : value[0] ?? '',
                                        )
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
                                            .mutateAsync({
                                                id: solicitud.id,
                                                data: { empleadoId },
                                            })
                                            .then(() => refetch())
                                    }
                                >
                                    Enviar a caja
                                </Button>
                            </>
                        ) : null}
                    </Flex>
                </Flex>
            </header>

            <section className="solicitud-detail__summary">
                <div className="paciente-cell">
                    <span className="paciente-cell__avatar" aria-hidden>
                        {getInitials(pacienteNombre)}
                    </span>
                    <span className="paciente-cell__text">
                        <Text strong className="paciente-cell__name">
                            {pacienteNombre}
                        </Text>
                        <Text type="secondary" className="paciente-cell__sub">
                            {solicitud.medicoExternoNombre?.trim()
                                ? `Médico externo: ${solicitud.medicoExternoNombre}`
                                : origenLabel}
                        </Text>
                    </span>
                </div>

                <div className="solicitud-detail__meta">
                    <div className="solicitud-detail__meta-item">
                        <Text type="secondary" className="solicitud-detail__meta-label">
                            Pruebas
                        </Text>
                        <Text strong>{solicitud.detalles.length}</Text>
                    </div>
                    <div className="solicitud-detail__meta-item">
                        <Text type="secondary" className="solicitud-detail__meta-label">
                            Total
                        </Text>
                        <Text strong>{formatMoney(totalPruebas)}</Text>
                    </div>
                    <div className="solicitud-detail__meta-item">
                        <Text type="secondary" className="solicitud-detail__meta-label">
                            Muestras
                        </Text>
                        <Text strong>{muestras.length}</Text>
                    </div>
                    <div className="solicitud-detail__meta-item">
                        <Text type="secondary" className="solicitud-detail__meta-label">
                            Resultados
                        </Text>
                        <Text strong>{resultados.length}</Text>
                    </div>
                </div>

                {solicitud.observaciones?.trim() ? (
                    <div className="solicitud-detail__obs">
                        <Text type="secondary" className="solicitud-detail__meta-label">
                            Observaciones
                        </Text>
                        <Text>{solicitud.observaciones}</Text>
                    </div>
                ) : null}
            </section>

            <section className="solicitud-detail__content">
                <Tabs
                    className="solicitud-detail__tabs"
                    defaultActiveKey="pruebas"
                    items={[
                        {
                            key: 'pruebas',
                            label: `Pruebas (${solicitud.detalles.length})`,
                            children: (
                                <div className="solicitud-detail__tab-body">
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
                                            {
                                                title: 'Prueba',
                                                dataIndex: 'pruebaNombre',
                                            },
                                            {
                                                title: 'Cant.',
                                                dataIndex: 'cantidad',
                                                width: 72,
                                                align: 'center',
                                            },
                                            {
                                                title: 'P. unitario',
                                                dataIndex: 'precioUnitario',
                                                width: 120,
                                                align: 'right',
                                                render: (value: number) =>
                                                    formatMoney(value),
                                            },
                                            {
                                                title: 'Subtotal',
                                                key: 'subtotal',
                                                width: 120,
                                                align: 'right',
                                                render: (_, record: SolicitudDetalle) =>
                                                    formatMoney(
                                                        record.precioUnitario *
                                                            record.cantidad,
                                                    ),
                                            },
                                        ]}
                                        summary={() => (
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong>Total</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align="right">
                                                    <Text strong>
                                                        {formatMoney(totalPruebas)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        )}
                                    />

                                    {solicitud.pagos.length > 0 ? (
                                        <div className="solicitud-detail__subblock">
                                            <Text
                                                strong
                                                className="solicitud-detail__subblock-title"
                                            >
                                                Pagos / cuentas
                                            </Text>
                                            <Table
                                                size="small"
                                                rowKey="id"
                                                pagination={false}
                                                dataSource={solicitud.pagos}
                                                columns={[
                                                    {
                                                        title: 'Fecha',
                                                        dataIndex: 'fechaEnvio',
                                                        render: (value: string) =>
                                                            formatDateTime(value),
                                                    },
                                                    {
                                                        title: 'Monto',
                                                        dataIndex: 'montoTotal',
                                                        align: 'right',
                                                        render: (value: number) =>
                                                            formatMoney(value),
                                                    },
                                                    {
                                                        title: 'Estado',
                                                        dataIndex: 'estado',
                                                        render: (value: string) => (
                                                            <Tag>{value}</Tag>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ),
                        },
                        {
                            key: 'muestras',
                            label: (
                                <span>
                                    <ExperimentOutlined /> Muestras ({muestras.length})
                                </span>
                            ),
                            children: (
                                <div className="solicitud-detail__tab-body">
                                    {canTomarMuestra ? (
                                        <Flex
                                            justify="flex-end"
                                            className="solicitud-detail__tab-actions"
                                        >
                                            <Button
                                                size="small"
                                                type="primary"
                                                onClick={() => setMuestraModalOpen(true)}
                                            >
                                                Tomar muestra
                                            </Button>
                                        </Flex>
                                    ) : null}
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
                                            {
                                                title: 'Código',
                                                dataIndex: 'codigo',
                                                render: (value: string) => (
                                                    <Tag className="paciente-hc-tag">
                                                        {value}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: 'Fecha de toma',
                                                dataIndex: 'fechaToma',
                                                render: (value: string) =>
                                                    formatDateTime(value),
                                            },
                                            {
                                                title: 'Estado',
                                                dataIndex: 'estado',
                                                render: (value: string) => (
                                                    <Tag
                                                        color={
                                                            MUESTRA_ESTADO_COLORS[value] ??
                                                            'default'
                                                        }
                                                    >
                                                        {MUESTRA_ESTADO_LABELS[value] ??
                                                            value}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: 'Pruebas',
                                                key: 'detalles',
                                                width: 90,
                                                align: 'center',
                                                render: (_, record: Muestra) =>
                                                    record.detalles.length,
                                            },
                                        ]}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: 'resultados',
                            label: (
                                <span>
                                    <SolutionOutlined /> Resultados ({resultados.length})
                                </span>
                            ),
                            children: (
                                <div className="solicitud-detail__tab-body">
                                    <Flex
                                        gap={8}
                                        align="center"
                                        justify="flex-end"
                                        wrap="wrap"
                                        className="solicitud-detail__tab-actions"
                                    >
                                        {(canValidarResultado ||
                                            solicitud.estado === 'VALIDADO') && (
                                            <WorkflowEmployeeSelect
                                                value={validarEmpleadoId || undefined}
                                                onChange={(value) =>
                                                    setValidarEmpleadoId(
                                                        typeof value === 'string'
                                                            ? value
                                                            : value[0] ?? '',
                                                    )
                                                }
                                                placeholder="Empleado"
                                            />
                                        )}
                                        {canRegistrarResultados ? (
                                            <Button
                                                size="small"
                                                type="primary"
                                                onClick={() => setResultadosModalOpen(true)}
                                            >
                                                Registrar resultados
                                            </Button>
                                        ) : null}
                                    </Flex>
                                    <Table
                                        size="small"
                                        rowKey="id"
                                        pagination={false}
                                        dataSource={resultados}
                                        expandable={{
                                            expandedRowRender: (record: Resultado) => (
                                                <ResultadoDetallesTable
                                                    detalles={record.detalles}
                                                />
                                            ),
                                            rowExpandable: (record: Resultado) =>
                                                record.detalles.length > 0,
                                        }}
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
                                                    <Tag
                                                        color={
                                                            RESULTADO_ESTADO_COLORS[
                                                                value
                                                            ] ?? 'default'
                                                        }
                                                    >
                                                        {RESULTADO_ESTADO_LABELS[value] ??
                                                            value}
                                                    </Tag>
                                                ),
                                            },
                                            {
                                                title: 'Parámetros',
                                                key: 'detalles',
                                                width: 140,
                                                align: 'center',
                                                render: (_, record: Resultado) => {
                                                    const fuera = record.detalles.filter(
                                                        (d) => d.fueraDeRango,
                                                    ).length
                                                    return (
                                                        <Flex gap={4} justify="center">
                                                            <Tag>
                                                                {record.detalles.length}
                                                            </Tag>
                                                            {fuera > 0 ? (
                                                                <Tag color="error">
                                                                    {fuera} fuera
                                                                </Tag>
                                                            ) : null}
                                                        </Flex>
                                                    )
                                                },
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
                                                width: 120,
                                                align: 'right',
                                                render: (_, record: Resultado) => {
                                                    if (
                                                        record.estado === 'REGISTRADO' &&
                                                        canValidarResultado
                                                    ) {
                                                        return (
                                                            <Popconfirm
                                                                title="Validar resultado"
                                                                description="¿Confirma la validación de este resultado?"
                                                                okText="Validar"
                                                                cancelText="Cancelar"
                                                                disabled={!validarEmpleadoId}
                                                                okButtonProps={{
                                                                    loading:
                                                                        validarResultado.isPending,
                                                                }}
                                                                onConfirm={() =>
                                                                    void validarResultado.mutateAsync(
                                                                        {
                                                                            id: record.id,
                                                                            data: {
                                                                                empleadoId:
                                                                                    validarEmpleadoId,
                                                                            },
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <Button
                                                                    type="link"
                                                                    size="small"
                                                                    disabled={!validarEmpleadoId}
                                                                >
                                                                    Validar
                                                                </Button>
                                                            </Popconfirm>
                                                        )
                                                    }

                                                    if (
                                                        record.estado === 'VALIDADO' &&
                                                        solicitud.estado === 'VALIDADO'
                                                    ) {
                                                        return (
                                                            <Popconfirm
                                                                title="Entregar resultado"
                                                                description="¿Confirma la entrega de este resultado?"
                                                                okText="Entregar"
                                                                cancelText="Cancelar"
                                                                disabled={!validarEmpleadoId}
                                                                okButtonProps={{
                                                                    loading:
                                                                        entregarResultado.isPending,
                                                                }}
                                                                onConfirm={() =>
                                                                    void entregarResultado.mutateAsync(
                                                                        {
                                                                            id: record.id,
                                                                            data: {
                                                                                empleadoId:
                                                                                    validarEmpleadoId,
                                                                            },
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <Button
                                                                    type="link"
                                                                    size="small"
                                                                    disabled={!validarEmpleadoId}
                                                                >
                                                                    Entregar
                                                                </Button>
                                                            </Popconfirm>
                                                        )
                                                    }

                                                    return null
                                                },
                                            },
                                        ]}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </section>

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

            <WorkflowEntityModal
                open={workflowModalOpen}
                onClose={() => setWorkflowModalOpen(false)}
                title={`Flujo · ${solicitud.numero}`}
                referenceModule="Laboratorio"
                referenceEntity="Solicitud"
                referenceId={solicitud.id}
                definitionCode="LABORATORIO"
                onStateChange={(instance) => {
                    void setSolicitudEstado.mutateAsync({
                        id: instance.referenceId,
                        data: { estado: instance.currentStateCode },
                    })
                }}
            />
        </div>
    )
}
