import { useEffect, useMemo, useState } from 'react'
import { Button, Drawer, Flex, Form, Grid, Input, InputNumber, Select, Typography } from 'antd'

import type { MetodoPago, RegistrarMovimientoPayload } from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type Option = { label: string; value: string }

type RegistrarMovimientoDrawerProps = {
    open: boolean
    tipo: 'INGRESO' | 'EGRESO' | null
    loading: boolean
    conceptoOptions: Option[]
    metodos: MetodoPago[] | undefined
    onClose: () => void
    onSubmit: (payload: RegistrarMovimientoPayload) => Promise<void>
}

export function RegistrarMovimientoDrawer({
    open,
    tipo,
    loading,
    conceptoOptions,
    metodos,
    onClose,
    onSubmit,
}: RegistrarMovimientoDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const [conceptoId, setConceptoId] = useState<string>()
    const [metodoId, setMetodoId] = useState<string>()
    const [numeroReferencia, setNumeroReferencia] = useState('')
    const [importe, setImporte] = useState(0)
    const [descripcion, setDescripcion] = useState('')

    useEffect(() => {
        if (!open) return
        setConceptoId(undefined)
        setMetodoId(undefined)
        setNumeroReferencia('')
        setImporte(0)
        setDescripcion('')
    }, [open, tipo])

    const metodoSeleccionado = useMemo(
        () => metodos?.find((m) => m.id === metodoId),
        [metodos, metodoId],
    )
    const requiereReferencia = Boolean(metodoSeleccionado?.requiereReferencia)

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const canSubmit =
        Boolean(conceptoId) &&
        importe > 0 &&
        (!requiereReferencia || Boolean(numeroReferencia.trim()))

    const title = tipo === 'EGRESO' ? 'Registrar egreso' : 'Registrar ingreso'

    return (
        <Drawer
            title={title}
            open={open && tipo != null}
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
                        danger={tipo === 'EGRESO'}
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => {
                            if (!conceptoId || importe <= 0) return
                            void onSubmit({
                                conceptoCajaId: conceptoId,
                                importe,
                                metodoPagoId: metodoId || null,
                                numeroReferencia: requiereReferencia
                                    ? numeroReferencia.trim() || null
                                    : null,
                                descripcion: descripcion.trim() || null,
                            })
                        }}
                    >
                        {tipo === 'EGRESO' ? 'Registrar egreso' : 'Registrar ingreso'}
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

                <Form.Item label="Concepto" required>
                    <Select
                        placeholder="Seleccione concepto"
                        value={conceptoId}
                        options={conceptoOptions}
                        onChange={setConceptoId}
                        disabled={loading}
                        showSearch
                        optionFilterProp="label"
                        autoFocus
                    />
                </Form.Item>

                <Form.Item label="Método de pago">
                    <Select
                        allowClear
                        placeholder="Opcional"
                        value={metodoId}
                        options={(metodos ?? []).map((m) => ({
                            value: m.id,
                            label: m.nombre,
                        }))}
                        onChange={(value) => {
                            setMetodoId(value)
                            setNumeroReferencia('')
                        }}
                        disabled={loading}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>

                {requiereReferencia ? (
                    <Form.Item
                        label="Número de referencia"
                        required
                        help="Este método de pago exige una referencia (voucher, transferencia, etc.)."
                    >
                        <Input
                            maxLength={100}
                            placeholder="Ej. Nº de voucher o transferencia"
                            value={numeroReferencia}
                            onChange={(event) => setNumeroReferencia(event.target.value)}
                            disabled={loading}
                        />
                    </Form.Item>
                ) : null}

                <Form.Item label="Importe" required>
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0.01}
                        step={0.01}
                        value={importe || null}
                        onChange={(value) => setImporte(Number(value ?? 0))}
                        disabled={loading}
                    />
                </Form.Item>

                <Form.Item label="Descripción">
                    <Input.TextArea
                        rows={3}
                        maxLength={2000}
                        showCount
                        placeholder="Opcional"
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        disabled={loading}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}
