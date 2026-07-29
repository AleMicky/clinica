import { useEffect, useMemo } from 'react'
import { Button, Drawer, Form, Input, Select, Transfer } from 'antd'

import type { GrupoProgramacion } from '../types/turnos.types'

type EmpleadoOption = {
    key: string
    title: string
}

type GrupoFormValues = {
    codigo: string
    nombre: string
    descripcion?: string
    areaId: string
    empleadoIds: string[]
}

type GrupoProgramacionFormDrawerProps = {
    open: boolean
    loading?: boolean
    entity: GrupoProgramacion | null
    areaOptions: { value: string; label: string }[]
    empleadoOptions: EmpleadoOption[]
    onClose: () => void
    onSubmit: (values: GrupoFormValues) => Promise<void>
}

export function GrupoProgramacionFormDrawer({
    open,
    loading,
    entity,
    areaOptions,
    empleadoOptions,
    onClose,
    onSubmit,
}: GrupoProgramacionFormDrawerProps) {
    const [form] = Form.useForm<GrupoFormValues>()
    const empleadoIds = Form.useWatch('empleadoIds', form) ?? []

    useEffect(() => {
        if (!open) return
        if (entity) {
            form.setFieldsValue({
                codigo: entity.codigo,
                nombre: entity.nombre,
                descripcion: entity.descripcion ?? '',
                areaId: entity.areaId,
                empleadoIds: entity.empleados.map((e) => e.empleadoId),
            })
            return
        }
        form.setFieldsValue({
            codigo: '',
            nombre: '',
            descripcion: '',
            areaId: undefined,
            empleadoIds: [],
        })
    }, [open, entity, form])

    const transferData = useMemo(
        () =>
            empleadoOptions.map((e) => ({
                key: e.key,
                title: e.title,
            })),
        [empleadoOptions],
    )

    const handleSubmit = async () => {
        const values = await form.validateFields()
        await onSubmit({
            ...values,
            descripcion: values.descripcion?.trim() || undefined,
            empleadoIds: values.empleadoIds ?? [],
        })
    }

    return (
        <Drawer
            title={entity ? 'Editar grupo' : 'Nuevo grupo'}
            open={open}
            onClose={onClose}
            width={720}
            destroyOnClose
            extra={
                <Button type="primary" loading={loading} onClick={() => void handleSubmit()}>
                    Guardar
                </Button>
            }
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="codigo"
                    label="Código"
                    rules={[{ required: true, message: 'Ingrese el código' }]}
                >
                    <Input maxLength={50} />
                </Form.Item>
                <Form.Item
                    name="nombre"
                    label="Nombre"
                    rules={[{ required: true, message: 'Ingrese el nombre' }]}
                >
                    <Input maxLength={200} />
                </Form.Item>
                <Form.Item
                    name="areaId"
                    label="Área"
                    rules={[{ required: true, message: 'Seleccione un área' }]}
                >
                    <Select
                        showSearch
                        optionFilterProp="label"
                        options={areaOptions}
                    />
                </Form.Item>
                <Form.Item name="descripcion" label="Descripción">
                    <Input.TextArea rows={2} maxLength={500} />
                </Form.Item>
                <Form.Item name="empleadoIds" label="Empleados del grupo">
                    <Transfer
                        dataSource={transferData}
                        titles={['Disponibles', 'En el grupo']}
                        targetKeys={empleadoIds}
                        onChange={(next) => form.setFieldValue('empleadoIds', next as string[])}
                        render={(item) => item.title}
                        listStyle={{ width: 280, height: 320 }}
                        showSearch
                        filterOption={(input, item) =>
                            (item.title ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export type { GrupoFormValues }
