import { useForm } from '@tanstack/react-form'
import { Button, Form, Input } from 'antd'
import { LockOutlined } from '@ant-design/icons'

import {
    changePasswordDefaultValues,
    changePasswordSchema,
    type ChangePasswordFormValues,
} from '../schemas/change-password.schema'
import { useChangePassword } from '../hooks/auth.hooks'

function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

export function ChangePasswordForm() {
    const changePasswordMutation = useChangePassword()

    const form = useForm({
        defaultValues: changePasswordDefaultValues,

        validators: {
            onSubmit: changePasswordSchema,
        },

        onSubmit: async ({ value }) => {
            const payload: ChangePasswordFormValues = value

            await changePasswordMutation.mutateAsync(payload)
            form.reset()
        },
    })

    const loading =
        form.state.isSubmitting || changePasswordMutation.isPending

    return (
        <Form
            layout="vertical"
            requiredMark={false}
            onFinish={() => void form.handleSubmit()}
        >
            <form.Field name="currentPassword">
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Contraseña actual"
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                autoComplete="current-password"
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

            <form.Field name="newPassword">
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Nueva contraseña"
                            validateStatus={error ? 'error' : undefined}
                            help={
                                error ||
                                'Mínimo 8 caracteres, mayúscula, minúscula, dígito y carácter especial.'
                            }
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                autoComplete="new-password"
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

            <form.Field name="confirmNewPassword">
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Confirmar nueva contraseña"
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                autoComplete="new-password"
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

            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Cambiar contraseña
                </Button>
            </Form.Item>
        </Form>
    )
}
