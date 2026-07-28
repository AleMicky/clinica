import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, DatePicker, Drawer, Flex, Form, Grid, Input, Typography } from 'antd'
import dayjs from 'dayjs'

import { getFieldError } from '../../../../shared/utils/form-errors'
import {
    periodoSchema,
    type PeriodoFormValues,
} from '../schemas/gestiones.schema'
import type { Periodo } from '../types/gestiones.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type PeriodoFormDrawerProps = {
    open: boolean
    entity: Periodo | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: PeriodoFormValues) => Promise<void>
}

export function PeriodoFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: PeriodoFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'

    const form = useForm({
        defaultValues: {
            fechaInicio: '',
            fechaFin: '',
            literal: '',
        } satisfies PeriodoFormValues,
        validators: { onSubmit: periodoSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open || !entity) return

        form.reset()
        form.setFieldValue('fechaInicio', entity.fechaInicio)
        form.setFieldValue('fechaFin', entity.fechaFin)
        form.setFieldValue('literal', entity.literal)
    }, [open, entity, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={entity ? `Editar periodo ${entity.numero}` : 'Editar periodo'}
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void form.handleSubmit()}
                    >
                        Guardar
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    El número de periodo (1–12) no se puede modificar.
                </Text>

                <form.Field name="literal">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Literal"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Enero"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="fechaInicio">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Fecha inicio"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    value={
                                        field.state.value
                                            ? dayjs(field.state.value)
                                            : null
                                    }
                                    onChange={(date) =>
                                        field.handleChange(
                                            date ? date.format('YYYY-MM-DD') : '',
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="fechaFin">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Fecha fin"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    value={
                                        field.state.value
                                            ? dayjs(field.state.value)
                                            : null
                                    }
                                    onChange={(date) =>
                                        field.handleChange(
                                            date ? date.format('YYYY-MM-DD') : '',
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>
            </Form>
        </Drawer>
    )
}
