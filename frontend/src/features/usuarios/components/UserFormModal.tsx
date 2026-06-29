import { useEffect, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { z } from 'zod'
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Descriptions,
    Drawer,
    Flex,
    Form,
    Grid,
    Input,
    Radio,
    Select,
    Steps,
    Switch,
    Tag,
    Typography,
} from 'antd'
import {
    IdcardOutlined,
    KeyOutlined,
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { personaSchema } from '../../personas/schemas/persona.schema'
import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import { usePersonasLookup } from '../../personas/hooks/personas.hooks'
import { useSyncUserRoles } from '../hooks/users.hooks'
import {
    buildNombreCompletoPreview,
    createUsuarioPersonaDefaultValues,
    createUsuarioPersonaSchema,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'
import {
    updateUserDefaultValues,
    updateUserSchema,
    type UpdateUserFormValues,
} from '../schemas/user.schema'
import type { User } from '../types/user.types'

const { Text } = Typography
const { useBreakpoint } = Grid

const CREATE_STEPS = [
    { title: 'Persona', icon: <UserOutlined /> },
    { title: 'Acceso', icon: <KeyOutlined /> },
    { title: 'Resumen', icon: <IdcardOutlined /> },
]

const accesoStepSchema = z.object({
    userName: z.string().trim().optional(),
    email: z.union([z.literal(''), z.string().trim().email('Ingrese un correo válido.')]),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    roles: z.array(z.string().trim()).min(1, 'Asigne al menos un rol.'),
})

type UserFormModalProps = {
    open: boolean
    user: User | null
    roleOptions: string[]
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateUsuarioPersonaFormValues) => Promise<void>
    onUpdate: (values: UpdateUserFormValues) => Promise<void>
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

function slugifyUserName(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '')
        .replace(/\.{2,}/g, '.')
}

function generateSuggestedUserName(values: {
    modo: 'nueva' | 'existente'
    numeroDocumento?: string
    nombres?: string
    apellidoPaterno?: string
}) {
    const documento = values.numeroDocumento?.trim()
    if (documento) return documento

    const nombres = values.nombres?.trim()
    const apellido = values.apellidoPaterno?.trim()

    if (nombres && apellido) {
        const firstName = nombres.split(/\s+/)[0] ?? nombres
        return slugifyUserName(`${apellido}.${firstName}`)
    }

    return ''
}

function generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join('')
}

function validatePersonaStep(
    values: CreateUsuarioPersonaFormValues,
): { valid: boolean; errors: string[] } {
    if (values.modo === 'existente') {
        if (!values.personaId?.trim()) {
            return { valid: false, errors: ['Seleccione una persona existente.'] }
        }
        return { valid: true, errors: [] }
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
        return { valid: true, errors: [] }
    }

    return {
        valid: false,
        errors: result.error.issues.map((issue) => issue.message),
    }
}

function validateAccesoStep(values: CreateUsuarioPersonaFormValues): {
    valid: boolean
    errors: string[]
} {
    const result = accesoStepSchema.safeParse({
        userName: values.userName,
        email: values.email,
        password: values.password,
        roles: values.roles,
    })

    if (!result.success) {
        return {
            valid: false,
            errors: result.error.issues.map((issue) => issue.message),
        }
    }

    const hasUserName =
        Boolean(values.userName?.trim()) ||
        (values.modo === 'nueva' && Boolean(values.numeroDocumento?.trim()))

    if (!hasUserName) {
        return {
            valid: false,
            errors: ['El nombre de usuario es obligatorio.'],
        }
    }

    return { valid: true, errors: [] }
}

