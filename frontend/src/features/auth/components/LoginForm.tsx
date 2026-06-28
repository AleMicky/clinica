import { useForm } from '@tanstack/react-form'
import { Button, Form, Input } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

import {
    loginDefaultValues,
    loginSchema,
    type LoginFormValues,
} from '../schemas/login.schema'

import { useLogin } from '../hooks/auth.hooks'

function getFieldError(errors: unknown[]) {
    return errors
        .map((error) =>
            typeof error === 'string'
                ? error
                : (error as { message: string }).message,
        )
        .join(', ')
}

export function LoginForm() {
    const loginMutation = useLogin()

    const form = useForm({
        defaultValues: loginDefaultValues,

        validators: {
            onSubmit: loginSchema,
        },

        onSubmit: async ({ value }) => {
            const credentials: LoginFormValues = value

            await loginMutation.mutateAsync(credentials)
        },
    })

    const loading = form.state.isSubmitting || loginMutation.isPending

    return (
        <Form
            layout="vertical"
            requiredMark={false}
            onFinish={() => void form.handleSubmit()}
        >
            <form.Field name="userName">
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Usuario"
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="admin"
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
                {(field) => {
                    const error = getFieldError(field.state.meta.errors)

                    return (
                        <Form.Item
                            label="Contraseña"
                            validateStatus={error ? 'error' : undefined}
                            help={error || undefined}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Contraseña"
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

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                >
                    Ingresar
                </Button>
            </Form.Item>
        </Form>
    )
}