import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Descriptions, Flex, Tag, Typography } from 'antd'
import { Link } from '@tanstack/react-router'

import { useAtencion } from '../hooks/atencion-medica.hooks'
import { AtencionDetailTabs } from './AtencionDetailView'
import { formatDateTime } from '../utils/format'

const { Title, Text } = Typography

export type EtapaWorkbenchConfig = {
    titulo: string
    subtitulo: string
    etapaFlujo: string
    bandejaTo: '/atencion-medica/enfermeria' | '/atencion-medica/consulta-medica'
    tabKeys: string[]
    defaultTab: string
}

type EtapaAtencionWorkbenchViewProps = {
    atencionId: string
    config: EtapaWorkbenchConfig
}

export function EtapaAtencionWorkbenchView({
    atencionId,
    config,
}: EtapaAtencionWorkbenchViewProps) {
    const { data: atencion, isFetching } = useAtencion(atencionId)

    if (isFetching && !atencion) {
        return <Text type="secondary">Cargando atención…</Text>
    }

    if (!atencion) {
        return <Text type="danger">No se encontró la atención.</Text>
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16}>
                    <Link to={config.bandejaTo}>
                        <Button type="text" icon={<ArrowLeftOutlined />} />
                    </Link>
                    <div>
                        <Title level={3} className="admin-page__title">
                            {config.titulo} — {atencion.numeroAtencion}
                        </Title>
                        <Text type="secondary">
                            {config.subtitulo} · {formatDateTime(atencion.fechaAtencion)} ·{' '}
                            <Tag>{atencion.estado}</Tag>
                        </Text>
                    </div>
                </Flex>
            </header>

            <div className="admin-page__workspace">
                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
                        <Descriptions.Item label="Trámite">
                            {atencion.numeroAtencion}
                        </Descriptions.Item>
                        <Descriptions.Item label="Motivo">
                            {atencion.motivoConsulta ?? '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            <Tag>{atencion.estado}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <section className="admin-page__panel">
                    <AtencionDetailTabs
                        atencion={atencion}
                        etapaFormulario={config.etapaFlujo}
                        visibleTabKeys={config.tabKeys}
                        defaultActiveKey={config.defaultTab}
                    />
                </section>
            </div>
        </div>
    )
}

export const ENFERMERIA_WORKBENCH_CONFIG: EtapaWorkbenchConfig = {
    titulo: 'Atención de enfermería',
    subtitulo: 'Datos de enfermería',
    etapaFlujo: 'ENFERMERIA',
    bandejaTo: '/atencion-medica/enfermeria',
    tabKeys: ['formulario'],
    defaultTab: 'formulario',
}

export const CONSULTA_MEDICA_WORKBENCH_CONFIG: EtapaWorkbenchConfig = {
    titulo: 'Consulta médica',
    subtitulo: 'Historia clínica',
    etapaFlujo: 'CONSULTA_MEDICA',
    bandejaTo: '/atencion-medica/consulta-medica',
    tabKeys: ['formulario'],
    defaultTab: 'formulario',
}
