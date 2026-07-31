import { useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Button,
    Descriptions,
    Drawer,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Statistic,
    Typography,
} from 'antd'

import type {
    CerrarArqueoPayload,
    ResumenTurno,
    TurnoCaja,
} from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type CerrarTurnoDrawerProps = {
    open: boolean
    turno: TurnoCaja | null
    resumen: ResumenTurno | undefined
    loading: boolean
    onClose: () => void
    onSubmit: (payload: CerrarArqueoPayload) => Promise<void>
}

function formatMoney(value: number) {
    return value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
}

export function CerrarTurnoDrawer({
    open,
    turno,
    resumen,
    loading,
    onClose,
    onSubmit,
}: CerrarTurnoDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const [montoContado, setMontoContado] = useState(0)
    const [observaciones, setObservaciones] = useState('')

    const esperado = resumen?.efectivoEsperado ?? 0
    const diferencia = useMemo(
        () => Math.round((montoContado - esperado) * 100) / 100,
        [montoContado, esperado],
    )
    const requiereObs = Math.abs(diferencia) > 0.009

    useEffect(() => {
        if (!open) return
        setMontoContado(esperado)
        setObservaciones('')
    }, [open, esperado, turno?.id])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const canSubmit = !requiereObs || Boolean(observaciones.trim())

    return (
        <Drawer
            title="Arqueo y cierre de caja"
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
                    <Button
                        type="primary"
                        danger
                        loading={loading}
                        disabled={!canSubmit || !turno}
                        onClick={() => {
                            void onSubmit({
                                montoContado,
                                observaciones: observaciones.trim() || null,
                            })
                        }}
                    >
                        Confirmar cierre
                    </Button>
                </Flex>
            }
        >
            {turno ? (
                <Form
                    layout="vertical"
                    requiredMark
                    size="small"
                    className="usuario-drawer__form usuario-drawer__form--compact"
                >
                    <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Caja">
                            {turno.cajaCodigo} · {turno.cajaNombre}
                        </Descriptions.Item>
                        <Descriptions.Item label="Abierto por">
                            {turno.empleadoAperturaNombre?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Apertura">
                            {new Date(turno.fechaApertura).toLocaleString('es-BO')}
                        </Descriptions.Item>
                    </Descriptions>

                    <Statistic
                        title="Efectivo esperado"
                        value={esperado}
                        formatter={(value) => formatMoney(Number(value))}
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item label="Monto contado" required>
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            value={montoContado}
                            onChange={(value) => setMontoContado(Number(value ?? 0))}
                            disabled={loading}
                            autoFocus
                        />
                    </Form.Item>

                    <Form.Item label="Diferencia">
                        <Text type={requiereObs ? (diferencia > 0 ? 'success' : 'danger') : undefined}>
                            {formatMoney(diferencia)}
                        </Text>
                    </Form.Item>

                    {requiereObs ? (
                        <Alert
                            type="warning"
                            showIcon
                            style={{ marginBottom: 12 }}
                            message="Hay diferencia respecto al esperado. Indique una observación."
                        />
                    ) : null}

                    <Form.Item
                        label="Observación"
                        required={requiereObs}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder={
                                requiereObs
                                    ? 'Obligatoria por diferencia'
                                    : 'Opcional'
                            }
                            value={observaciones}
                            onChange={(event) => setObservaciones(event.target.value)}
                            disabled={loading}
                        />
                    </Form.Item>
                </Form>
            ) : null}
        </Drawer>
    )
}