export function UserFormModal({
    open,
    user,
    roleOptions,
    loading,
    onClose,
    onCreate,
    onUpdate,
}: UserFormModalProps) {
    const isEditing = user !== null
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 720 : '95%'

    const [currentStep, setCurrentStep] = useState(0)
    const [stepErrors, setStepErrors] = useState<string[]>([])
    const [userNameManuallyEdited, setUserNameManuallyEdited] = useState(false)
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [rolesError, setRolesError] = useState<string | null>(null)

    const syncUserRoles = useSyncUserRoles()
    const { data: personasResult, isFetching: loadingPersonas } = usePersonasLookup()

    const createForm = useForm({
        defaultValues: createUsuarioPersonaDefaultValues,
        validators: {
            onSubmit: createUsuarioPersonaSchema,
        },
        onSubmit: async ({ value }) => {
            await onCreate(value)
        },
    })

    const updateForm = useForm({
        defaultValues: updateUserDefaultValues,
        validators: {
            onSubmit: updateUserSchema,
        },
        onSubmit: async ({ value }) => {
            if (!user) return

            if (selectedRoles.length === 0) {
                setRolesError('Asigne al menos un rol.')
                return
            }

            setRolesError(null)

            const rolesChanged =
                selectedRoles.length !== user.roles.length ||
                selectedRoles.some((role) => !user.roles.includes(role))

            if (rolesChanged) {
                await syncUserRoles.mutateAsync({
                    userId: user.id,
                    currentRoles: user.roles,
                    nextRoles: selectedRoles,
                })
            }

            await onUpdate(value)
        },
    })

    const createValues = useStore(createForm.store, (state) => state.values)
    const modo = createValues.modo

    const selectedPersona = useMemo(() => {
        if (modo !== 'existente' || !createValues.personaId) return null
        return personasResult?.items.find((item) => item.id === createValues.personaId) ?? null
    }, [modo, createValues.personaId, personasResult?.items])

    const nombreCompletoPreview = useMemo(() => {
        if (modo === 'existente') {
            return selectedPersona?.nombreCompleto ?? ''
        }

        return buildNombreCompletoPreview(createValues)
    }, [modo, createValues, selectedPersona])

    const documentoPreview = useMemo(() => {
        if (modo === 'existente' && selectedPersona) {
            return `${selectedPersona.tipoDocumentoNombre}: ${selectedPersona.numeroDocumento}`
        }

        const parts = [createValues.numeroDocumento?.trim()].filter(Boolean)
        return parts.join(' ') || '—'
    }, [modo, selectedPersona, createValues.numeroDocumento])

    useEffect(() => {
        if (!open) return

        if (user) {
            updateForm.reset()
            updateForm.setFieldValue('nombreCompleto', user.nombreCompleto)
            updateForm.setFieldValue('activo', user.activo)
            setSelectedRoles(user.roles)
            setRolesError(null)
            return
        }

        createForm.reset()
        setCurrentStep(0)
        setStepErrors([])
        setUserNameManuallyEdited(false)
        setRolesError(null)
    }, [open, user, createForm, updateForm])

    useEffect(() => {
        if (isEditing || userNameManuallyEdited) return

        const suggested = generateSuggestedUserName({
            modo,
            numeroDocumento: createValues.numeroDocumento,
            nombres: createValues.nombres,
            apellidoPaterno: createValues.apellidoPaterno,
        })

        if (suggested) {
            createForm.setFieldValue('userName', suggested)
        }
    }, [
        createValues.numeroDocumento,
        createValues.nombres,
        createValues.apellidoPaterno,
        modo,
        isEditing,
        userNameManuallyEdited,
        createForm,
    ])

    const isSaving = loading || syncUserRoles.isPending

    const handleClose = () => {
        if (isSaving) return
        onClose()
    }

    const handleSubmit = () => {
        if (isEditing) {
            void updateForm.handleSubmit()
            return
        }

        void createForm.handleSubmit()
    }

    const handleNextStep = () => {
        if (currentStep === 0) {
            const result = validatePersonaStep(createValues)
            if (!result.valid) {
                setStepErrors(result.errors)
                return
            }
        }

        if (currentStep === 1) {
            const result = validateAccesoStep(createValues)
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

    const roleSelectOptions = roleOptions.map((role) => ({
        label: role,
        value: role,
    }))

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const createStepContent = (
        <>
            {stepErrors.length > 0 ? (
                <Alert
                    type="error"
                    showIcon
                    className="usuario-drawer__step-alert"
                    message="Complete los campos obligatorios"
                    description={
                        <ul className="usuario-drawer__step-errors">
                            {stepErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    }
                />
            ) : null}

            {currentStep === 0 ? (
                <div className="usuario-drawer__step">
                    <createForm.Field name="modo">
                        {(field) => (
                            <Form.Item label="Origen de la persona" required>
                                <Radio.Group
                                    value={field.state.value}
                                    onChange={(event) => {
                                        field.handleChange(event.target.value)
                                        setStepErrors([])
                                    }}
                                    disabled={isSaving}
                                    className="usuario-drawer__radio-group"
                                >
                                    <Radio.Button value="nueva">Nueva persona</Radio.Button>
                                    <Radio.Button value="existente">Persona existente</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        )}
                    </createForm.Field>

                    {modo === 'existente' ? (
                        <>
                            <createForm.Field name="personaId">
                                {(field) => {
                                    const error = getFieldError(field.state.meta.errors)

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
                                                placeholder="Seleccionar persona existente"
                                                options={personaOptions}
                                                value={field.state.value || undefined}
                                                onChange={(value) => {
                                                    field.handleChange(value)
                                                    setStepErrors([])
                                                }}
                                                onBlur={field.handleBlur}
                                                disabled={isSaving || loadingPersonas}
                                            />
                                        </Form.Item>
                                    )
                                }}
                            </createForm.Field>

                            {selectedPersona ? (
                                <Card size="small" className="usuario-drawer__persona-card">
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
                        <PersonaFormFields
                            form={createForm}
                            loading={isSaving}
                            variant="sections"
                        />
                    )}
                </div>
            ) : null}

            {currentStep === 1 ? (
                <div className="usuario-drawer__step">
                    <createForm.Field name="userName">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Usuario"
                                    required
                                    validateStatus={error ? 'error' : undefined}
                                    help={
                                        error ||
                                        'Se genera automáticamente; puede editarlo manualmente.'
                                    }
                                >
                                    <Input
                                        placeholder="Nombre de usuario"
                                        value={field.state.value}
                                        onChange={(event) => {
                                            setUserNameManuallyEdited(true)
                                            field.handleChange(event.target.value)
                                            setStepErrors([])
                                        }}
                                        onBlur={field.handleBlur}
                                        disabled={isSaving}
                                        suffix={
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<ReloadOutlined />}
                                                aria-label="Regenerar usuario"
                                                onClick={() => {
                                                    setUserNameManuallyEdited(false)
                                                    const suggested = generateSuggestedUserName({
                                                        modo,
                                                        numeroDocumento: createValues.numeroDocumento,
                                                        nombres: createValues.nombres,
                                                        apellidoPaterno: createValues.apellidoPaterno,
                                                    })
                                                    if (suggested) {
                                                        field.handleChange(suggested)
                                                    }
                                                }}
                                            />
                                        }
                                    />
                                </Form.Item>
                            )
                        }}
                    </createForm.Field>

                    <createForm.Field name="email">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Correo electrónico"
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || 'Opcional'}
                                >
                                    <Input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(event.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                        disabled={isSaving}
                                    />
                                </Form.Item>
                            )
                        }}
                    </createForm.Field>

                    <createForm.Field name="password">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Contraseña"
                                    required
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || 'Mínimo 8 caracteres.'}
                                >
                                    <Flex gap={8}>
                                        <Input.Password
                                            placeholder="Mínimo 8 caracteres"
                                            value={field.state.value}
                                            onChange={(event) => {
                                                field.handleChange(event.target.value)
                                                setStepErrors([])
                                            }}
                                            onBlur={field.handleBlur}
                                            disabled={isSaving}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            onClick={() => {
                                                field.handleChange(generatePassword())
                                                setStepErrors([])
                                            }}
                                            disabled={isSaving}
                                        >
                                            Generar
                                        </Button>
                                    </Flex>
                                </Form.Item>
                            )
                        }}
                    </createForm.Field>

                    <createForm.Field name="roles">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Roles"
                                    required
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || 'Seleccione uno o más roles.'}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Seleccione roles"
                                        options={roleSelectOptions}
                                        value={field.state.value}
                                        onChange={(value) => {
                                            field.handleChange(value)
                                            setStepErrors([])
                                        }}
                                        onBlur={field.handleBlur}
                                        disabled={isSaving}
                                    />
                                </Form.Item>
                            )
                        }}
                    </createForm.Field>

                    <Form.Item>
                        <Checkbox disabled>
                            Enviar credenciales por correo (próximamente)
                        </Checkbox>
                    </Form.Item>
                </div>
            ) : null}

            {currentStep === 2 ? (
                <Card className="usuario-drawer__summary-card" size="small">
                    <Descriptions
                        size="small"
                        column={1}
                        bordered
                        className="usuario-drawer__summary"
                    >
                        <Descriptions.Item label="Persona">
                            {nombreCompletoPreview || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Documento">
                            {documentoPreview}
                        </Descriptions.Item>
                        <Descriptions.Item label="Teléfono">
                            {modo === 'existente'
                                ? '—'
                                : createValues.telefono?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Usuario">
                            {createValues.userName?.trim() ||
                                createValues.numeroDocumento?.trim() ||
                                '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Correo">
                            {createValues.email?.trim() || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Roles">
                            {createValues.roles.length > 0 ? (
                                <Flex gap={4} wrap="wrap">
                                    {createValues.roles.map((role) => (
                                        <Tag key={role} className="seguridad-role-tag">
                                            {role}
                                        </Tag>
                                    ))}
                                </Flex>
                            ) : (
                                '—'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            <Tag className="seguridad-status-tag seguridad-status-tag--active">
                                Activo
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            ) : null}
        </>
    )

    const editFormContent = (
        <Form layout="vertical" className="usuario-drawer__form" requiredMark="optional">
            <Form.Item label="Usuario">
                <Input value={user?.userName} disabled />
            </Form.Item>

            {user?.personaId ? (
                <Form.Item label="Persona vinculada">
                    <Text>
                        {user.personaNombreCompleto ?? user.nombreCompleto}
                        {user.personaNumeroDocumento ? ` · ${user.personaNumeroDocumento}` : ''}
                    </Text>
                </Form.Item>
            ) : null}

            <Form.Item
                label="Roles"
                validateStatus={rolesError ? 'error' : undefined}
                help={rolesError || 'Seleccione uno o más roles.'}
                required
            >
                <Select
                    mode="multiple"
                    placeholder="Seleccione roles"
                    options={roleSelectOptions}
                    value={selectedRoles}
                    onChange={(value) => {
                        setSelectedRoles(value)
                        if (value.length > 0) {
                            setRolesError(null)
                        }
                    }}
                    disabled={isSaving}
                />
            </Form.Item>

            <updateForm.Field name="nombreCompleto">
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Nombre completo"
                            required
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input
                                placeholder="Nombre y apellidos"
                                value={field.state.value}
                                onChange={(event) =>
                                    field.handleChange(event.target.value)
                                }
                                onBlur={field.handleBlur}
                                disabled={isSaving || Boolean(user?.personaId)}
                            />
                        </Form.Item>
                    )
                }}
            </updateForm.Field>

            <updateForm.Field name="activo">
                {(field) => (
                    <Form.Item label="Estado">
                        <Switch
                            checked={field.state.value}
                            onChange={(checked) => field.handleChange(checked)}
                            checkedChildren="Activo"
                            unCheckedChildren="Inactivo"
                            disabled={isSaving}
                        />
                    </Form.Item>
                )}
            </updateForm.Field>
        </Form>
    )

    const createFooter = (
        <Flex justify="space-between" align="center" className="usuario-drawer__footer">
            <div>
                {currentStep > 0 ? (
                    <Button onClick={handlePrevStep} disabled={isSaving}>
                        Anterior
                    </Button>
                ) : null}
            </div>
            <Flex gap={8}>
                <Button onClick={handleClose} disabled={isSaving}>
                    Cancelar
                </Button>
                {currentStep < CREATE_STEPS.length - 1 ? (
                    <Button type="primary" onClick={handleNextStep} disabled={isSaving}>
                        Siguiente
                    </Button>
                ) : (
                    <Button type="primary" loading={isSaving} onClick={handleSubmit}>
                        Crear
                    </Button>
                )}
            </Flex>
        </Flex>
    )

    const editFooter = (
        <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
            <Button onClick={handleClose} disabled={isSaving}>
                Cancelar
            </Button>
            <Button type="primary" loading={isSaving} onClick={handleSubmit}>
                Guardar
            </Button>
        </Flex>
    )

    return (
        <Drawer
            title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={isEditing ? editFooter : createFooter}
        >
            {!isEditing ? (
                <>
                    <Steps
                        current={currentStep}
                        items={CREATE_STEPS}
                        size="small"
                        className="usuario-drawer__steps"
                    />
                    <Form
                        layout="vertical"
                        className="usuario-drawer__form usuario-drawer__form--compact"
                        requiredMark="optional"
                        size="small"
                    >
                        {createStepContent}
                    </Form>
                </>
            ) : (
                editFormContent
            )}
        </Drawer>
    )
}
