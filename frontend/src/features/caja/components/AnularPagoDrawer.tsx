import { useEffect, useState } from 'react'
import { Alert, Button, Drawer, Flex, Form, Grid, Input, Typography } from 'antd'

import type { AnularPagoPayload } from '../types/caja.types'
import { anularPagoSchema } from '../schemas/anular-pago.schema'

const { Text } = Typography
const { TextArea } = Input
const { useBreakpoint } = Grid

export type AnularPagoTarget = {
    id: string
    numero?: string | null
    monto: number
}

type AnularPagoDrawerProps = {
    open: boolean
    pago: AnularPagoTarget | null
    loading: boolean
    onClose: () => void
    onSubmit: (payload: AnularPagoPayload) => Promise<void>
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function AnularPagoDrawer({
    open,
    pago,
    loading,
    onClose,
    onSubmit,
}: AnularPagoDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 440 : '95%'
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        setMotivo('')
        setError(null)
    }, [open, pago?.id])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleSubmit = async () => {
        const parsed = anularPagoSchema.safeParse({ motivo })
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Motivo inválido.')
            return
        }
        setError(null)
        await onSubmit({ motivo: parsed.data.motivo })
    }

    return (
        <Drawer
            title="Anular pago"
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="primary" danger loading={loading} onClick={() => void handleSubmit()}>
                        Anular pago
                    </Button>
                </Flex>
            }
        >
            {pago ? (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={`Pago ${pago.numero} · ${formatMoney(pago.monto)}`}
                    description="Esta acción no se puede deshacer. El saldo de la cuenta se recalculará."
                />
            ) : null}

            <Form layout="vertical" className="usuario-drawer__form usuario-drawer__form--compact">
                <Form.Item
                    label="Motivo"
                    required
                    validateStatus={error ? 'error' : undefined}
                    help={error}
                >
                    <TextArea
                        rows={4}
                        maxLength={2000}
                        showCount
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Indique el motivo de la anulación…"
                        disabled={loading}
                    />
                </Form.Item>
                <Text type="secondary">El motivo es obligatorio (máx. 2000 caracteres).</Text>
            </Form>
        </Drawer>
    )
}
