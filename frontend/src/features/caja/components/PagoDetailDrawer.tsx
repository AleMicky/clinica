import {
    Button,
    Descriptions,
    Drawer,
    Flex,
    Grid,
    Spin,
    Table,
    Tag,
    Typography,
} from 'antd'
import { StopOutlined } from '@ant-design/icons'

import type { PagoDetalleCompleto } from '../types/caja.types'

const { Text, Title } = Typography
const { useBreakpoint } = Grid

const estadoColor: Record<string, string> = {
    CONFIRMADO: 'green',
    ANULADO: 'red',
    DEVUELTO: 'orange',
    PARCIALMENTE_DEVUELTO: 'gold',
}

type PagoDetailDrawerProps = {
    open: boolean
    pago: PagoDetalleCompleto | undefined
    loading: boolean
    onClose: () => void
    onAnular: () => void
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function PagoDetailDrawer({
    open,
    pago,
    loading,
    onClose,
    onAnular,
}: PagoDetailDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 560 : '95%'
    const canAnular = pago?.estado === 'CONFIRMADO'

    return (
        <Drawer
            title={pago ? `Pago ${pago.numero}` : 'Detalle de pago'}
            open={open}
            onClose={onClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    {canAnular ? (
                        <Button danger icon={<StopOutlined />} onClick={onAnular}>
                            Anular
                        </Button>
                    ) : null}
                    <Button onClick={onClose}>Cerrar</Button>
                </Flex>
            }
        >
            {loading && !pago ? (
                <Flex justify="center" style={{ padding: 48 }}>
                    <Spin />
                </Flex>
            ) : null}

            {pago ? (
                <>
                    <Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Estado">
                            <Tag color={estadoColor[pago.estado] ?? 'default'}>{pago.estado}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha">
                            {new Date(pago.fechaPago).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Monto">{formatMoney(pago.monto)}</Descriptions.Item>
                        <Descriptions.Item label="Observaciones">
                            {pago.observaciones ?? '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Title level={5}>Métodos de pago</Title>
                    <Table
                        size="small"
                        rowKey="id"
                        pagination={false}
                        style={{ marginBottom: 16 }}
                        dataSource={pago.detalles}
                        columns={[
                            { title: 'Método', dataIndex: 'metodoPagoNombre' },
                            {
                                title: 'Importe',
                                dataIndex: 'importe',
                                render: (v: number) => formatMoney(v),
                            },
                            {
                                title: 'Referencia',
                                dataIndex: 'numeroReferencia',
                                render: (v: string | null | undefined) => v ?? '—',
                            },
                        ]}
                    />

                    {pago.aplicaciones.length > 0 ? (
                        <>
                            <Title level={5}>Aplicaciones</Title>
                            <Table
                                size="small"
                                rowKey="id"
                                pagination={false}
                                style={{ marginBottom: 16 }}
                                dataSource={pago.aplicaciones}
                                columns={[
                                    { title: 'Cuenta', dataIndex: 'cuentaNumero' },
                                    {
                                        title: 'Aplicado',
                                        dataIndex: 'importeAplicado',
                                        render: (v: number) => formatMoney(v),
                                    },
                                ]}
                            />
                        </>
                    ) : null}

                    {pago.recibo ? (
                        <>
                            <Title level={5}>Recibo</Title>
                            <Descriptions size="small" column={1} bordered>
                                <Descriptions.Item label="Número">
                                    {pago.recibo.numero}
                                </Descriptions.Item>
                                <Descriptions.Item label="Emisión">
                                    {new Date(pago.recibo.fechaEmision).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Importe">
                                    {formatMoney(pago.recibo.importe)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Estado">
                                    {pago.recibo.estado}
                                </Descriptions.Item>
                            </Descriptions>
                        </>
                    ) : (
                        <Text type="secondary">Sin recibo asociado.</Text>
                    )}
                </>
            ) : null}
        </Drawer>
    )
}
