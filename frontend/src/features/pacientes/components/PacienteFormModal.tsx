import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, Modal, Select } from 'antd'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import {
    pacienteDefaultValues,
    pacienteSchema,
    type PacienteFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'

type PacienteFormModalProps = {
    open: boolean
    paciente: Paciente | null
    loading: boolean
    initialPersonaId?: string
    lockPersona?: boolean
    title?: string
    onClose: () => void
    onSubmit: (values: PacienteFormValues) => Promise<void>
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

export function PacienteFormModal({
    open,
    paciente,
    loading,
    initialPersonaId,
    lockPersona = false,
    title,
    onClose,
    onSubmit,
}: PacienteFormModalProps) {
    const isEditing = paciente !== null
    const { data: catalogos, isFetching: loadingCatalogos } = useCatalogoGruposGrouped()
    const { data: personasResult, isFetching: loadingPersonas } = usePersonasLookup()

    const form = useForm({
        defaultValues: pacienteDefaultValues,
        validators: {
            onSubmit: pacienteSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()

        if (paciente) {
            form.setFieldValue('personaId', paciente.personaId)
            form.setFieldValue('numeroHistoriaClinica', paciente.numeroHistoriaClinica)
            form.setFieldValue('grupoSanguineoId', paciente.grupoSanguineoId ?? '')
            form.setFieldValue('alergias', paciente.alergias ?? '')
            form.setFieldValue('observaciones', paciente.observaciones ?? '')
        } else if (initialPersonaId) {
            form.setFieldValue('personaId', initialPersonaId)
        }
    }, [open, paciente, initialPersonaId, form])

    const grupoSanguineoOptions =
        catalogos
            ?.find((grupo) => grupo.codigo === 'GRUPO_SANGUINEO')
            ?.items.map((item) => ({
                label: item.nombre,
                value: item.id,
            })) ?? []

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={title ?? (isEditing ? 'Editar paciente' : 'Nuevo paciente')}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form layout="vertical" requiredMark={false}>
                <form.Field name="personaId">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Persona"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Select
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Seleccione una persona registrada"
                                    options={personaOptions}
                                    value={field.state.value || undefined}
                                    onChange={(value) => field.handleChange(value)}
                                    onBlur={field.handleBlur}
                                    disabled={
                                        loading ||
                                        loadingPersonas ||
                                        isEditing ||
                                        lockPersona
                                    }
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="numeroHistoriaClinica">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)

                        return (
                            <Form.Item
                                label="Número de historia clínica"
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="HC-0001"
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

                <form.Field name="grupoSanguineoId">
                    {(field) => (
                        <Form.Item label="Grupo sanguíneo">
                            <Select
                                allowClear
                                placeholder="Opcional"
                                options={grupoSanguineoOptions}
                                value={field.state.value || undefined}
                                onChange={(value) => field.handleChange(value ?? '')}
                                onBlur={field.handleBlur}
                                disabled={loading || loadingCatalogos}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="alergias">
                    {(field) => (
                        <Form.Item label="Alergias">
                            <Input.TextArea
                                rows={2}
                                placeholder="Alergias conocidas"
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

                <form.Field name="observaciones">
                    {(field) => (
                        <Form.Item label="Observaciones">
                            <Input.TextArea
                                rows={3}
                                placeholder="Notas adicionales"
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
            </Form>
        </Modal>
    )
}
