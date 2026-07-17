import { Form, Input, Select, Switch, Typography } from 'antd'

import type { FormFieldApi } from '../types/form-field.types'
import type { User } from '../types/user.types'
import { getFieldError } from '../utils/form-errors'

const { Text } = Typography

type UserEditFieldsProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    user: User
    roleOptions: string[]
    selectedRoles: string[]
    rolesError: string | null
    loading: boolean
    onRolesChange: (roles: string[]) => void
}

export function UserEditFields({
    form,
    user,
    roleOptions,
    selectedRoles,
    rolesError,
    loading,
    onRolesChange,
}: UserEditFieldsProps) {
    const roleSelectOptions = roleOptions.map((role) => ({
        label: role,
        value: role,
    }))

    return (
        <Form layout="vertical" className="usuario-drawer__form">
            <Form.Item label="Usuario">
                <Input value={user.userName} disabled />
            </Form.Item>

            {user.personaId ? (
                <Form.Item label="Persona vinculada">
                    <Text>
                        {user.personaNombreCompleto ?? user.nombreCompleto}
                        {user.personaNumeroDocumento
                            ? ` · ${user.personaNumeroDocumento}`
                            : ''}
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
                    onChange={onRolesChange}
                    disabled={loading}
                />
            </Form.Item>

            <form.Field name="nombreCompleto">
                {(field: FormFieldApi<string>) => {
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
                                disabled={loading || Boolean(user.personaId)}
                            />
                        </Form.Item>
                    )
                }}
            </form.Field>

            <form.Field name="activo">
                {(field: FormFieldApi<boolean>) => (
                    <Form.Item label="Estado">
                        <Switch
                            checked={field.state.value}
                            onChange={(checked) => field.handleChange(checked)}
                            checkedChildren="Activo"
                            unCheckedChildren="Inactivo"
                            disabled={loading}
                        />
                    </Form.Item>
                )}
            </form.Field>
        </Form>
    )
}
