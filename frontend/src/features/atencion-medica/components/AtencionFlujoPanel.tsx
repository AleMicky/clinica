import { CheckCircleOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Flex, Progress, Space, Steps, Tag, Typography } from 'antd'

import {
    useAtencionFlujoCompletitud,
    useAvanzarAtencionFlujo,
} from '../hooks/useAtencionFlujo'
import { useWorkflowInstanceByReference } from '../../workflow/hooks/useWorkflowInstances'
import { WorkflowStateBadge } from '../../workflow/components/WorkflowStateBadge'

const { Text, Title } = Typography

const ETAPAS_ORDEN = ['RECEPCION', 'TRIAJE', 'ENFERMERIA', 'CONSULTA_MEDICA'] as const

const ETAPA_LABELS: Record<string, string> = {
    RECEPCION: 'Recepción',
    TRIAJE: 'Triaje',
    ENFERMERIA: 'Enfermería',
    CONSULTA_MEDICA: 'Consulta médica',
    PENDIENTE_PAGO: 'Caja',
    PAGADO: 'Pagado',
    FINALIZADO: 'Finalizado',
}

type AtencionFlujoPanelProps = {
    atencionId: string
    compact?: boolean
}

export function AtencionFlujoPanel({ atencionId, compact = false }: AtencionFlujoPanelProps) {
    const { data: completitud, isFetching } = useAtencionFlujoCompletitud(atencionId)
    const avanzar = useAvanzarAtencionFlujo(atencionId)

    const { data: workflowInstance } = useWorkflowInstanceByReference(
        'AtencionMedica',
        'Atencion',
        atencionId,
    )

    if (isFetching && !completitud) {
        return <Text type="secondary">Cargando flujo clínico…</Text>
    }

    if (!completitud) {
        return (
            <Alert
                type="warning"
                showIcon
                title="Sin datos de flujo"
                description="No se pudo cargar el estado del workflow para esta atención."
            />
        )
    }

    const estadoVisible = workflowInstance?.currentStateCode ?? completitud.estadoWorkflow ?? completitud.estadoAtencion
    const etapaActual = completitud.etapaActual
    const seccionesEtapa = completitud.secciones.filter((s) => s.etapaFlujo === etapaActual)
    const progresoEtapa =
        seccionesEtapa.length === 0
            ? 100
            : Math.round(
                  (seccionesEtapa.filter((s) => s.completa).length / seccionesEtapa.length) * 100,
              )

    const stepItems = ETAPAS_ORDEN.map((etapa) => {
        const secciones = completitud.secciones.filter((s) => s.etapaFlujo === etapa)
        const completa =
            secciones.length === 0
                ? etapa === 'TRIAJE'
                : secciones.every((s) => s.completa)

        const etapaIndex = ETAPAS_ORDEN.indexOf(etapa)
        const actualIndex = etapaActual
            ? ETAPAS_ORDEN.indexOf(etapaActual as (typeof ETAPAS_ORDEN)[number])
            : -1

        let status: 'wait' | 'process' | 'finish' = 'wait'
        if (etapa === etapaActual) status = 'process'
        else if (actualIndex >= 0 && etapaIndex < actualIndex) status = 'finish'
        else if (completa) status = 'finish'

        return {
            title: ETAPA_LABELS[etapa] ?? etapa,
            status,
            icon: completa ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
        }
    })

    return (
        <Card
            size="small"
            title={compact ? undefined : 'Flujo clínico y workflow'}
            className="his-panel"
        >
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Flex align="center" gap={12} wrap="wrap">
                    <div>
                        <Text type="secondary">Estado workflow</Text>
                        <div>
                            {workflowInstance ? (
                                <WorkflowStateBadge
                                    code={workflowInstance.currentStateCode}
                                    name={workflowInstance.currentStateName}
                                    color={workflowInstance.currentStateColor}
                                />
                            ) : (
                                <Tag>{estadoVisible}</Tag>
                            )}
                        </div>
                    </div>
                    {etapaActual ? (
                        <div>
                            <Text type="secondary">Etapa del formulario</Text>
                            <div>
                                <Tag color="blue">{ETAPA_LABELS[etapaActual] ?? etapaActual}</Tag>
                            </div>
                        </div>
                    ) : null}
                </Flex>

                {!compact ? (
                    <Steps size="small" items={stepItems} />
                ) : null}

                {etapaActual && seccionesEtapa.length > 0 ? (
                    <div>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                            <Text strong>Completitud de la etapa actual</Text>
                            <Text type="secondary">{progresoEtapa}%</Text>
                        </Flex>
                        <Progress percent={progresoEtapa} size="small" />
                        <Space orientation="vertical" size={4} style={{ width: '100%', marginTop: 12 }}>
                            {seccionesEtapa.map((seccion) => (
                                <Flex key={seccion.seccionId} justify="space-between" align="center">
                                    <Text>{seccion.nombre}</Text>
                                    <Tag color={seccion.completa ? 'success' : 'warning'}>
                                        {seccion.camposCompletados}/{seccion.camposRequeridos || '—'}{' '}
                                        {seccion.completa ? 'completa' : 'pendiente'}
                                    </Tag>
                                </Flex>
                            ))}
                        </Space>
                    </div>
                ) : null}

                {completitud.puedeAvanzar ? (
                    <Alert
                        type="success"
                        showIcon
                        title="La etapa actual está completa"
                        description={
                            completitud.siguienteAccionNombre
                                ? `Puede enviar la atención: ${completitud.siguienteAccionNombre}.`
                                : 'Puede avanzar al siguiente paso del flujo.'
                        }
                        action={
                            <Button
                                type="primary"
                                size="small"
                                icon={<RightOutlined />}
                                loading={avanzar.isPending}
                                onClick={() => void avanzar.mutateAsync()}
                            >
                                {completitud.siguienteAccionNombre ?? 'Avanzar'}
                            </Button>
                        }
                    />
                ) : etapaActual ? (
                    <Alert
                        type="info"
                        showIcon
                        title="Complete el formulario de la etapa actual"
                        description="Guarde las respuestas requeridas en las secciones pendientes antes de avanzar."
                    />
                ) : null}

                {!compact && completitud.secciones.length > 0 ? (
                    <div>
                        <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>
                            Todas las secciones
                        </Title>
                        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                            {completitud.secciones.map((seccion) => (
                                <Flex key={seccion.seccionId} justify="space-between" align="center">
                                    <Space size={8}>
                                        <Text>{seccion.nombre}</Text>
                                        {seccion.etapaFlujo ? (
                                            <Tag>{ETAPA_LABELS[seccion.etapaFlujo] ?? seccion.etapaFlujo}</Tag>
                                        ) : null}
                                    </Space>
                                    <Tag color={seccion.completa ? 'success' : 'default'}>
                                        {seccion.completa ? 'Completa' : 'Pendiente'}
                                    </Tag>
                                </Flex>
                            ))}
                        </Space>
                    </div>
                ) : null}
            </Space>
        </Card>
    )
}
