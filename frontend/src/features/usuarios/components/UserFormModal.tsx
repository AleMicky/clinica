import { useEffect, useMemo, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import {
    Form,
    Input,
    Modal,
    Radio,
    Select,
    Switch,
    Tabs,
    Typography,
} from 'antd'

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
    const [activeTab, setActiveTab] = useState('persona')
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

    const nombreCompletoPreview = useMemo(() => {
        if (modo === 'existente') {
            const persona = personasResult?.items.find(
                (item) => item.id === createValues.personaId,
            )
            return persona?.nombreCompleto ?? ''
        }

        return buildNombreCompletoPreview(createValues)
    }, [modo, createValues, personasResult?.items])

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
        setActiveTab('persona')
        setRolesError(null)
    }, [open, user, createForm, updateForm])

    useEffect(() => {
        if (isEditing || modo !== 'nueva') return

        const documento = createValues.numeroDocumento?.trim()
        if (!documento) return

        const currentUserName = createForm.getFieldValue('userName')?.trim()
        if (!currentUserName) {
            createForm.setFieldValue('userName', documento)
        }
    }, [createValues.numeroDocumento, modo, isEditing, createForm])

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

    const roleSelectOptions = roleOptions.map((role) => ({
        label: role,
        value: role,
    }))

    const personaOptions =
        personasResult?.items.map((persona) => ({
            label: `${persona.nombreCompleto} (${persona.tipoDocumentoNombre}: ${persona.numeroDocumento})`,
            value: persona.id,
        })) ?? []

    const createTabs = [
        {
            key: 'persona',
            label: 'Persona',
            children: (
                <>
                    <createForm.Field name="modo">
                        {(field) => (
                            <Form.Item label="Origen de la persona">
                                <Radio.Group
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    disabled={isSaving}
                                >
                                    <Radio value="nueva">Nueva persona</Radio>
                                    <Radio value="existente">Persona existente</Radio>
                                </Radio.Group>
                            </Form.Item>
                        )}
                    </createForm.Field>

                    {modo === 'existente' ? (
                        <createForm.Field name="personaId">
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
                                            placeholder="Buscar persona por nombre o documento"
                                            options={personaOptions}
                                            value={field.state.value || undefined}
                                            onChange={(value) => field.handleChange(value)}
                                            onBlur={field.handleBlur}
                                            disabled={isSaving || loadingPersonas}
                                        />
                                    </Form.Item>
                                )
                            }}
                        </createForm.Field>
                    ) : (
                        <PersonaFormFields form={createForm} loading={isSaving} />
                    )}

                    {nombreCompletoPreview ? (
                        <Form.Item label="Nombre completo (vista previa)">
                            <Typography.Text>{nombreCompletoPreview}</Typography.Text>
                        </Form.Item>
                    ) : null}
                </>
            ),
        },
        {
            key: 'acceso',
            label: 'Acceso al sistema',
            children: (
                <>
                    <createForm.Field name="userName">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Usuario"
                                    validateStatus={error ? 'error' : undefined}
                                    help={
                                        error ||
                                        (modo === 'nueva'
                                            ? 'Por defecto se usa el número de documento.'
                                            : undefined)
                                    }
                                >
                                    <Input
                                        placeholder="Nombre de usuario"
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
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || undefined}
                                >
                                    <Input.Password
                                        placeholder="Mínimo 8 caracteres"
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

                    <createForm.Field name="roles">
                        {(field) => {
                            const error = getFieldError(field.state.meta.errors)

                            return (
                                <Form.Item
                                    label="Roles"
                                    validateStatus={error ? 'error' : undefined}
                                    help={error || 'Seleccione uno o más roles.'}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Seleccione roles"
                                        options={roleSelectOptions}
                                        value={field.state.value}
                                        onChange={(value) => field.handleChange(value)}
                                        onBlur={field.handleBlur}
                                        disabled={isSaving}
                                    />
                                </Form.Item>
                            )
                        }}
                    </createForm.Field>
                </>
            ),
        },
    ]

    return (
        <Modal
            title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText={isEditing ? 'Guardar' : 'Crear'}
            cancelText="Cancelar"
            confirmLoading={isSaving}
            destroyOnHidden
            width={isEditing ? 520 : 760}
            className={isEditing ? undefined : 'rrhh-form-modal'}
        >
            <Form layout="vertical" requiredMark={false} size={isEditing ? 'middle' : 'small'}>
                {!isEditing ? (
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={createTabs}
                    />
                ) : (
                    <>
                        <Form.Item label="Usuario">
                            <Input value={user?.userName} disabled />
                        </Form.Item>

                        {user?.personaId ? (
                            <Form.Item label="Persona vinculada">
                                <Typography.Text>
                                    {user.personaNombreCompleto ?? user.nombreCompleto}
                                    {user.personaNumeroDocumento
                                        ? ` · ${user.personaNumeroDocumento}`
                                        : ''}
                                </Typography.Text>
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
                    </>
                )}
            </Form>
        </Modal>
    )
}
