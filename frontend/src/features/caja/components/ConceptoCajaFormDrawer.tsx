import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Input, Select, Switch, Typography } from 'antd'

import { getFieldError } from '../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../shared/utils/format-codigo'
import {
    conceptoCajaDefaultValues,
    conceptoCajaSchema,
    type ConceptoCajaFormValues,
} from '../schemas/concepto-caja.schema'
import type { ConceptoCaja } from '../types/caja.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type ConceptoCajaFormDrawerProps = {
    open: boolean
    entity: ConceptoCaja | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: ConceptoCajaFormValues) => Promise<void>
}

export function ConceptoCajaFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: ConceptoCajaFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null
    const isProtected = entity?.codigo === 'FONDO_INICIAL'

    const form = useForm({
        defaultValues: conceptoCajaDefaultValues,
        validators: { onSubmit: conceptoCajaSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('codigo', entity.codigo)
            form.setFieldValue('nombre', entity.nombre)
            form.setFieldValue(
                'tipoMovimiento',
                entity.tipoMovimiento === 'EGRESO' ? 'EGRESO' : 'INGRESO',
            )
            form.setFieldValue('activo', entity.activo)
            return
        }

        form.reset()
    }, [open, entity, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={isEditing ? 'Editar concepto' : 'Nuevo concepto'}
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
                        onClick={() => void form.handleSubmit()}
                    >
                        {isEditing ? 'Guardar' : 'Crear'}
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

                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Identificador único, ej. INGRESO_EXTRA'}
                            >
                                <Input
                                    placeholder="Ej. GASTO_MENOR"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(
                                            normalizeCodigoInput(e.target.value),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading || isEditing}
                                    autoFocus={!isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="nombre">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Nombre"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Gasto menor"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus={isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="tipoMovimiento">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Tipo de movimiento"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={
                                    error ||
                                    (isProtected
                                        ? 'No se puede cambiar el tipo de FONDO_INICIAL'
                                        : undefined)
                                }
                            >
                                <Select
                                    value={field.state.value}
                                    onChange={(value) => field.handleChange(value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading || isProtected}
                                    options={[
                                        { label: 'Ingreso', value: 'INGRESO' },
                                        { label: 'Egreso', value: 'EGRESO' },
                                    ]}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="activo">
                    {(field) => (
                        <Form.Item
                            label="Activo"
                            help="Solo los conceptos activos aparecen al registrar movimientos"
                        >
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading || isProtected}
                            />
                        </Form.Item>
                    )}
                </form.Field>
            </Form>
        </Drawer>
    )
}
