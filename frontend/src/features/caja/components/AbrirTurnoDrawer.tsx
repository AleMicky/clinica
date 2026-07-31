import { useEffect, useState } from 'react'
import { Button, Drawer, Flex, Form, Grid, Input, InputNumber, Select, Typography } from 'antd'

import type { AbrirTurnoPayload } from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type Option = { label: string; value: string }

type AbrirTurnoDrawerProps = {
    open: boolean
    loading: boolean
    cajaOptions: Option[]
    onClose: () => void
    onSubmit: (payload: AbrirTurnoPayload) => Promise<void>
}

export function AbrirTurnoDrawer({
    open,
    loading,
    cajaOptions,
    onClose,
    onSubmit,
}: AbrirTurnoDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const [cajaId, setCajaId] = useState<string>()
    const [montoInicial, setMontoInicial] = useState(0)
    const [observacion, setObservacion] = useState('')

    useEffect(() => {
        if (!open) return
        setCajaId(undefined)
        setMontoInicial(0)
        setObservacion('')
    }, [open])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const canSubmit = Boolean(cajaId) && montoInicial >= 0

    return (
        <Drawer
            title="Abrir turno de caja"
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
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => {
                            if (!cajaId) return
                            void onSubmit({
                                cajaId,
                                montoInicial,
                                observacionApertura: observacion.trim() || null,
                            })
                        }}
                    >
                        Abrir turno
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                </Text>

                <Form.Item label="Caja" required>
                    <Select
                        placeholder="Seleccione caja"
                        value={cajaId}
                        options={cajaOptions}
                        onChange={setCajaId}
                        disabled={loading}
                        showSearch
                        optionFilterProp="label"
                        autoFocus
                    />
                </Form.Item>

                <Form.Item label="Monto inicial" required>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.01}
                        value={montoInicial}
                        onChange={(value) => setMontoInicial(Number(value ?? 0))}
                        disabled={loading}
                    />
                </Form.Item>

                <Form.Item label="Observación">
                    <Input.TextArea
                        rows={3}
                        maxLength={2000}
                        showCount
                        placeholder="Opcional"
                        value={observacion}
                        onChange={(event) => setObservacion(event.target.value)}
                        disabled={loading}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
