import { useEffect, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    CheckCircleOutlined,
    FileTextOutlined,
    UserOutlined,
} from '@ant-design/icons'
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
    Steps,
    Typography,
} from 'antd'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import { personaSchema } from '../../personas/schemas/persona.schema'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import { personasService } from '../../personas/services/personas.service'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import {
    buildNumeroHistoriaClinicaPreview,
    pacienteCreateSchema,
    pacienteDefaultValues,
    pacienteUpdateSchema,
    type PacienteFormValues,
    type PacienteUpdateFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'

const { Text } = Typography

const CREATE_STEPS = [
    { title: 'Persona', icon: <UserOutlined /> },
    { title: 'Historia Clínica', icon: <FileTextOutlined /> },
    { title: 'Confirmación', icon: <CheckCircleOutlined /> },
]

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

function buildNombreCompletoPreview(values: {
    nombres?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
}) {
    return [values.nombres, values.apellidoPaterno, values.apellidoMaterno]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(' ')
}

function calcularEdad(fechaNacimiento?: string) {
    if (!fechaNacimiento?.trim()) return '—'

    const birth = new Date(fechaNacimiento)
    if (Number.isNaN(birth.getTime())) return '—'

    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1
    }

    return `${age} años`
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

function validateHistoriaClinicaStep(
    values: PacienteFormValues,
): { valid: boolean; errors: string[] } {
    const result = pacienteCreateSchema.safeParse(values)

    if (result.success) {
        return { valid: true, errors: [] }
    }

    const clinicalPaths = new Set([
        'alergias',
        'observaciones',
        'grupoSanguineoId',
        'numeroHistoriaClinica',
    ])

    const errors = result.error.issues
        .filter((issue) => issue.path.some((segment) => clinicalPaths.has(String(segment))))
        .map((issue) => issue.message)

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : [],
    }
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
    const [currentStep, setCurrentStep] = useState(0)
    const [stepErrors, setStepErrors] = useState<string[]>([])

    const { data: catalogos, isFetching: loadingCatalogos } = useCatalogoGruposGrouped()
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

    const { data: personaDetalle } = useAppQuery({
        queryKey: queryKeys.personas.detail(formValues.personaId ?? ''),
        queryFn: () => personasService.getById(formValues.personaId!),
        enabled:
            open &&
            !isEditing &&
            modo === 'existente' &&
            Boolean(formValues.personaId?.trim()),
    })

    useEffect(() => {
        if (!open) return

        form.reset()
        setCurrentStep(0)
        setStepErrors([])

        if (paciente) {
            form.setFieldValue('personaId', paciente.personaId)
            form.setFieldValue('numeroHistoriaClinica', paciente.numeroHistoriaClinica)
            form.setFieldValue('grupoSanguineoId', paciente.grupoSanguineoId ?? '')
            form.setFieldValue('alergias', paciente.alergias ?? '')
            form.setFieldValue('observaciones', paciente.observaciones ?? '')
        } else {
            form.setFieldValue('modo', initialModo)
            if (initialPersonaId) {
                form.setFieldValue('personaId', initialPersonaId)
                form.setFieldValue('modo', 'existente')
            }
        }
    }, [open, paciente, initialPersonaId, initialModo, form])

    const grupoSanguineoOptions =
        catalogos
            ?.find((grupo) => grupo.codigo === 'GRUPO_SANGUINEO')
            ?.items.map((item) => ({
                label: item.nombre,
                value: item.id,
            })) ?? []

    const sexoOptions =
        catalogos
            ?.find((grupo) => grupo.codigo === 'SEXO')
            ?.items.map((item) => ({ label: item.nombre, value: item.id })) ?? []

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const selectedPersona = useMemo(() => {
        if (modo !== 'existente' || !formValues.personaId) return null
        return personasResult?.items.find((item) => item.id === formValues.personaId) ?? null
    }, [modo, formValues.personaId, personasResult?.items])

    const nombreCompletoPreview = useMemo(() => {
        if (modo === 'existente') {
            return personaDetalle?.nombreCompleto ?? selectedPersona?.nombreCompleto ?? ''
        }
        return buildNombreCompletoPreview(formValues)
    }, [modo, formValues, selectedPersona, personaDetalle])

    const documentoPreview = useMemo(() => {
        if (modo === 'existente') {
            if (personaDetalle) {
                return `${personaDetalle.tipoDocumentoNombre}: ${personaDetalle.numeroDocumento}`
            }
            if (selectedPersona) {
                return `${selectedPersona.tipoDocumentoNombre}: ${selectedPersona.numeroDocumento}`
            }
            return '—'
        }
        return formValues.numeroDocumento?.trim() || '—'
    }, [modo, selectedPersona, personaDetalle, formValues.numeroDocumento])

    const historiaClinicaPreview = useMemo(() => {
        if (isEditing) return formValues.numeroHistoriaClinica

        if (modo === 'nueva') {
            return (
                buildNumeroHistoriaClinicaPreview({
                    nombres: formValues.nombres,
                    apellidoPaterno: formValues.apellidoPaterno,
                    apellidoMaterno: formValues.apellidoMaterno,
                    numeroDocumento: formValues.numeroDocumento,
                }) || ''
            )
        }

        if (formValues.personaId) {
            return 'Se generará automáticamente'
        }

        return ''
    }, [formValues, isEditing, modo])

    const edadPreview = useMemo(() => {
        if (modo === 'existente') {
            return calcularEdad(personaDetalle?.fechaNacimiento)
        }
        return calcularEdad(formValues.fechaNacimiento)
    }, [modo, formValues.fechaNacimiento, personaDetalle?.fechaNacimiento])

    const sexoPreview = useMemo(() => {
        if (modo === 'existente') {
            return personaDetalle?.sexoNombre ?? '—'
        }
        return (
            sexoOptions.find((item) => item.value === formValues.sexoId)?.label ?? '—'
        )
    }, [modo, formValues.sexoId, personaDetalle?.sexoNombre, sexoOptions])

    const telefonoPreview = useMemo(() => {
        if (modo === 'existente') {
            return personaDetalle?.telefono?.trim() || '—'
        }
        return formValues.telefono?.trim() || '—'
    }, [modo, formValues.telefono, personaDetalle?.telefono])

    const grupoSanguineoNombre = useMemo(() => {
        if (!formValues.grupoSanguineoId) return '—'
        return (
            grupoSanguineoOptions.find((item) => item.value === formValues.grupoSanguineoId)
                ?.label ?? '—'
        )
    }, [formValues.grupoSanguineoId, grupoSanguineoOptions])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const handleSubmit = () => {
        void form.handleSubmit()
    }

    const handleNextStep = () => {
        if (currentStep === 0) {
            const result = validatePersonaStep(formValues as PacienteFormValues)
            if (!result.valid) {
                setStepErrors(result.errors)
                applyFieldErrors(form, result.fieldErrors)
                return
            }
        }

        if (currentStep === 1) {
            const result = validateHistoriaClinicaStep(formValues as PacienteFormValues)
            if (!result.valid) {
                setStepErrors(result.errors)
                return
            }
        }

        setStepErrors([])
        setCurrentStep((prev) => Math.min(prev + 1, CREATE_STEPS.length - 1))
    }

    const handlePrevStep = () => {
        setStepErrors([])
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const stepErrorsAlert =
        stepErrors.length > 0 ? (
            <Alert
                type="error"
                showIcon
                className="paciente-drawer__step-alert"
                message="Complete los campos obligatorios"
                description={
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {stepErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                }
            />
        ) : null

    const personaStepContent = (
        <>
            <form.Field name="modo">
                {(field) => (
                    <Form.Item label="Origen de la persona" required>
                        <Radio.Group
                            value={field.state.value}
                            onChange={(event) => {
                                field.handleChange(event.target.value)
                                setStepErrors([])
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
                                (stepErrors.length > 0 && !field.state.value
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
                                            setStepErrors([])
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

    const historiaClinicaStepContent = (
        <>
            <Form.Item label="Número de historia clínica">
                <div className="paciente-drawer__hc-preview">
                    <Text className="paciente-drawer__hc-preview-value">
                        {historiaClinicaPreview || '—'}
                    </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                    {historiaClinicaPreview && historiaClinicaPreview !== 'Se generará automáticamente'
                        ? 'Vista previa del número que se asignará al guardar.'
                        : 'Se generará automáticamente.'}
                </Text>
            </Form.Item>

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
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Alergias"
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input.TextArea
                                rows={2}
                                placeholder="Alergias conocidas"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                disabled={loading}
                            />
                        </Form.Item>
                    )
                }}
            </form.Field>

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
                                placeholder="Notas adicionales"
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

    const confirmStepContent = (
        <Card className="paciente-drawer__summary-card" size="small">
            <Descriptions
                bordered
                size="small"
                column={1}
                className="paciente-drawer__summary"
            >
                <Descriptions.Item label="Persona">
                    {nombreCompletoPreview || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Documento">{documentoPreview}</Descriptions.Item>
                <Descriptions.Item label="Edad">{edadPreview}</Descriptions.Item>
                <Descriptions.Item label="Sexo">{sexoPreview}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">{telefonoPreview}</Descriptions.Item>
                <Descriptions.Item label="Historia clínica">
                    {historiaClinicaPreview || 'Se generará al guardar'}
                </Descriptions.Item>
                <Descriptions.Item label="Grupo sanguíneo">
                    {grupoSanguineoNombre}
                </Descriptions.Item>
                <Descriptions.Item label="Alergias">
                    {formValues.alergias?.trim() || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Observaciones">
                    {formValues.observaciones?.trim() || '—'}
                </Descriptions.Item>
            </Descriptions>
        </Card>
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
                            onChange={(event) => field.handleChange(event.target.value)}
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
                            onChange={(event) => field.handleChange(event.target.value)}
                            onBlur={field.handleBlur}
                            disabled={loading}
                        />
                    </Form.Item>
                )}
            </form.Field>
        </>
    )

    const createFooter = (
        <Flex justify="space-between" align="center" className="paciente-drawer__footer">
            <div>
                {currentStep > 0 ? (
                    <Button onClick={handlePrevStep} disabled={loading}>
                        Anterior
                    </Button>
                ) : null}
            </div>
            <Flex gap={8}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                {currentStep < CREATE_STEPS.length - 1 ? (
                    <Button type="primary" onClick={handleNextStep} disabled={loading}>
                        Siguiente
                    </Button>
                ) : (
                    <Button type="primary" loading={loading} onClick={handleSubmit}>
                        Guardar
                    </Button>
                )}
            </Flex>
        </Flex>
    )

    const editFooter = (
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
            footer={isEditing ? editFooter : createFooter}
        >
            {!isEditing ? (
                <div className="paciente-drawer__inner">
                    <div className="paciente-drawer__steps-wrap">
                        <Steps
                            current={currentStep}
                            items={CREATE_STEPS}
                            size="small"
                            className="paciente-drawer__steps"
                        />
                    </div>
                    <div className="paciente-drawer__scroll">
                        <Form
                            layout="vertical"
                            requiredMark={false}
                            className="paciente-drawer__form paciente-drawer__form--compact"
                        >
                            {stepErrorsAlert}
                            {currentStep === 0 ? personaStepContent : null}
                            {currentStep === 1 ? historiaClinicaStepContent : null}
                            {currentStep === 2 ? confirmStepContent : null}
                        </Form>
                    </div>
                </div>
            ) : (
                <div className="paciente-drawer__scroll">
                    <Form
                        layout="vertical"
                        requiredMark={false}
                        className="paciente-drawer__form paciente-drawer__form--compact"
                    >
                        {editFormContent}
                    </Form>
                </div>
            )}
        </Drawer>
    )
}
