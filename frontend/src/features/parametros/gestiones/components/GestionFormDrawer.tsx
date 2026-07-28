import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
    Button,
    DatePicker,
    Drawer,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Switch,
    Typography,
} from 'antd'
import dayjs from 'dayjs'

import { getFieldError } from '../../../../shared/utils/form-errors'
import {
    gestionDefaultValues,
    gestionSchema,
    type GestionFormValues,
} from '../schemas/gestiones.schema'
import type { Gestion } from '../types/gestiones.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type GestionFormDrawerProps = {
    open: boolean
    entity: Gestion | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: GestionFormValues) => Promise<void>
}

export function GestionFormDrawer({
    open,
    entity,
    loading,
    onClose,
    onSubmit,
}: GestionFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 480 : '95%'
    const isEditing = entity !== null

    const form = useForm({
        defaultValues: gestionDefaultValues,
        validators: { onSubmit: gestionSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        if (entity) {
            form.reset()
            form.setFieldValue('gestion', entity.gestion)
            form.setFieldValue('fechaInicio', entity.fechaInicio)
            form.setFieldValue('fechaFin', entity.fechaFin)
            form.setFieldValue('literal', entity.literal)
            form.setFieldValue('activa', entity.activa)
            return
        }

        const year = new Date().getFullYear()
        form.reset()
        form.setFieldValue('gestion', year)
        form.setFieldValue('fechaInicio', `${year}-01-01`)
        form.setFieldValue('fechaFin', `${year}-12-31`)
        form.setFieldValue('literal', `Gestión ${year}`)
        form.setFieldValue('activa', true)
    }, [open, entity, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    const syncLiteralFromGestion = (gestion: number) => {
        const current = form.getFieldValue('literal')
        if (!current || current.startsWith('Gestión ')) {
            form.setFieldValue('literal', `Gestión ${gestion}`)
        }
        form.setFieldValue('fechaInicio', `${gestion}-01-01`)
        form.setFieldValue('fechaFin', `${gestion}-12-31`)
    }

    return (
        <Drawer
            title={isEditing ? 'Editar gestión' : 'Nueva gestión'}
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
                    {!isEditing &&
                        ' Al crear se generan automáticamente los 12 periodos.'}
                </Text>

                <form.Field name="gestion">
                    {(field) => {
                        const error = getFieldError(field.state.meta.errors)
                        return (
                            <Form.Item
                                label="Gestión"
                                required
                                validateStatus={error ? 'error' : undefined}
                                help={error || 'Ej. 2026'}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={2000}
                                    max={2100}
                                    value={field.state.value}
                                    onChange={(value) => {
                                        const next = value ?? new Date().getFullYear()
                                        field.handleChange(next)
                                        if (!isEditing) syncLiteralFromGestion(next)
                                    }}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
                                    autoFocus={!isEditing}
                                />
                            </Form.Item>
                        )
                    }}
                </form.Field>

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
                                    placeholder="Gestión 2026"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    disabled={loading}
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

                <form.Field name="activa">
                    {(field) => (
                        <Form.Item label="Activa" help="Solo una gestión puede estar activa.">
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
