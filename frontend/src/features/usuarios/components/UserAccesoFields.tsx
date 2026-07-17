import { Button, Flex, Form, Input, Select } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

import type { FormFieldApi } from '../types/form-field.types'
import { getFieldError } from '../utils/form-errors'
import {
    generatePassword,
    generateSuggestedUserName,
} from '../utils/user-credentials'

type UserAccesoFieldsProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any
    loading?: boolean
    roleOptions: string[]
    personaHint: {
        numeroDocumento?: string
        nombres?: string
        apellidoPaterno?: string
    }
    onUserNameManualEdit: () => void
    onUserNameRegenerate: () => void
}

export function UserAccesoFields({
    form,
    loading = false,
    roleOptions,
    personaHint,
    onUserNameManualEdit,
    onUserNameRegenerate,
}: UserAccesoFieldsProps) {
    const roleSelectOptions = roleOptions.map((role) => ({
        label: role,
        value: role,
    }))

    return (
        <div className="usuario-drawer__step">
            <form.Field name="userName">
                {(field: FormFieldApi<string>) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Usuario"
                            required
                            validateStatus={error ? 'error' : undefined}
                            help={
                                error ||
                                'Debe ser único. Se genera automáticamente; puede editarlo.'
                            }
                        >
                            <Input
                                placeholder="Nombre de usuario"
                                value={field.state.value}
                                onChange={(event) => {
                                    onUserNameManualEdit()
                                    field.handleChange(event.target.value)
                                }}
                                onBlur={field.handleBlur}
                                disabled={loading}
                                suffix={
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ReloadOutlined />}
                                        aria-label="Regenerar usuario"
                                        onClick={() => {
                                            onUserNameRegenerate()
                                            const suggested =
                                                generateSuggestedUserName(personaHint)
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
            </form.Field>

            <form.Field name="email">
                {(field: FormFieldApi<string>) => {
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
                                disabled={loading}
                            />
                        </Form.Item>
                    )
                }}
            </form.Field>

            <form.Field name="password">
                {(field: FormFieldApi<string>) => {
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
                                    }}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    onClick={() => {
                                        field.handleChange(generatePassword())
                                    }}
                                    disabled={loading}
                                >
                                    Generar
                                </Button>
                            </Flex>
                        </Form.Item>
                    )
                }}
            </form.Field>

            <form.Field name="roles">
                {(field: FormFieldApi<string[]>) => {
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
                                }}
                                onBlur={field.handleBlur}
                                disabled={loading}
                            />
                        </Form.Item>
                    )
                }}
            </form.Field>
        </div>
    )
}
