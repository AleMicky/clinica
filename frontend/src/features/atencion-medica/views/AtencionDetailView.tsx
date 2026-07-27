import { useState } from 'react'
import { Button, Descriptions, Flex, Tabs, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { WorkflowEntityPanel } from '../../workflow/components/WorkflowEntityPanel'
import { WorkflowEmployeeSelect } from '../../workflow/components/WorkflowEmployeeSelect'
import { FormularioClinicoTab } from '../components/FormularioClinicoTab'
import { useAtencion, useEnviarACaja } from '../hooks/atencion-medica.hooks'
import type { Atencion } from '../types/atencion-medica.types'
import { formatDateTime } from '../utils/format'

const { Title, Text } = Typography

type AtencionDetailTabsProps = {
    atencion: Atencion
    visibleTabKeys?: string[]
    defaultActiveKey?: string
}

export function AtencionDetailTabs({
    atencion,
    visibleTabKeys,
    defaultActiveKey = 'formulario',
}: AtencionDetailTabsProps) {
    const tabItems = [
        {
            key: 'formulario',
            label: 'Formulario clínico',
            children: <FormularioClinicoTab atencion={atencion} />,
        },
    ]

    const filteredItems = visibleTabKeys
        ? tabItems.filter((item) => visibleTabKeys.includes(item.key))
        : tabItems

    return <Tabs items={filteredItems} defaultActiveKey={defaultActiveKey} />
}

type AtencionDetailViewProps = {
    atencionId: string
}

export function AtencionDetailView({ atencionId }: AtencionDetailViewProps) {
    const { data: atencion, isFetching, refetch } = useAtencion(atencionId)
    const enviarACaja = useEnviarACaja()
    const [empleadoId, setEmpleadoId] = useState('')

    if (isFetching && !atencion) {
        return <Text type="secondary">Cargando atención…</Text>
    }

    if (!atencion) {
        return <Text type="danger">No se encontró la atención.</Text>
    }

    const canSendToCaja =
        atencion.estado !== 'PENDIENTE_PAGO' &&
        atencion.estado !== 'PAGADO' &&
        atencion.estado !== 'FINALIZADO' &&
        atencion.estado !== 'ANULADO'

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16} justify="space-between" wrap="wrap">
                    <Flex align="center" gap={16}>
                        <Link to="/atenciones">
                            <Button type="text" icon={<ArrowLeftOutlined />} />
                        </Link>
                        <div>
                            <Title level={3} className="admin-page__title">
                                Atención {atencion.numeroAtencion}
                            </Title>
                            <Text type="secondary">
                                {formatDateTime(atencion.fechaAtencion)} ·{' '}
                                <Tag>{atencion.estado}</Tag>
                            </Text>
                        </div>
                    </Flex>
                    {canSendToCaja ? (
                        <Flex gap={8} align="center" wrap="wrap">
                            <WorkflowEmployeeSelect
                                value={empleadoId || undefined}
                                onChange={(value) =>
                                    setEmpleadoId(
                                        typeof value === 'string' ? value : value[0] ?? '',
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
                                        .mutateAsync({ id: atencion.id, empleadoId })
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
                        <Descriptions.Item label="Trámite">
                            {atencion.numeroAtencion}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha">
                            {formatDateTime(atencion.fechaAtencion)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            <Tag>{atencion.estado}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Observaciones" span={3}>
                            {atencion.observaciones || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <WorkflowEntityPanel
                        referenceModule="AtencionMedica"
                        referenceEntity="Atencion"
                        referenceId={atencion.id}
                        definitionCode="ATENCION_MEDICA"
                        variant="embedded"
                        onStateChange={() => {
                            void refetch()
                        }}
                    />
                </section>

                <section className="admin-page__panel">
                    <AtencionDetailTabs atencion={atencion} />
                </section>
            </div>
        </div>
    )
}
