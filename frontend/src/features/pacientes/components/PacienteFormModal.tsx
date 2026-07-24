import { useEffect } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Button,
    Drawer,
    Flex,
    Form,
    Input,
} from 'antd'

import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import { personaSchema } from '../../personas/schemas/persona.schema'
import {
    pacienteDefaultValues,
    pacienteFormSchema,
    type PacienteFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'

type PacienteFormModalProps = {
    open: boolean
    paciente: Paciente | null
    loading: boolean
    title?: string
    onClose: () => void
    onSubmit: (values: PacienteFormValues) => Promise<void>
}

function validatePersonaFields(
    values: PacienteFormValues,
): Record<string, string> {
    const result = personaSchema.safeParse({
        tipoDocumentoId: values.tipoDocumentoId ?? '',
        numeroDocumento: values.numeroDocumento ?? '',
        extensionDocumentoId: values.extensionDocumentoId ?? '',
        complementoDocumento: values.complementoDocumento ?? '',
        nombres: values.nombres ?? '',
        apellidoPaterno: values.apellidoPaterno ?? '',
        apellidoMaterno: values.apellidoMaterno ?? '',
        fechaNacimiento: values.fechaNacimiento ?? '',
        sexoId: values.sexoId ?? '',
        estadoCivilId: values.estadoCivilId ?? '',
        telefono: values.telefono ?? '',
        direccion: values.direccion ?? '',
    })

    if (result.success) return {}

    const fieldErrors: Record<string, string> = {}

    for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? '')
        if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message
        }
    }

    return fieldErrors
}

function applyFieldErrors(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: { setFieldMeta: (name: any, updater: (prev: any) => any) => void },
    fieldErrors: Record<string, string>,
) {
    for (const [fieldName, message] of Object.entries(fieldErrors)) {
        form.setFieldMeta(fieldName, (prev) => ({
            ...prev,
            errorMap: {
                ...prev.errorMap,
                onSubmit: message,
            },
            errors: [message],
        }))
    }
}

function toDateInputValue(value?: string | null) {
    if (!value) return ''
    return value.includes('T') ? value.slice(0, 10) : value
}

export function PacienteFormModal({
    open,
    paciente,
    loading,
    title,
    onClose,
    onSubmit,
}: PacienteFormModalProps) {
    const isEditing = paciente !== null

    const form = useForm({
        defaultValues: pacienteDefaultValues,
        validators: {
            onSubmit: ({ value }) => {
                const result = pacienteFormSchema.safeParse(value)
                if (result.success) return
                return result.error.issues.map((issue) => issue.message).join(', ')
            },
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value as PacienteFormValues)
        },
    })

    const formValues = useStore(form.store, (state) => state.values)

    useEffect(() => {
        if (!open) return

        form.reset()

        if (paciente) {
            form.setFieldValue('personaId', paciente.personaId)
            form.setFieldValue('tipoDocumentoId', paciente.tipoDocumentoId ?? '')
            form.setFieldValue('numeroDocumento', paciente.numeroDocumento ?? '')
            form.setFieldValue(
                'extensionDocumentoId',
                paciente.extensionDocumentoId ?? '',
            )
            form.setFieldValue(
                'complementoDocumento',
                paciente.complementoDocumento ?? '',
            )
            form.setFieldValue('nombres', paciente.nombres ?? '')
            form.setFieldValue('apellidoPaterno', paciente.apellidoPaterno ?? '')
            form.setFieldValue('apellidoMaterno', paciente.apellidoMaterno ?? '')
            form.setFieldValue(
                'fechaNacimiento',
                toDateInputValue(paciente.fechaNacimiento),
            )
            form.setFieldValue('sexoId', paciente.sexoId ?? '')
            form.setFieldValue('estadoCivilId', paciente.estadoCivilId ?? '')
            form.setFieldValue('telefono', paciente.telefono ?? '')
            form.setFieldValue('direccion', paciente.direccion ?? '')
            form.setFieldValue(
                'numeroHistoriaClinica',
                paciente.numeroHistoriaClinica,
            )
        }
    }, [open, paciente, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleSubmit = () => {
        const fieldErrors = validatePersonaFields(formValues as PacienteFormValues)
        if (Object.keys(fieldErrors).length > 0) {
            applyFieldErrors(form, fieldErrors)
            return
        }

        void form.handleSubmit()
    }

    const footer = (
        <Flex justify="flex-end" gap={8} className="paciente-drawer__footer">
            <Button onClick={handleClose} disabled={loading}>
                Cancelar
            </Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}>
                Guardar
            </Button>
        </Flex>
    )

    return (
        <Drawer
            title={title ?? (isEditing ? 'Editar paciente' : 'Nuevo paciente')}
            open={open}
            onClose={handleClose}
            width={900}
            destroyOnHidden
            className="paciente-drawer"
            footer={footer}
        >
            <div className="paciente-drawer__scroll">
                <Form
                    layout="vertical"
                    requiredMark={false}
                    className="paciente-drawer__form paciente-drawer__form--compact"
                >
                    {isEditing ? (
                        <Form.Item label="Historia clínica">
                            <Input
                                value={paciente.numeroHistoriaClinica}
                                disabled
                                readOnly
                            />
                        </Form.Item>
                    ) : null}

                    <PersonaFormFields form={form} loading={loading} variant="sections" />
                </Form>
            </div>
        </Drawer>
    )
}
