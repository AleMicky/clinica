import { useEffect } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Col, Form, Input, Modal, Row, Select } from 'antd'

import { useEspecialidades } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { useEmpleadosLookup } from '../hooks/medicos.hooks'
import {
    medicoDefaultValues,
    medicoSchema,
    type MedicoFormValues,
} from '../schemas/medico.schema'
import type { Medico } from '../types/medico.types'
import { getFieldError } from '../utils/form-errors'

type MedicoFormModalProps = {
    open: boolean
    medico: Medico | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: MedicoFormValues) => Promise<void>
}

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function MedicoFormModal({
    open,
    medico,
    loading,
    onClose,
    onSubmit,
}: MedicoFormModalProps) {
    const isEditing = medico !== null

    const { data: empleadosResult, isFetching: loadingEmpleados } = useEmpleadosLookup()
    const { data: especialidadesResult, isFetching: loadingEspecialidades } =
        useEspecialidades(LOOKUP_QUERY)

    const form = useForm({
        defaultValues: medicoDefaultValues,
        validators: {
            onSubmit: medicoSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const selectedEspecialidadIds = useStore(
        form.store,
        (state) => state.values.especialidadIds,
    )

    useEffect(() => {
        if (!open) return

        form.reset()

        if (medico) {
            form.setFieldValue('empleadoId', medico.empleadoId)
            form.setFieldValue(
                'especialidadIds',
                medico.especialidades.map((item) => item.especialidadId),
            )
            form.setFieldValue(
                'especialidadPrincipalId',
                medico.especialidadPrincipalId,
            )
            form.setFieldValue('matriculaProfesional', medico.matriculaProfesional)
            form.setFieldValue('registroColegioMedico', medico.registroColegioMedico ?? '')
        }
    }, [open, medico, form])

    const empleadoOptions =
        empleadosResult?.items.map((empleado) => ({
            label: `${empleado.personaNombreCompleto} (${empleado.codigoEmpleado})`,
            value: empleado.id,
        })) ?? []

    const especialidadOptions =
        especialidadesResult?.items.map((especialidad) => ({
            label: especialidad.nombre,
            value: especialidad.id,
        })) ?? []

    const principalOptions = especialidadOptions.filter((option) =>
        selectedEspecialidadIds.includes(option.value),
    )

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={isEditing ? 'Editar médico' : 'Nuevo médico'}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Registrar'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={560}
            className="rrhh-form-modal"
        >
            <Form layout="vertical" requiredMark={false} size="small">
                <Row gutter={12}>
                    <Col xs={24}>
                        <form.Field name="empleadoId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Empleado"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar empleado"
                                            options={empleadoOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingEmpleados || isEditing}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="especialidadIds">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Especialidades"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Select
                                            mode="multiple"
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar especialidades"
                                            options={especialidadOptions}
                                            value={field.state.value}
                                            onChange={(values) => {
                                                field.handleChange(values)

                                                const principalId =
                                                    form.getFieldValue('especialidadPrincipalId')

                                                if (
                                                    values.length === 1 &&
                                                    values[0] !== principalId
                                                ) {
                                                    form.setFieldValue(
                                                        'especialidadPrincipalId',
                                                        values[0],
                                                    )
                                                } else if (
                                                    principalId &&
                                                    !values.includes(principalId)
                                                ) {
                                                    form.setFieldValue(
                                                        'especialidadPrincipalId',
                                                        values[0] ?? '',
                                                    )
                                                }
                                            }}
                                            onBlur={field.handleBlur}
                                            disabled={loading || loadingEspecialidades}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24}>
                        <form.Field name="especialidadPrincipalId">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Especialidad principal"
                                        validateStatus={error ? 'error' : undefined}
                                        help={
                                            error ||
                                            (selectedEspecialidadIds.length > 1
                                                ? 'Se usa como referencia en atención médica.'
                                                : undefined)
                                        }
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            placeholder="Seleccionar especialidad principal"
                                            options={principalOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={
                                                loading ||
                                                loadingEspecialidades ||
                                                selectedEspecialidadIds.length === 0
                                            }
                                        />
                                    </Form.Item>
                                )
                            }}
                        </form.Field>
                    </Col>

                    <Col xs={24} sm={12}>
                        <form.Field name="matriculaProfesional">
                            {(field) => {
                                const error = getFieldError(field.state.meta.errors)

                                return (
                                    <Form.Item
                                        label="Matrícula profesional"
                                        validateStatus={error ? 'error' : undefined}
                                        help={error || undefined}
                                    >
                                        <Input
                                            placeholder="MP-12345"
                                            value={field.state.value}
                                            onChange={(event) =>
                                                field.handleChange(event.target.value)
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
                        <form.Field name="registroColegioMedico">
                            {(field) => (
                                <Form.Item label="Registro colegio médico">
                                    <Input
                                        placeholder="Opcional"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                        onBlur={field.handleBlur}
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
