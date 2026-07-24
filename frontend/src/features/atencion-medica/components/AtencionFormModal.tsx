import { useRef } from 'react'
import { Modal } from 'antd'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import { Col, Form, Input, Row, Select } from 'antd'

import {
    useFormulariosClinicos,
    useTiposAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    atencionDefaultValues,
    atencionFormSchema,
    atencionToFormValues,
    type AtencionFormValues,
} from '../schemas/atencion.schema'
import type { Atencion } from '../types/atencion-medica.types'
import { PacienteSearchBox } from './PacienteSearchBox'

type AtencionFormModalProps = {
    open: boolean
    atencion: Atencion | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: AtencionFormValues) => Promise<void>
}

function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

/** Modal solo para editar atenciones existentes. */
export function AtencionFormModal({
    open,
    atencion,
    loading,
    onClose,
    onSubmit,
}: AtencionFormModalProps) {
    const [tipoAtencionId, setTipoAtencionId] = useState('')
    const submitRef = useRef<() => void>(() => undefined)

    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()

    const form = useForm({
        defaultValues: atencionDefaultValues,
        validators: { onSubmit: atencionFormSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    submitRef.current = () => void form.handleSubmit()

    const tipoAtencionIdForQuery = tipoAtencionId || undefined

    const { data: formulariosData, isFetching: loadingFormularios } =
        useFormulariosClinicos({
            page: 1,
            pageSize: 100,
            tipoAtencionId: tipoAtencionIdForQuery,
        })

    useEffect(() => {
        if (!open || !atencion) return
        const values = atencionToFormValues(atencion)
        form.reset(values)
        setTipoAtencionId(values.tipoAtencionId)
    }, [open, atencion, form])

    const tipoOptions =
        tiposData?.items.map((tipo) => ({
            value: tipo.id,
            label: `${tipo.codigo} — ${tipo.nombre}`,
        })) ?? []

    const formularioOptions =
        formulariosData?.items
            .filter((formulario) => formulario.activo)
            .map((formulario) => ({
                value: formulario.id,
                label: `${formulario.codigo} v${formulario.version} — ${formulario.nombre}`,
            })) ?? []

    const formDisabled = loading || loadingTipos

    return (
        <Modal
            title="Editar atención"
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => submitRef.current()}
            okText="Guardar"
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={720}
        >
            {open && atencion ? (
                <Form layout="vertical" requiredMark={false}>
                    <Form.Item label="Número de atención">
                        <Input value={atencion.numeroAtencion} disabled />
                    </Form.Item>

                    <form.Field name="pacienteId">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)
                            return (
                                <PacienteSearchBox
                                    value={field.state.value || undefined}
                                    error={error || undefined}
                                    disabled={formDisabled}
                                    onBlur={field.handleBlur}
                                    onChange={(paciente) =>
                                        field.handleChange(paciente?.id ?? '')
                                    }
                                />
                            )
                        }}
                    </form.Field>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <form.Field name="tipoAtencionId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)
                                    return (
                                        <Form.Item
                                            label="Tipo de atención"
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={tipoOptions}
                                                value={field.state.value || undefined}
                                                onChange={(value) => {
                                                    field.handleChange(value)
                                                    setTipoAtencionId(value)
                                                    form.setFieldValue(
                                                        'formularioClinicoId',
                                                        '',
                                                    )
                                                }}
                                                disabled={formDisabled}
                                                loading={loadingTipos}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>
                        <Col xs={24} md={12}>
                            <form.Field name="formularioClinicoId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)
                                    return (
                                        <Form.Item
                                            label="Formulario clínico"
                                            validateStatus={error ? 'error' : undefined}
                                            help={error || undefined}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={formularioOptions}
                                                value={field.state.value || undefined}
                                                onChange={field.handleChange}
                                                disabled={
                                                    formDisabled || !tipoAtencionIdForQuery
                                                }
                                                loading={loadingFormularios}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </form.Field>
                        </Col>
                    </Row>

                    <form.Field name="fechaAtencion">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)
                            return (
                                <Form.Item
                                    label="Fecha de atención"
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || undefined}
                                >
                                    <Input
                                        type="datetime-local"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                        disabled={formDisabled}
                                    />
                                </Form.Item>
                            )
                        }}
                    </form.Field>

                    <form.Field name="observaciones">
                        {(field) => (
                            <Form.Item label="Observaciones">
                                <Input.TextArea
                                    rows={3}
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    disabled={formDisabled}
                                />
                            </Form.Item>
                        )}
                    </form.Field>
                </Form>
            ) : null}
        </Modal>
    )
}
