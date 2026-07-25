import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Input, InputNumber, Modal } from 'antd'

import {
    generarCorrelativoDefaultValues,
    generarCorrelativoSchema,
    type GenerarCorrelativoFormValues,
} from '../schemas/correlativo.schema'

type GenerarCorrelativoModalProps = {
    open: boolean
    loading: boolean
    onClose: () => void
    onSubmit: (values: GenerarCorrelativoFormValues) => Promise<void>
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

export function GenerarCorrelativoModal({
    open,
    loading,
    onClose,
    onSubmit,
}: GenerarCorrelativoModalProps) {
    const form = useForm({
        defaultValues: generarCorrelativoDefaultValues,
        validators: { onSubmit: generarCorrelativoSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return
        form.reset()
        form.setFieldValue('gestion', new Date().getFullYear())
        form.setFieldValue('longitud', 6)
    }, [open, form])

    return (
        <Modal
            title="Generar correlativo"
            open={open}
            onCancel={() => {
                if (!loading) onClose()
            }}
            onOk={() => void form.handleSubmit()}
            okText="Generar"
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={480}
        >
            <Form layout="vertical" requiredMark={false}>
                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Ej. ATENCION, RECIBO, HISTORIA'}
                            >
                                <Input
                                    placeholder="ATENCION"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/\s+/g, '_'),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="gestion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Gestión"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Año del correlativo (opcional)'}
                            >
                                <InputNumber
                                    className="rrhh-catalogo__filter-search"
                                    style={{ width: '100%' }}
                                    min={2000}
                                    max={2100}
                                    value={field.state.value ?? undefined}
                                    onChange={(value) =>
                                        field.handleChange(value ?? null)
                                    }
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="prefijo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Prefijo"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Opcional, ej. AT-'}
                            >
                                <Input
                                    placeholder="AT-"
                                    value={field.state.value ?? ''}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value || null)
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="longitud">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Longitud"
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Dígitos del número (opcional)'}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    max={20}
                                    value={field.state.value ?? undefined}
                                    onChange={(value) =>
                                        field.handleChange(value ?? null)
                                    }
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Modal>
    )
}
