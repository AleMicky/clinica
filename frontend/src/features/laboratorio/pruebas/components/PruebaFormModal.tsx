import { useEffect, useMemo } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Col, Form, Input, InputNumber, Modal, Row, Select, Switch } from 'antd'

import { useCatalogoGruposGrouped } from '../../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { getFieldError } from '../../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../../shared/utils/format-codigo'
import { useEspecialidadesLab } from '../../especialidades/hooks/especialidades.hooks'
import { useTiposExamen } from '../../tipos-examen/hooks/tipos-examen.hooks'
import {
    pruebaDefaultValues,
    pruebaSchema,
    type PruebaFormValues,
} from '../schemas/prueba.schema'
import type { Prueba } from '../types/prueba.types'

type PruebaFormModalProps = {
    open: boolean
    entity: Prueba | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: PruebaFormValues) => Promise<void>
}

const LOOKUP_QUERY = { page: 1, pageSize: 200 } as const
const TIPO_MUESTRA_GRUPO = 'TIPO_MUESTRA'

export function PruebaFormModal({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: PruebaFormModalProps) {
    const isEditing = entity !== null

    const { data: especialidadesResult, isFetching: loadingEspecialidades } =
        useEspecialidadesLab(LOOKUP_QUERY)
    const { data: tiposExamenResult, isFetching: loadingTiposExamen } =
        useTiposExamen(LOOKUP_QUERY)
    const { data: catalogos, isPending: loadingCatalogos } =
        useCatalogoGruposGrouped()

    const form = useForm({
        defaultValues: pruebaDefaultValues,
        validators: { onSubmit: pruebaSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const requiereAyuno = useStore(form.store, (state) => state.values.requiereAyuno)

    const especialidadOptions = useMemo(
        () =>
            (especialidadesResult?.items ?? []).map((item) => ({
                label: `${item.codigo} — ${item.nombre}`,
                value: item.id,
            })),
        [especialidadesResult?.items],
    )

    const tipoExamenOptions = useMemo(
        () =>
            (tiposExamenResult?.items ?? []).map((item) => ({
                label: `${item.codigo} — ${item.nombre}`,
                value: item.id,
            })),
        [tiposExamenResult?.items],
    )

    const tipoMuestraOptions = useMemo(
        () =>
            catalogos
                ?.find((grupo) => grupo.codigo === TIPO_MUESTRA_GRUPO)
                ?.items.map((item) => ({
                    label: item.nombre,
                    value: item.id,
                })) ?? [],
        [catalogos],
    )

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('codigo', entity.codigo)
            form.setFieldValue('nombre', entity.nombre)
            form.setFieldValue('especialidadId', entity.especialidadId)
            form.setFieldValue('tipoExamenId', entity.tipoExamenId)
            form.setFieldValue('tipoMuestraId', entity.tipoMuestraId)
            form.setFieldValue('requiereAyuno', entity.requiereAyuno)
            form.setFieldValue('horasAyuno', entity.horasAyuno)
            form.setFieldValue('esDerivable', entity.esDerivable)
            return
        }

        form.reset()
    }, [open, entity, form])

    const lookupsLoading =
        loadingEspecialidades || loadingTiposExamen || loadingCatalogos

    return (
        <Modal
            title={isEditing ? 'Editar prueba de laboratorio' : 'Nueva prueba de laboratorio'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={640}
        >
            <Form layout="vertical" requiredMark={false}>
                <Row gutter={16}>
                    <Col xs={24} sm={10}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Identificador único, ej. GLU'}
                                    >
                                        <Input
                                            placeholder="Ej. GLU"
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
                    </Col>

                    <Col xs={24} sm={14}>
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
                                            placeholder="Glucosa en ayunas"
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                            autoFocus={isEditing}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="especialidadId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Especialidad"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar especialidad"
                                            options={especialidadOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || lookupsLoading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="tipoExamenId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Tipo de examen"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar tipo"
                                            options={tipoExamenOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || lookupsLoading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="tipoMuestraId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Tipo de muestra"
                                        validateStatus={error ? 'error' : undefined}
                                        help={
                                            error ||
                                            'Catálogo TIPO_MUESTRA en Parámetros'
                                        }
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar tipo de muestra"
                                            options={tipoMuestraOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || lookupsLoading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="requiereAyuno">
                            {(field) => (
                                <Form.Item label="Requiere ayuno">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) => {
                                            field.handleChange(checked)
                                            if (!checked) {
                                                form.setFieldValue('horasAyuno', null)
                                            }
                                        }}
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="horasAyuno">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Horas de ayuno"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={72}
                                            precision={0}
                                            style={{ width: '100%' }}
                                            value={field.state.value ?? undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? null)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading || !requiereAyuno}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="esDerivable">
                            {(field) => (
                                <Form.Item label="Es derivable">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) =>
                                            field.handleChange(checked)
                                        }
                                        disabled={loading}
                                    />
                                </Form.Item>
                            )}
                        </form.Field>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}
