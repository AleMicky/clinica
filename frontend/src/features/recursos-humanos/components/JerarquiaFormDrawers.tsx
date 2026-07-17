import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row, Select } from 'antd'

import {
    catalogoBaseDefaultValues,
    catalogoBaseSchema,
    departamentoDefaultValues,
    departamentoSchema,
    servicioDefaultValues,
    servicioSchema,
    type CatalogoBaseFormValues,
    type DepartamentoFormValues,
    type ServicioFormValues,
} from '../../catalogo-clinico/schemas/catalogo-clinico.schema'
import type { Area, Departamento, Servicio } from '../../catalogo-clinico/types/catalogo-clinico.types'
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

type JerarquiaDepartamentoDrawerProps = {
    open: boolean
    departamento: Departamento | null
    areas: Area[]
    defaultAreaId?: string | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: DepartamentoFormValues) => Promise<void>
}

export function JerarquiaDepartamentoDrawer({
    open,
    departamento,
    areas,
    defaultAreaId,
    loading,
    onClose,
    onSubmit,
}: JerarquiaDepartamentoDrawerProps) {
    const isEditing = departamento !== null

    const form = useForm({
        defaultValues: departamentoDefaultValues,
        validators: { onSubmit: departamentoSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (departamento) {
            form.reset()
            form.setFieldValue('areaId', departamento.areaId)
            form.setFieldValue('codigo', departamento.codigo)
            form.setFieldValue('nombre', departamento.nombre)
            form.setFieldValue('descripcion', departamento.descripcion ?? '')
            return
        }

        form.reset()
        if (defaultAreaId) {
            form.setFieldValue('areaId', defaultAreaId)
        }
    }, [open, departamento, defaultAreaId, form])

    return (
        <Drawer
            title={isEditing ? 'Editar departamento' : 'Nuevo departamento'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            placement="left"
            size={520}
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
                    <Col span={24}>
                        <form.Field name="areaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Área padre"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Seleccione área"
                                            optionFilterProp="label"
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            disabled={
                                                loading ||
                                                Boolean(defaultAreaId && !isEditing)
                                            }
                                            options={areas.map((area) => ({
                                                value: area.id,
                                                label: `${area.nombre} (${area.codigo})`,
                                            }))}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                    <Col xs={24} sm={12}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Ej. DEP-ADM"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value.toUpperCase())
                                            }
                                            disabled={loading || isEditing}
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
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
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
                            {(field) => (
                                <Form.Item label="Descripción">
                                    <Input.TextArea
                                        rows={2}
                                        value={field.state.value ?? ''}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}

type JerarquiaServicioDrawerProps = {
    open: boolean
    servicio: Servicio | null
    departamentos: Departamento[]
    defaultDepartamentoId?: string | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: ServicioFormValues) => Promise<void>
}

export function JerarquiaServicioDrawer({
    open,
    servicio,
    departamentos,
    defaultDepartamentoId,
    loading,
    onClose,
    onSubmit,
}: JerarquiaServicioDrawerProps) {
    const isEditing = servicio !== null

    const form = useForm({
        defaultValues: servicioDefaultValues,
        validators: { onSubmit: servicioSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (servicio) {
            form.reset()
            form.setFieldValue('departamentoId', servicio.departamentoId)
            form.setFieldValue('codigo', servicio.codigo)
            form.setFieldValue('nombre', servicio.nombre)
            form.setFieldValue('descripcion', servicio.descripcion ?? '')
            return
        }

        form.reset()
        if (defaultDepartamentoId) {
            form.setFieldValue('departamentoId', defaultDepartamentoId)
        }
    }, [open, servicio, defaultDepartamentoId, form])

    return (
        <Drawer
            title={isEditing ? 'Editar servicio' : 'Nuevo servicio'}
            open={open}
            onClose={() => {
                if (!loading) onClose()
            }}
            placement="left"
            size={520}
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
                    <form.Field name="departamentoId">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)
                            const parentArea = departamentos.find(
                                (dept) => dept.id === field.state.value,
                            )

                            return (
                                <>
                                    <Col span={24}>
                                        <Form.Item label="Área padre">
                                            <Input
                                                value={parentArea?.areaNombre ?? ''}
                                                placeholder="Seleccione un departamento"
                                                disabled
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            label="Departamento padre"
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Seleccione departamento"
                                                optionFilterProp="label"
                                                value={field.state.value || undefined}
                                                onChange={(value) => field.handleChange(value)}
                                                disabled={
                                                    loading ||
                                                    Boolean(defaultDepartamentoId && !isEditing)
                                                }
                                                options={departamentos.map((dept) => ({
                                                    value: dept.id,
                                                    label: `${dept.nombre} (${dept.codigo})`,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                </>
                            )
                        }}
                    </form.Field>
                    <Col xs={24} sm={12}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="Ej. TES"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value.toUpperCase())
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || isEditing}
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
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                    <Col span={24}>
                        <form.Field name="descripcion">
                            {(field) => (
                                <Form.Item label="Descripción">
                                    <Input.TextArea
                                        rows={2}
                                        value={field.state.value ?? ''}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    )
}
