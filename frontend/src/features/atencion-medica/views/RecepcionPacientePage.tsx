import { useState } from 'react'
import { MedicineBoxOutlined } from '@ant-design/icons'
import { Link, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Flex, Space, Table, Typography, theme } from 'antd'

import { RecepcionPacienteForm } from '../components/RecepcionPacienteForm'
import { useCrearRecepcionAtencion } from '../hooks/useCrearRecepcionAtencion'
import { useRecepcionPendientes } from '../hooks/useRecepcionPendientes'
import {
    toCrearRecepcionPayload,
    type RecepcionFormValues,
} from '../schemas/recepcion.schema'
import type { RecepcionAtencion } from '../types/recepcion.types'

const { Title, Text } = Typography

export function RecepcionPacientePage() {
    const { token } = theme.useToken()
    const navigate = useNavigate()
    const crearRecepcion = useCrearRecepcionAtencion()
    const { data: pendientes, isFetching: loadingPendientes } = useRecepcionPendientes()
    const [ultimaAtencion, setUltimaAtencion] = useState<RecepcionAtencion | null>(null)

    const handleSubmit = async (values: RecepcionFormValues) => {
        const atencion = await crearRecepcion.mutateAsync(toCrearRecepcionPayload(values))
        setUltimaAtencion(atencion)
    }

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Flex align="center" gap={12}>
                <MedicineBoxOutlined
                    style={{ fontSize: 24, color: token.colorPrimary }}
                />
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Recepción de paciente
                    </Title>
                    <Text type="secondary">
                        Registro inicial de atención y arranque del flujo clínico
                    </Text>
                </div>
            </Flex>

            {ultimaAtencion ? (
                <Alert
                    type="success"
                    showIcon
                    message={`Atención ${ultimaAtencion.numeroAtencion} creada correctamente`}
                    description={
                        <Space>
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
                    }
                />
            ) : null}

            <Card size="small" bordered={false}>
                <RecepcionPacienteForm
                    loading={crearRecepcion.isPending}
                    onSubmit={handleSubmit}
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
                        },
                    ]}
                />
            </Card>
        </Space>
    )
}
