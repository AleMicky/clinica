import { ExperimentOutlined } from '@ant-design/icons'
import { Card, Flex, Space, Typography, theme } from 'antd'

import { BandejaAtencionesTable } from '../components/BandejaAtencionesTable'
import { useEnfermeriaPendientes } from '../hooks/useBandejaAtenciones'

const { Title, Text } = Typography

export function EnfermeriaPage() {
    const { token } = theme.useToken()
    const { data: pendientes, isFetching } = useEnfermeriaPendientes()

    return (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Flex align="center" gap={12}>
                <ExperimentOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Enfermería
                    </Title>
                    <Text type="secondary">
                        Signos vitales y formulario clínico de la etapa de enfermería
                    </Text>
                </div>
            </Flex>

            <Card
                size="small"
                title="Pacientes en bandeja de enfermería"
                extra={
                    <Text type="secondary">
                        {isFetching ? 'Cargando…' : `${pendientes?.length ?? 0} registros`}
                    </Text>
                }
            >
                <BandejaAtencionesTable
                    data={pendientes ?? []}
                    loading={isFetching}
                    workbenchTo="/atencion-medica/enfermeria/$atencionId"
                />
            </Card>
        </Space>
    )
}
