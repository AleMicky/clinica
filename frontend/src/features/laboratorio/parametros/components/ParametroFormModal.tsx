import { useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, InputNumber, Modal, Row, Select, Switch } from 'antd'

import { getFieldError } from '../../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../../shared/utils/format-codigo'
import { useUnidadesMedida } from '../../../parametros/unidades-medida/hooks/unidades-medida.hooks'
import { usePruebas } from '../../pruebas/hooks/pruebas.hooks'
import {
    parametroDefaultValues,
    parametroSchema,
    type ParametroFormValues,
} from '../schemas/parametro.schema'
import { PARAMETRO_TIPO_DATO_OPTIONS, type Parametro } from '../types/parametro.types'

type ParametroFormModalProps = {
    open: boolean
    entity: Parametro | null
    loading: boolean
    initialPruebaId?: string
    onClose: () => void
    onSubmit: (values: ParametroFormValues) => Promise<void>
}

const LOOKUP_QUERY = { page: 1, pageSize: 200 } as const

export function ParametroFormModal({
    open,
    entity,
    loading,
    initialPruebaId,
    onClose,
    onSubmit,
}: ParametroFormModalProps) {
    const isEditing = entity !== null

    const { data: pruebasResult, isFetching: loadingPruebas } = usePruebas(LOOKUP_QUERY)
    const { data: unidadesResult, isFetching: loadingUnidades } =
        useUnidadesMedida(LOOKUP_QUERY)

    const form = useForm({
        defaultValues: parametroDefaultValues,
        validators: { onSubmit: parametroSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const pruebaOptions = useMemo(
        () =>
            (pruebasResult?.items ?? []).map((item) => ({
                label: `${item.codigo} — ${item.nombre}`,
                value: item.id,
            })),
        [pruebasResult?.items],
    )

    const unidadOptions = useMemo(
        () =>
            (unidadesResult?.items ?? []).map((item) => ({
                label: `${item.nombre} (${item.simbolo})`,
                value: item.id,
            })),
        [unidadesResult?.items],
    )

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('pruebaId', entity.pruebaId)
            form.setFieldValue('codigo', entity.codigo)
            form.setFieldValue('nombre', entity.nombre)
            form.setFieldValue('unidadMedidaId', entity.unidadMedidaId ?? '')
            form.setFieldValue('tipoDato', entity.tipoDato as ParametroFormValues['tipoDato'])
            form.setFieldValue('orden', entity.orden)
            form.setFieldValue('activo', entity.activo)
            return
        }

        form.reset()
        if (initialPruebaId) {
            form.setFieldValue('pruebaId', initialPruebaId)
        }
    }, [open, entity, initialPruebaId, form])

    const lookupsLoading = loadingPruebas || loadingUnidades

    return (
        <Modal
            title={isEditing ? 'Editar parámetro' : 'Nuevo parámetro'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={600}
        >
            <Form layout="vertical" requiredMark={false}>
                <Row gutter={16}>
                    <Col xs={24}>
                        <form.Field name="pruebaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Prueba"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar prueba"
                                            options={pruebaOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || lookupsLoading || isEditing}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={10}>
                        <form.Field name="codigo">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Código"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Identificador único, ej. GLU_VALOR'}
                                    >
                                        <Input
                                            placeholder="Ej. GLU_VALOR"
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
                                            placeholder="Glucosa"
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
                        <form.Field name="tipoDato">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Tipo de dato"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            options={PARAMETRO_TIPO_DATO_OPTIONS}
                                            value={field.state.value}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="unidadMedidaId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Unidad de medida"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Opcional'}
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Sin unidad"
                                            options={unidadOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) =>
                                                field.handleChange(value ?? '')
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
                        <form.Field name="orden">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)
                                return (
                                    <Form.Item
                                        label="Orden"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || 'Posición en listados (0 = primero)'}
                                    >
                                        <InputNumber
                                            min={0}
                                            precision={0}
                                            style={{ width: '100%' }}
                                            value={field.state.value}
                                            onChange={(value) =>
                                                field.handleChange(value ?? 0)
                                            }
                                            onBlur={field.handleBlur}
                                            disabled={loading}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="activo">
                            {(field) => (
                                <Form.Item label="Activo">
                                    <Switch
                                        checked={field.state.value}
                                        onChange={(checked) => field.handleChange(checked)}
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
