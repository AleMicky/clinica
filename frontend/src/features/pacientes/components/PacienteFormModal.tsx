import { useEffect, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Alert,
    Button,
    Card,
    Descriptions,
    Drawer,
    Flex,
    Form,
    Input,
    Radio,
    Select,
} from 'antd'

import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import { personaSchema } from '../../personas/schemas/persona.schema'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import {
    pacienteCreateSchema,
    pacienteDefaultValues,
    pacienteUpdateSchema,
    type PacienteFormValues,
    type PacienteUpdateFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'

type PacienteFormModalProps = {
    open: boolean
    paciente: Paciente | null
    loading: boolean
    initialModo?: 'nueva' | 'existente'
    initialPersonaId?: string
    lockPersona?: boolean
    title?: string
    onClose: () => void
    onSubmit: (values: PacienteFormValues | PacienteUpdateFormValues) => Promise<void>
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

function validatePersonaStep(
    values: PacienteFormValues,
): { valid: boolean; errors: string[]; fieldErrors: Record<string, string> } {
    if (values.modo === 'existente') {
        if (!values.personaId?.trim()) {
            return {
                valid: false,
                errors: ['Seleccione una persona existente.'],
                fieldErrors: { personaId: 'Seleccione una persona existente.' },
            }
        }
        return { valid: true, errors: [], fieldErrors: {} }
    }

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

    if (result.success) {
        return { valid: true, errors: [], fieldErrors: {} }
    }

    const fieldErrors: Record<string, string> = {}
    const errors: string[] = []

    for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? '')
        if (field && !fieldErrors[field]) {
            fieldErrors[field] = issue.message
        }
        if (!errors.includes(issue.message)) {
            errors.push(issue.message)
        }
    }

    return { valid: false, errors, fieldErrors }
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

export function PacienteFormModal({
    open,
    paciente,
    loading,
    initialModo = 'nueva',
    initialPersonaId,
    lockPersona = false,
    title,
    onClose,
    onSubmit,
}: PacienteFormModalProps) {
    const isEditing = paciente !== null
    const [formErrors, setFormErrors] = useState<string[]>([])

    const { data: personasResult, isFetching: loadingPersonas } = usePersonasLookup()

    const form = useForm({
        defaultValues: pacienteDefaultValues,
        validators: {
            onSubmit: ({ value }) => {
                const schema = isEditing ? pacienteUpdateSchema : pacienteCreateSchema
                const result = schema.safeParse(value)

                if (result.success) return

                return result.error.issues.map((issue) => issue.message).join(', ')
            },
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value as PacienteFormValues | PacienteUpdateFormValues)
        },
    })

    const modo = useStore(form.store, (state) => state.values.modo)
    const formValues = useStore(form.store, (state) => state.values)

    useEffect(() => {
        if (!open) return

        form.reset()
        setFormErrors([])

        if (paciente) {
            form.setFieldValue('personaId', paciente.personaId)
            form.setFieldValue('numeroHistoriaClinica', paciente.numeroHistoriaClinica)
        } else {
            form.setFieldValue('modo', initialModo)
            if (initialPersonaId) {
                form.setFieldValue('personaId', initialPersonaId)
                form.setFieldValue('modo', 'existente')
            }
        }
    }, [open, paciente, initialPersonaId, initialModo, form])

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const selectedPersona = useMemo(() => {
        if (modo !== 'existente' || !formValues.personaId) return null
        return personasResult?.items.find((item) => item.id === formValues.personaId) ?? null
    }, [modo, formValues.personaId, personasResult?.items])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleSubmit = () => {
        if (!isEditing) {
            const result = validatePersonaStep(formValues as PacienteFormValues)
            if (!result.valid) {
                setFormErrors(result.errors)
                applyFieldErrors(form, result.fieldErrors)
                return
            }
            setFormErrors([])
        }

        void form.handleSubmit()
    }

    const formErrorsAlert =
        formErrors.length > 0 ? (
            <Alert
                type="error"
                showIcon
                className="paciente-drawer__step-alert"
                message="Complete los campos obligatorios"
                description={
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {formErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                }
            />
        ) : null

    const createFormContent = (
        <>
            <form.Field name="modo">
                {(field) => (
                    <Form.Item label="Origen de la persona" required>
                        <Radio.Group
                            value={field.state.value}
                            onChange={(event) => {
                                field.handleChange(event.target.value)
                                setFormErrors([])
                            }}
                            disabled={loading || lockPersona}
                            className="paciente-drawer__radio-group"
                        >
                            <Radio.Button value="nueva">Registrar nueva persona</Radio.Button>
                            <Radio.Button value="existente">Persona existente</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                )}
            </form.Field>

            {modo === 'existente' ? (
                <>
                    <form.Field name="personaId">
                        {(field) => {
                            const error =
                                getFieldError(field.state.meta.errors) ||
                                (formErrors.length > 0 && !field.state.value
                                    ? 'Seleccione una persona existente.'
                                    : '')

                            return (
                                <Form.Item
                                    label="Buscar persona"
                                    required
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || 'Busque por nombre o documento.'}
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="label"
                                        placeholder="Seleccionar persona"
                                        options={personaOptions}
                                        value={field.state.value || undefined}
                                        onChange={(value) => {
                                            field.handleChange(value)
                                            setFormErrors([])
                                        }}
                                        onBlur={field.handleBlur}
                                        disabled={loading || loadingPersonas || lockPersona}
                                    />
                                </Form.Item>
                            )
                        }}
                    </form.Field>

                    {selectedPersona ? (
                        <Card size="small" className="paciente-drawer__persona-card">
                            <Descriptions size="small" column={1}>
                                <Descriptions.Item label="Nombre">
                                    {selectedPersona.nombreCompleto}
                                </Descriptions.Item>
                                <Descriptions.Item label="Documento">
                                    {selectedPersona.tipoDocumentoNombre}:{' '}
                                    {selectedPersona.numeroDocumento}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    ) : null}
                </>
            ) : (
                <PersonaFormFields form={form} loading={loading} variant="sections" />
            )}
        </>
    )

    const editFormContent = (
        <>
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
                                disabled={loading || loadingPersonas || isEditing}
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
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                disabled={loading}
                            />
                        </Form.Item>
                    )
                }}
            </form.Field>
        </>
    )

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
                    {!isEditing ? formErrorsAlert : null}
                    {isEditing ? editFormContent : createFormContent}
                </Form>
            </div>
        </Drawer>
    )
}
