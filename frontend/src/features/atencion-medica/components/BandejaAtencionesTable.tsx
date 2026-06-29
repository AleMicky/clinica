import { Link } from '@tanstack/react-router'
import { Button, Space, Table, Tag, Typography } from 'antd'
import { RightOutlined } from '@ant-design/icons'

import type { Atencion } from '../types/atencion-medica.types'

const { Text } = Typography

type BandejaAtencionesTableProps = {
    data: Atencion[]
    loading?: boolean
    workbenchTo: '/atencion-medica/enfermeria/$atencionId' | '/atencion-medica/consulta-medica/$atencionId'
}

export function BandejaAtencionesTable({
    data,
    loading,
    workbenchTo,
}: BandejaAtencionesTableProps) {
    return (
        <Table
            size="small"
            rowKey="id"
            loading={loading}
            dataSource={data}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            columns={[
                {
                    title: 'Número',
                    dataIndex: 'numeroAtencion',
                    key: 'numeroAtencion',
                    width: 150,
                    render: (value: string, record) => (
                        <Link to={workbenchTo} params={{ atencionId: record.id }}>
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
                    title: 'Fecha',
                    dataIndex: 'fechaAtencion',
                    key: 'fechaAtencion',
                    width: 170,
                    render: (value: string) => new Date(value).toLocaleString('es-PE'),
                },
                {
                    title: 'Estado',
                    dataIndex: 'estado',
                    key: 'estado',
                    width: 130,
                    render: (value: string) => <Tag>{value}</Tag>,
                },
                {
                    title: '',
                    key: 'acciones',
                    width: 120,
                    render: (_, record) => (
                        <Link to={workbenchTo} params={{ atencionId: record.id }}>
                            <Button type="link" size="small" icon={<RightOutlined />}>
                                Atender
                            </Button>
                        </Link>
                    ),
                },
            ]}
            locale={{
                emptyText: (
                    <Space orientation="vertical" size={4}>
                        <Text type="secondary">No hay atenciones pendientes.</Text>
                    </Space>
                ),
            }}
        />
    )
}
