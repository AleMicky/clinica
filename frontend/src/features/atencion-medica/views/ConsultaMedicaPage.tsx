import { MedicineBoxOutlined } from '@ant-design/icons'
import { Card, Flex, Space, Typography, theme } from 'antd'

import { BandejaAtencionesTable } from '../components/BandejaAtencionesTable'
import { useConsultaMedicaPendientes } from '../hooks/useBandejaAtenciones'

const { Title, Text } = Typography

export function ConsultaMedicaPage() {
    const { token } = theme.useToken()
    const { data: pendientes, isFetching } = useConsultaMedicaPendientes()

    return (
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Flex align="center" gap={12}>
                <MedicineBoxOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Consulta médica
                    </Title>
                    <Text type="secondary">
                        Evaluación clínica, diagnóstico y plan terapéutico
                    </Text>
                </div>
            </Flex>

            <Card
                size="small"
                title="Pacientes en consulta médica"
                extra={
                    <Text type="secondary">
                        {isFetching ? 'Cargando…' : `${pendientes?.length ?? 0} registros`}
                    </Text>
                }
            >
                <BandejaAtencionesTable
                    data={pendientes ?? []}
                    loading={isFetching}
                    workbenchTo="/atencion-medica/consulta-medica/$atencionId"
                />
            </Card>
        </Space>
    )
}
