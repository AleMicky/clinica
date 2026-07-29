import { useEffect } from 'react'
import { Button, DatePicker, Drawer, Flex, Form, Input, Popconfirm, Select } from 'antd'
import dayjs from 'dayjs'

import {
    TIPO_ASIGNACION_OPTIONS,
    type ProgramacionDiaria,
    type TipoAsignacionProgramacion,
} from '../types/turnos.types'

const DATE_FORMAT = 'YYYY-MM-DD'

export type CeldaFormValues = {
    programacionId: string
    empleadoId: string
    fecha: dayjs.Dayjs
    turnoId?: string
    tipoAsignacion: TipoAsignacionProgramacion
    observacion?: string
}

type ProgramacionCeldaDrawerProps = {
    open: boolean
    loading?: boolean
    deleting?: boolean
    editing: ProgramacionDiaria | null
    defaultFecha: string
    defaultEmpleadoId?: string
    programacionId?: string
    empleadoOptions: { value: string; label: string }[]
    turnoOptions: { value: string; label: string }[]
    programacionOptions: { value: string; label: string }[]
    onClose: () => void
    onSubmit: (values: CeldaFormValues) => Promise<void>
    onDelete?: () => Promise<void>
}

export function ProgramacionCeldaDrawer({
    open,
    loading,
    deleting,
    editing,
    defaultFecha,
    defaultEmpleadoId,
    programacionId,
    empleadoOptions,
    turnoOptions,
    programacionOptions,
    onClose,
    onSubmit,
    onDelete,
}: ProgramacionCeldaDrawerProps) {
    const [form] = Form.useForm<CeldaFormValues>()
    const tipoAsignacion = Form.useWatch('tipoAsignacion', form)

    useEffect(() => {
        if (!open) return
        if (editing) {
            form.setFieldsValue({
                programacionId: editing.programacionId,
                empleadoId: editing.empleadoId,
                fecha: dayjs(editing.fecha),
                turnoId: editing.turnoId ?? undefined,
                tipoAsignacion: editing.tipoAsignacion,
                observacion: editing.observacion ?? '',
            })
            return
        }

        form.setFieldsValue({
            programacionId: programacionId ?? '',
            empleadoId: defaultEmpleadoId ?? '',
            fecha: dayjs(defaultFecha),
            turnoId: undefined,
            tipoAsignacion: 1,
            observacion: '',
        })
    }, [open, editing, form, defaultFecha, defaultEmpleadoId, programacionId])

    const handleSubmit = async () => {
        const values = await form.validateFields()
        await onSubmit(values)
    }

    return (
        <Drawer
            title={editing ? 'Editar asignación' : 'Nueva asignación'}
            open={open}
            onClose={onClose}
            width={480}
            destroyOnClose
            extra={
                <Flex gap={8}>
                    {editing && onDelete ? (
                        <Popconfirm
                            title="¿Eliminar asignación?"
                            onConfirm={() => void onDelete()}
                        >
                            <Button danger loading={deleting}>
                                Eliminar
                            </Button>
                        </Popconfirm>
                    ) : null}
                    <Button type="primary" loading={loading} onClick={() => void handleSubmit()}>
                        Guardar
                    </Button>
                </Flex>
            }
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="programacionId"
                    label="Programación"
                    rules={[{ required: true, message: 'Seleccione una programación' }]}
                >
                    <Select
                        showSearch
                        optionFilterProp="label"
                        options={programacionOptions}
                        disabled={!!programacionId && !editing}
                    />
                </Form.Item>
                <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="empleadoId"
                    label="Empleado"
                    rules={[{ required: true, message: 'Seleccione un empleado' }]}
                >
                    <Select
                        showSearch
                        optionFilterProp="label"
                        options={empleadoOptions}
                        disabled={!!defaultEmpleadoId && !editing}
                    />
                </Form.Item>
                <Form.Item
                    name="tipoAsignacion"
                    label="Tipo de asignación"
                    rules={[{ required: true }]}
                >
                    <Select options={TIPO_ASIGNACION_OPTIONS} />
                </Form.Item>
                {tipoAsignacion !== 2 && (
                    <Form.Item
                        name="turnoId"
                        label="Turno"
                        rules={[{ required: true, message: 'El turno es obligatorio' }]}
                    >
                        <Select options={turnoOptions} />
                    </Form.Item>
                )}
                <Form.Item name="observacion" label="Observación">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export function toCeldaPayload(values: CeldaFormValues) {
    return {
        programacionId: values.programacionId,
        empleadoId: values.empleadoId,
        fecha: values.fecha.format(DATE_FORMAT),
        turnoId: values.tipoAsignacion === 1 ? values.turnoId || null : null,
        tipoAsignacion: values.tipoAsignacion,
        observacion: values.observacion?.trim() || null,
    }
}
