import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
    Button,
    Drawer,
    Flex,
    Form,
    Grid,
    Input,
    Switch,
    TimePicker,
    Typography,
} from 'antd'
import dayjs from 'dayjs'

import { getFieldError } from '../../../shared/utils/form-errors'
import { normalizeCodigoInput } from '../../../shared/utils/format-codigo'
import {
    turnoDefaultValues,
    turnoSchema,
    type TurnoFormValues,
} from '../schemas/turno.schema'
import type { Turno } from '../types/turnos.types'

const { Text } = Typography
const { useBreakpoint } = Grid

const TIME_FORMAT = 'HH:mm:ss'
const TIME_DISPLAY = 'HH:mm'

type TurnoFormDrawerProps = {
    open: boolean
    entity: Turno | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: TurnoFormValues) => Promise<void>
}

function toDayjs(value: string) {
    return dayjs(value, [TIME_FORMAT, TIME_DISPLAY])
}

export function TurnoFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: TurnoFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: turnoDefaultValues,
        validators: { onSubmit: turnoSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('codigo', entity.codigo)
            form.setFieldValue('nombre', entity.nombre)
            form.setFieldValue('horaInicio', entity.horaInicio)
            form.setFieldValue('horaFin', entity.horaFin)
            form.setFieldValue('cruceDia', entity.cruceDia)
            form.setFieldValue('activo', entity.activo)
            form.setFieldValue(
                'permiteMultiplesMedicosTurno',
                entity.permiteMultiplesMedicosTurno,
            )
            return
        }

        form.reset()
    }, [open, entity, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={isEditing ? 'Editar turno' : 'Nuevo turno'}
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
                        {isEditing ? 'Guardar' : 'Crear'}
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
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                </Text>

                <form.Field name="codigo">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Código"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Identificador único, ej. MAN'}
                            >
                                <Input
                                    placeholder="Ej. MAN"
                                    value={field.state.value}
                                    onChange={(e) =>
                                        field.handleChange(
                                            normalizeCodigoInput(e.target.value),
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading || isEditing}
                                    autoFocus={!isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="nombre">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Nombre"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <Input
                                    placeholder="Mañana"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus={isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="horaInicio">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Hora inicio"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <TimePicker
                                    format={TIME_DISPLAY}
                                    style={{ width: '100%' }}
                                    value={
                                        field.state.value
                                            ? toDayjs(field.state.value)
                                            : null
                                    }
                                    onChange={(value) =>
                                        field.handleChange(
                                            value
                                                ? value.format(TIME_FORMAT)
                                                : '',
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="horaFin">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Hora fin"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || undefined}
                            >
                                <TimePicker
                                    format={TIME_DISPLAY}
                                    style={{ width: '100%' }}
                                    value={
                                        field.state.value
                                            ? toDayjs(field.state.value)
                                            : null
                                    }
                                    onChange={(value) =>
                                        field.handleChange(
                                            value
                                                ? value.format(TIME_FORMAT)
                                                : '',
                                        )
                                    }
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

                <form.Field name="cruceDia">
                    {(field) => (
                        <Form.Item label="Cruce de día">
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="activo">
                    {(field) => (
                        <Form.Item label="Activo">
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>

                <form.Field name="permiteMultiplesMedicosTurno">
                    {(field) => (
                        <Form.Item label="Permite múltiples médicos de turno">
                            <Switch
                                checked={field.state.value}
                                onChange={(checked) => field.handleChange(checked)}
                                disabled={loading}
                            />
                        </Form.Item>
                    )}
                </form.Field>
            </Form>
        </Drawer>
    )
}
