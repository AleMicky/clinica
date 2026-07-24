import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Col, Form, Input, Modal, Row, Select } from 'antd'

import {
    useFormulariosClinicos,
    usePacientesLookup,
    useTiposAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    atencionDefaultValues,
    atencionFormSchema,
    atencionToFormValues,
    type AtencionFormValues,
} from '../schemas/atencion.schema'
import type { Atencion } from '../types/atencion-medica.types'

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

export function AtencionFormModal({
    open,
    atencion,
    loading,
    onClose,
    onSubmit,
}: AtencionFormModalProps) {
    const isEditing = atencion !== null
    const [tipoAtencionId, setTipoAtencionId] = useState('')

    const { data: pacientesData, isFetching: loadingPacientes } = usePacientesLookup({
        page: 1,
        pageSize: 200,
    })
    const { data: tiposData, isFetching: loadingTipos } = useTiposAtencion()

    const form = useForm({
        defaultValues: atencionDefaultValues,
        validators: { onSubmit: atencionFormSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const tipoAtencionIdForQuery = tipoAtencionId || undefined

    const { data: formulariosData, isFetching: loadingFormularios } =
        useFormulariosClinicos({
            page: 1,
            pageSize: 100,
            tipoAtencionId: tipoAtencionIdForQuery,
        })

    useEffect(() => {
        if (!open) return

        if (atencion) {
            const values = atencionToFormValues(atencion)
            form.reset(values)
            setTipoAtencionId(values.tipoAtencionId)
            return
        }

        form.reset(atencionDefaultValues)
        setTipoAtencionId('')
    }, [open, atencion, form])

    const pacienteOptions =
        pacientesData?.items.map((paciente) => ({
            value: paciente.id,
            label: `${paciente.numeroHistoriaClinica} — ${paciente.personaNombreCompleto}`,
        })) ?? []

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

    const formDisabled = loading || loadingPacientes || loadingTipos

    return (
        <Modal
            title={isEditing ? 'Editar atención' : 'Nueva atención'}
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={720}
        >
            <Form layout="vertical" requiredMark={false}>
                {isEditing && atencion ? (
                    <Form.Item label="Número de atención">
                        <Input value={atencion.numeroAtencion} disabled />
                    </Form.Item>
                ) : null}

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
                                    onBlur={field.handleBlur}
                                    disabled={formDisabled}
                                    autoFocus={!isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="pacienteId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Paciente"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Select
                                    showSearch
                                    placeholder="Seleccione un paciente"
                                    optionFilterProp="label"
                                    options={pacienteOptions}
                                    value={field.state.value || undefined}
                                    onChange={(value) => field.handleChange(value)}
                                    onBlur={field.handleBlur}
                                    disabled={formDisabled}
                                    loading={loadingPacientes}
                                />
                            </Form.Item>
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
                                            placeholder="Seleccione"
                                            optionFilterProp="label"
                                            options={tipoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => {
                                                field.handleChange(value)
                                                setTipoAtencionId(value)
                                                form.setFieldValue('formularioClinicoId', '')
                                            }}
                                            onBlur={field.handleBlur}
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
                                            placeholder={
                                                tipoAtencionIdForQuery
                                                    ? 'Seleccione'
                                                    : 'Primero elija tipo de atención'
                                            }
                                            optionFilterProp="label"
                                            options={formularioOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={formDisabled || !tipoAtencionIdForQuery}
                                            loading={loadingFormularios}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>
                </Row>

                <form.Field name="observaciones">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Observaciones"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Opcional"
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={formDisabled}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Modal>
    )
}
