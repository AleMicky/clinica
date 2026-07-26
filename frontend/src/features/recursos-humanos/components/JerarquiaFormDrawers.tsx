import { useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Col, Drawer, Flex, Form, Input, Row, Select } from 'antd'

import { useAreas } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import type { Area } from '../../catalogo-clinico/types/catalogo-clinico.types'
import { useTiposArea } from '../tipos-area/hooks/tipos-area.hooks'
import {
    areaFormDefaultValues,
    areaFormSchema,
    type AreaFormValues,
} from '../schemas/area.schema'
import { getFieldError } from '../utils/form-errors'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

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
    parentAreaId?: string | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: AreaFormValues) => Promise<void>
}

export function JerarquiaAreaDrawer({
    open,
    entity,
    parentAreaId = null,
    loading,
    onClose,
    onSubmit,
}: JerarquiaAreaDrawerProps) {
    const isEditing = entity !== null
    const { data: tiposAreaResult, isFetching: loadingTiposArea } = useTiposArea(LOOKUP_QUERY)
    const { data: areasResult, isFetching: loadingAreas } = useAreas(LOOKUP_QUERY)

    const tipoAreaOptions = useMemo(
        () =>
            (tiposAreaResult?.items ?? [])
                .slice()
                .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
                .map((item) => ({
                    value: item.id,
                    label: `${item.codigo} · ${item.nombre}`,
                })),
        [tiposAreaResult?.items],
    )

    const areaPadreOptions = useMemo(
        () =>
            (areasResult?.items ?? [])
                .filter((area) => !entity || area.id !== entity.id)
                .map((area) => ({
                    value: area.id,
                    label: `${area.codigo} · ${area.nombre}`,
                })),
        [areasResult?.items, entity],
    )

    const form = useForm({
        defaultValues: areaFormDefaultValues,
        validators: { onSubmit: areaFormSchema },
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
            form.setFieldValue('tipoAreaId', entity.tipoAreaId)
            form.setFieldValue('areaPadreId', entity.areaPadreId ?? '')
            form.setFieldValue('responsableEmpleadoId', entity.responsableEmpleadoId ?? '')
            return
        }

        form.reset()
        form.setFieldValue('areaPadreId', parentAreaId ?? '')
    }, [open, entity, parentAreaId, form])

    return (
        <Drawer
            title={isEditing ? 'Editar área' : parentAreaId ? 'Nueva subárea' : 'Nueva área'}
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
                        <form.Field name="tipoAreaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Tipo de área"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar tipo"
                                            options={tipoAreaOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingTiposArea}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                    <Col span={24}>
                        <form.Field name="areaPadreId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Área padre"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Opcional'}
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Sin área padre"
                                            options={areaPadreOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value ?? '')}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingAreas}
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
