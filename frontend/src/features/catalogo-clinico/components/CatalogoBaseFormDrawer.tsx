import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Input, Typography } from 'antd'

import { getFieldError } from '../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../shared/utils/format-codigo'
import {
    catalogoBaseDefaultValues,
    catalogoBaseSchema,
    type CatalogoBaseFormValues,
} from '../schemas/catalogo-clinico.schema'
import type { CatalogoBase } from '../types/catalogo-clinico.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type CatalogoBaseFormDrawerProps = {
    open: boolean
    entityLabel: string
    entity: CatalogoBase | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: CatalogoBaseFormValues) => Promise<void>
}

export function CatalogoBaseFormDrawer({
    open,
    entityLabel,
    entity,
    loading,
    onClose,
    onSubmit,
}: CatalogoBaseFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: catalogoBaseDefaultValues,
        validators: { onSubmit: catalogoBaseSchema },
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
            form.setFieldValue('descripcion', entity.descripcion ?? '')
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
            title={isEditing ? `Editar ${entityLabel}` : `Nuevo ${entityLabel}`}
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
                                help={error || 'Identificador único, ej. CARD, LAB01'}
                            >
                                <Input
                                    placeholder="Ej. EMER, CARD"
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
                                    placeholder="Nombre descriptivo"
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

                <form.Field name="descripcion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Descripción"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Opcional'}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Detalle adicional…"
                                    value={field.state.value ?? ''}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Drawer>
    )
}
