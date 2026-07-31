import { Button, Descriptions, Drawer, Flex, Grid, Spin, Typography } from 'antd'

import type { Recibo } from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type ReciboDrawerProps = {
    open: boolean
    recibo: Recibo | undefined
    loading: boolean
    notFound?: boolean
    onClose: () => void
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function ReciboDrawer({ open, recibo, loading, notFound, onClose }: ReciboDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 440 : '95%'

    return (
        <Drawer
            title={recibo ? `Recibo ${recibo.numero}` : 'Recibo'}
            open={open}
            onClose={onClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" className="usuario-drawer__footer">
                    <Button onClick={onClose}>Cerrar</Button>
                </Flex>
            }
        >
            {loading && !recibo ? (
                <Flex justify="center" style={{ padding: 48 }}>
                    <Spin />
                </Flex>
            ) : null}

            {!loading && (notFound || !recibo) ? (
                <Text type="secondary">Sin recibo asociado.</Text>
            ) : null}

            {recibo ? (
                <Descriptions size="small" column={1} bordered>
                    <Descriptions.Item label="Número">{recibo.numero}</Descriptions.Item>
                    <Descriptions.Item label="Emisión">
                        {new Date(recibo.fechaEmision).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Importe">
                        {formatMoney(recibo.importe)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">{recibo.estado}</Descriptions.Item>
                    <Descriptions.Item label="Observaciones">
                        {recibo.observaciones ?? '—'}
                    </Descriptions.Item>
                </Descriptions>
            ) : null}
        </Drawer>
    )
}
