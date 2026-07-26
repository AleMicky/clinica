import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row } from 'antd'

import {
    catalogoBaseDefaultValues,
    catalogoBaseSchema,
    type CatalogoBaseFormValues,
} from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { Area } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { getFieldError } from '../utils/form-errors'

type DrawerFooterProps = {
    loading: boolean
    isEditing: boolean
    onClose: () => void
    onSubmit: () => void
}

function DrawerFooter({ loading, isEditing, onClose, onSubmit }: DrawerFooterProps) {
    return (
        <Flex justify="flex-end" gap={8}>
            <Button onClick={onClose} disabled={loading}>
                Cancelar
            </Button>
            <Button type="primary" loading={loading} onClick={onSubmit}>
                {isEditing ? 'Guardar' : 'Crear'}
            </Button>
        </Flex>
    )
}

type JerarquiaAreaDrawerProps = {
    open: boolean
    entity: Area | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: CatalogoBaseFormValues) => Promise<void>
}

export function JerarquiaAreaDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: JerarquiaAreaDrawerProps) {
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

    return (
        <Drawer
            title={isEditing ? 'Editar área' : 'Nueva área'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            placement="left"
            size={480}
            destroyOnHidden
            footer={
                <DrawerFooter
                    loading={loading}
                    isEditing={isEditing}
                    onClose={onClose}
                    onSubmit={() => void form.handleSubmit()}
                />
            }
        >
            <Form layout="vertical" requiredMark={false} className="jerarquia-explorer__drawer-form">
                <Row gutter={12}>
                    <Col xs={24} sm={12}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Ej. ADM, SALUD'}
                                    >
                                        <Input
                                            placeholder="Ej. ADM"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value.toUpperCase())
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || isEditing}
                                            autoFocus={!isEditing}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                    <Col xs={24} sm={12}>
                        <form.Field name="nombre">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Nombre"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Nombre del área"
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
                    </Col>
                    <Col span={24}>
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
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}
