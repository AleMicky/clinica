import { useState } from 'react'
import { MedicineBoxOutlined } from '@ant-design/icons'
import { Link, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Flex, Space, Table, Tag, Typography, theme } from 'antd'

import { RecepcionPacienteWizard } from '../components/RecepcionPacienteWizard'
import { AtencionFlujoPanel } from '../components/AtencionFlujoPanel'
import { useCrearRecepcionAtencion } from '../hooks/useCrearRecepcionAtencion'
import { useRecepcionPendientes } from '../hooks/useRecepcionPendientes'
import type { RecepcionAtencion } from '../types/recepcion.types'

const { Title, Text } = Typography

export function RecepcionPacientePage() {
    const { token } = theme.useToken()
    const navigate = useNavigate()
    const crearRecepcion = useCrearRecepcionAtencion()
    const { data: pendientes, isFetching: loadingPendientes } = useRecepcionPendientes()
    const [ultimaAtencion, setUltimaAtencion] = useState<RecepcionAtencion | null>(null)

    return (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Flex align="center" gap={12}>
                <MedicineBoxOutlined
                    style={{ fontSize: 24, color: token.colorPrimary }}
                />
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Recepción de paciente
                    </Title>
                    <Text type="secondary">
                        Registro administrativo inicial y arranque del flujo clínico
                    </Text>
                </div>
            </Flex>

            {ultimaAtencion ? (
                <Alert
                    type="success"
                    showIcon
                    title={`Atención ${ultimaAtencion.numeroAtencion} creada correctamente`}
                    description={
                        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                                <Tag color="blue">{ultimaAtencion.estado}</Tag>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() =>
                                        void navigate({
                                            to: '/atenciones/$atencionId',
                                            params: { atencionId: ultimaAtencion.id },
                                        })
                                    }
                                >
                                    Ver detalle de atención
                                </Button>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setUltimaAtencion(null)}
                                >
                                    Registrar otra
                                </Button>
                            </Space>
                            <AtencionFlujoPanel atencionId={ultimaAtencion.id} compact />
                        </Space>
                    }
                />
            ) : null}

            <Card size="small" variant="borderless" className="his-panel">
                <RecepcionPacienteWizard
                    loading={crearRecepcion.isPending}
                    onSubmit={(payload) => crearRecepcion.mutateAsync(payload)}
                    onSuccess={setUltimaAtencion}
                />
            </Card>

            <Card
                size="small"
                title="Atenciones pendientes en recepción"
                extra={
                    <Text type="secondary">
                        {loadingPendientes
                            ? 'Cargando…'
                            : `${pendientes?.length ?? 0} registros`}
                    </Text>
                }
            >
                <Table
                    size="small"
                    rowKey="id"
                    loading={loadingPendientes}
                    dataSource={pendientes ?? []}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    columns={[
                        {
                            title: 'Número',
                            dataIndex: 'numeroAtencion',
                            key: 'numeroAtencion',
                            render: (value: string, record) => (
                                <Link
                                    to="/atenciones/$atencionId"
                                    params={{ atencionId: record.id }}
                                >
                                    {value}
                                </Link>
                            ),
                        },
                        {
                            title: 'Motivo',
                            dataIndex: 'motivoConsulta',
                            key: 'motivoConsulta',
                            ellipsis: true,
                            render: (value: string | null) => value ?? '—',
                        },
                        {
                            title: 'Fecha recepción',
                            dataIndex: 'fechaRecepcion',
                            key: 'fechaRecepcion',
                            width: 180,
                            render: (value: string | null) =>
                                value
                                    ? new Date(value).toLocaleString('es-PE')
                                    : '—',
                        },
                        {
                            title: 'Estado',
                            dataIndex: 'estado',
                            key: 'estado',
                            width: 120,
                            render: (value: string, record) => (
                                <Space orientation="vertical" size={0}>
                                    <Tag>{value}</Tag>
                                    {record.workflowInstanceId ? (
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            WF activo
                                        </Text>
                                    ) : null}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>
        </Space>
    )
}
