import { useMemo, useState } from 'react'
import {
    Button,
    Descriptions,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tabs,
    Tag,
    Typography,
} from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Link } from '@tanstack/react-router'

import { FormularioClinicoTab } from '../components/FormularioClinicoTab'
import { EstudiosTab } from '../components/EstudiosTab'
import {
    diagnosticosAtencionHooks,
    interconsultasHooks,
    prescripcionDetallesHooks,
    prescripcionesHooks,
    signosVitalesHooks,
    tratamientosHooks,
    useAtencion,
    useDiagnosticosAtencion,
    useDiagnosticosCatalogo,
    useEspecialidadesLookup,
    useInterconsultas,
    usePrescripcionDetalles,
    usePrescripciones,
    useSignosVitales,
    useTratamientos,
} from '../hooks/atencion-medica.hooks'
import type {
    Atencion,
    DiagnosticoAtencion,
    Interconsulta,
    Prescripcion,
    PrescripcionDetalle,
    SignoVital,
    Tratamiento,
} from '../types/atencion-medica.types'
import { formatDateTime } from '../utils/format'

const { Title, Text } = Typography

type AtencionDetailTabsProps = {
    atencion: Atencion
}

// ── Signos vitales ──────────────────────────────────────────────────

function SignosVitalesTab({ atencionId }: { atencionId: string }) {
    const { data, isFetching } = useSignosVitales({ atencionId, page: 1, pageSize: 50 })
    const createMutation = signosVitalesHooks.useCreate()
    const updateMutation = signosVitalesHooks.useUpdate()
    const deleteMutation = signosVitalesHooks.useDelete()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<SignoVital | null>(null)
    const [form] = Form.useForm()

    const openCreate = () => {
        setEditing(null)
        form.resetFields()
        setModalOpen(true)
    }

    const openEdit = (item: SignoVital) => {
        setEditing(item)
        form.setFieldsValue({
            ...item,
            fechaRegistro: item.fechaRegistro.slice(0, 16),
        })
        setModalOpen(true)
    }

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = {
            atencionId,
            ...values,
            fechaRegistro: values.fechaRegistro
                ? new Date(values.fechaRegistro).toISOString()
                : null,
        }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
    }

    return (
        <>
            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>
                    Registrar signos
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                columns={[
                    { title: 'Fecha', dataIndex: 'fechaRegistro', render: formatDateTime },
                    { title: 'Temp.', dataIndex: 'temperatura', render: (v) => v ?? '—' },
                    { title: 'FC', dataIndex: 'frecuenciaCardiaca', render: (v) => v ?? '—' },
                    { title: 'FR', dataIndex: 'frecuenciaRespiratoria', render: (v) => v ?? '—' },
                    {
                        title: 'PA',
                        render: (_, row) =>
                            row.presionSistolica && row.presionDiastolica
                                ? `${row.presionSistolica}/${row.presionDiastolica}`
                                : '—',
                    },
                    { title: 'SpO₂', dataIndex: 'saturacionOxigeno', render: (v) => v ?? '—' },
                    { title: 'IMC', dataIndex: 'imc', render: (v) => v ?? '—' },
                    {
                        title: 'Acciones',
                        width: 100,
                        render: (_, row) => (
                            <Space>
                                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                                <Popconfirm title="¿Eliminar?" onConfirm={() => deleteMutation.mutate(row.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />
            <Modal
                title={editing ? 'Editar signos vitales' : 'Registrar signos vitales'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleSubmit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                width={640}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="fechaRegistro" label="Fecha de registro">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Flex gap={12} wrap="wrap">
                        <Form.Item name="temperatura" label="Temperatura (°C)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="frecuenciaCardiaca" label="FC (lpm)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="frecuenciaRespiratoria" label="FR (rpm)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="presionSistolica" label="PA sistólica">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="presionDiastolica" label="PA diastólica">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="saturacionOxigeno" label="SpO₂ (%)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="peso" label="Peso (kg)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="talla" label="Talla (cm)">
                            <InputNumber style={{ width: 120 }} />
                        </Form.Item>
                        <Form.Item name="glasgow" label="Glasgow">
                            <InputNumber min={3} max={15} style={{ width: 120 }} />
                        </Form.Item>
                    </Flex>
                </Form>
            </Modal>
        </>
    )
}

// ── Diagnósticos ────────────────────────────────────────────────────

function DiagnosticosTab({ atencionId }: { atencionId: string }) {
    const { data, isFetching } = useDiagnosticosAtencion({ atencionId, page: 1, pageSize: 50 })
    const { data: catalogo } = useDiagnosticosCatalogo({ page: 1, pageSize: 200 })
    const createMutation = diagnosticosAtencionHooks.useCreate()
    const updateMutation = diagnosticosAtencionHooks.useUpdate()
    const deleteMutation = diagnosticosAtencionHooks.useDelete()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<DiagnosticoAtencion | null>(null)
    const [form] = Form.useForm()

    const diagnosticoMap = useMemo(() => {
        const map = new Map<string, string>()
        catalogo?.items.forEach((d) => map.set(d.id, `${d.codigoCie10} — ${d.nombre}`))
        return map
    }, [catalogo])

    const openCreate = () => {
        setEditing(null)
        form.resetFields()
        form.setFieldValue('esPrincipal', false)
        setModalOpen(true)
    }

    const openEdit = (item: DiagnosticoAtencion) => {
        setEditing(item)
        form.setFieldsValue(item)
        setModalOpen(true)
    }

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = { atencionId, ...values }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
    }

    return (
        <>
            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openCreate}>
                    Asociar diagnóstico
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                columns={[
                    {
                        title: 'Diagnóstico',
                        dataIndex: 'diagnosticoId',
                        render: (id: string) => diagnosticoMap.get(id) ?? id,
                    },
                    {
                        title: 'Principal',
                        dataIndex: 'esPrincipal',
                        render: (v: boolean) => (v ? <Tag color="blue">Sí</Tag> : 'No'),
                    },
                    { title: 'Observaciones', dataIndex: 'observaciones', render: (v) => v || '—' },
                    {
                        title: 'Acciones',
                        width: 100,
                        render: (_, row) => (
                            <Space>
                                <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
                                <Popconfirm title="¿Eliminar?" onConfirm={() => deleteMutation.mutate(row.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />
            <Modal
                title={editing ? 'Editar diagnóstico' : 'Asociar diagnóstico'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleSubmit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="diagnosticoId"
                        label="Diagnóstico CIE-10"
                        rules={[{ required: true, message: 'Seleccione un diagnóstico' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={catalogo?.items.map((d) => ({
                                value: d.id,
                                label: `${d.codigoCie10} — ${d.nombre}`,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="esPrincipal" label="¿Es principal?" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="observaciones" label="Observaciones">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

// ── Tratamientos ────────────────────────────────────────────────────

function TratamientosTab({ atencionId }: { atencionId: string }) {
    const { data, isFetching } = useTratamientos({ atencionId, page: 1, pageSize: 50 })
    const createMutation = tratamientosHooks.useCreate()
    const updateMutation = tratamientosHooks.useUpdate()
    const deleteMutation = tratamientosHooks.useDelete()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Tratamiento | null>(null)
    const [form] = Form.useForm()

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = {
            atencionId,
            descripcion: values.descripcion,
            indicaciones: values.indicaciones || null,
            fechaRegistro: values.fechaRegistro
                ? new Date(values.fechaRegistro).toISOString()
                : null,
        }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
    }

    return (
        <>
            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null)
                        form.resetFields()
                        setModalOpen(true)
                    }}
                >
                    Agregar tratamiento
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                columns={[
                    { title: 'Fecha', dataIndex: 'fechaRegistro', render: formatDateTime },
                    { title: 'Descripción', dataIndex: 'descripcion' },
                    { title: 'Indicaciones', dataIndex: 'indicaciones', render: (v) => v || '—' },
                    {
                        title: 'Acciones',
                        width: 100,
                        render: (_, row) => (
                            <Space>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditing(row)
                                        form.setFieldsValue({
                                            ...row,
                                            fechaRegistro: row.fechaRegistro.slice(0, 16),
                                        })
                                        setModalOpen(true)
                                    }}
                                />
                                <Popconfirm title="¿Eliminar?" onConfirm={() => deleteMutation.mutate(row.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />
            <Modal
                title={editing ? 'Editar tratamiento' : 'Nuevo tratamiento'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleSubmit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="fechaRegistro" label="Fecha">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: 'Ingrese la descripción' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="indicaciones" label="Indicaciones">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

// ── Interconsultas ──────────────────────────────────────────────────

function InterconsultasTab({ atencionId }: { atencionId: string }) {
    const { data, isFetching } = useInterconsultas({ atencionId, page: 1, pageSize: 50 })
    const { data: especialidades } = useEspecialidadesLookup()
    const createMutation = interconsultasHooks.useCreate()
    const updateMutation = interconsultasHooks.useUpdate()
    const deleteMutation = interconsultasHooks.useDelete()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Interconsulta | null>(null)
    const [form] = Form.useForm()

    const espMap = useMemo(() => {
        const map = new Map<string, string>()
        especialidades?.items.forEach((e) => map.set(e.id, e.nombre))
        return map
    }, [especialidades])

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = {
            atencionId,
            especialidadId: values.especialidadId,
            motivo: values.motivo,
            respuesta: values.respuesta || null,
            fechaSolicitud: values.fechaSolicitud
                ? new Date(values.fechaSolicitud).toISOString()
                : null,
            fechaRespuesta: values.fechaRespuesta
                ? new Date(values.fechaRespuesta).toISOString()
                : null,
        }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
    }

    return (
        <>
            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null)
                        form.resetFields()
                        setModalOpen(true)
                    }}
                >
                    Solicitar interconsulta
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                columns={[
                    {
                        title: 'Especialidad',
                        dataIndex: 'especialidadId',
                        render: (id: string) => espMap.get(id) ?? id,
                    },
                    { title: 'Motivo', dataIndex: 'motivo' },
                    { title: 'Respuesta', dataIndex: 'respuesta', render: (v) => v || '—' },
                    { title: 'Solicitud', dataIndex: 'fechaSolicitud', render: formatDateTime },
                    {
                        title: 'Acciones',
                        width: 100,
                        render: (_, row) => (
                            <Space>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditing(row)
                                        form.setFieldsValue({
                                            ...row,
                                            fechaSolicitud: row.fechaSolicitud.slice(0, 16),
                                            fechaRespuesta: row.fechaRespuesta?.slice(0, 16),
                                        })
                                        setModalOpen(true)
                                    }}
                                />
                                <Popconfirm title="¿Eliminar?" onConfirm={() => deleteMutation.mutate(row.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />
            <Modal
                title={editing ? 'Editar interconsulta' : 'Nueva interconsulta'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleSubmit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="especialidadId"
                        label="Especialidad"
                        rules={[{ required: true, message: 'Seleccione especialidad' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={especialidades?.items.map((e) => ({
                                value: e.id,
                                label: e.nombre,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="motivo"
                        label="Motivo"
                        rules={[{ required: true, message: 'Ingrese el motivo' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="respuesta" label="Respuesta">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="fechaSolicitud" label="Fecha solicitud">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item name="fechaRespuesta" label="Fecha respuesta">
                        <Input type="datetime-local" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

// ── Prescripciones ──────────────────────────────────────────────────

function PrescripcionesTab({ atencionId }: { atencionId: string }) {
    const { data, isFetching } = usePrescripciones({ atencionId, page: 1, pageSize: 50 })
    const createMutation = prescripcionesHooks.useCreate()
    const deleteMutation = prescripcionesHooks.useDelete()
    const [selectedPrescripcion, setSelectedPrescripcion] = useState<Prescripcion | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const { data: detalles, isFetching: loadingDetalles } = usePrescripcionDetalles({
        prescripcionId: selectedPrescripcion?.id,
        page: 1,
        pageSize: 50,
    })
    const createDetalle = prescripcionDetallesHooks.useCreate()
    const deleteDetalle = prescripcionDetallesHooks.useDelete()
    const [detalleModalOpen, setDetalleModalOpen] = useState(false)
    const [detalleForm] = Form.useForm()

    const handleCreatePrescripcion = async () => {
        const values = await form.validateFields()
        await createMutation.mutateAsync({
            atencionId,
            fecha: values.fecha ? new Date(values.fecha).toISOString() : null,
            observaciones: values.observaciones || null,
        })
        setModalOpen(false)
        form.resetFields()
    }

    const handleCreateDetalle = async () => {
        if (!selectedPrescripcion) return
        const values = await detalleForm.validateFields()
        await createDetalle.mutateAsync({
            prescripcionId: selectedPrescripcion.id,
            ...values,
        })
        setDetalleModalOpen(false)
        detalleForm.resetFields()
    }

    return (
        <>
            <Flex justify="flex-end" style={{ marginBottom: 12 }}>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields()
                        setModalOpen(true)
                    }}
                >
                    Nueva prescripción
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                onRow={(row) => ({
                    onClick: () => setSelectedPrescripcion(row),
                    style: {
                        cursor: 'pointer',
                        background:
                            selectedPrescripcion?.id === row.id
                                ? 'var(--ant-color-primary-bg)'
                                : undefined,
                    },
                })}
                columns={[
                    { title: 'Fecha', dataIndex: 'fecha', render: formatDateTime },
                    { title: 'Observaciones', dataIndex: 'observaciones', render: (v) => v || '—' },
                    {
                        title: 'Acciones',
                        width: 80,
                        render: (_, row) => (
                            <Popconfirm
                                title="¿Eliminar prescripción?"
                                onConfirm={(e) => {
                                    e?.stopPropagation()
                                    deleteMutation.mutate(row.id)
                                    if (selectedPrescripcion?.id === row.id) {
                                        setSelectedPrescripcion(null)
                                    }
                                }}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Popconfirm>
                        ),
                    },
                ]}
            />

            {selectedPrescripcion && (
                <div style={{ marginTop: 24 }}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                        <Text strong>Medicamentos de la prescripción</Text>
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                detalleForm.resetFields()
                                setDetalleModalOpen(true)
                            }}
                        >
                            Agregar medicamento
                        </Button>
                    </Flex>
                    <Table
                        rowKey="id"
                        loading={loadingDetalles}
                        dataSource={detalles?.items ?? []}
                        size="small"
                        pagination={false}
                        columns={[
                            { title: 'Medicamento', dataIndex: 'medicamentoNombre' },
                            { title: 'Dosis', dataIndex: 'dosis' },
                            { title: 'Frecuencia', dataIndex: 'frecuencia' },
                            { title: 'Duración', dataIndex: 'duracion' },
                            { title: 'Vía', dataIndex: 'viaAdministracion', render: (v) => v || '—' },
                            {
                                title: '',
                                width: 60,
                                render: (_, row: PrescripcionDetalle) => (
                                    <Popconfirm
                                        title="¿Eliminar?"
                                        onConfirm={() => deleteDetalle.mutate(row.id)}
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                ),
                            },
                        ]}
                    />
                </div>
            )}

            <Modal
                title="Nueva prescripción"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleCreatePrescripcion()}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="fecha" label="Fecha">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item name="observaciones" label="Observaciones">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Agregar medicamento"
                open={detalleModalOpen}
                onCancel={() => setDetalleModalOpen(false)}
                onOk={() => void handleCreateDetalle()}
                confirmLoading={createDetalle.isPending}
            >
                <Form form={detalleForm} layout="vertical">
                    <Form.Item
                        name="medicamentoNombre"
                        label="Medicamento"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="dosis" label="Dosis" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="frecuencia" label="Frecuencia" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="duracion" label="Duración" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="viaAdministracion" label="Vía de administración">
                        <Input />
                    </Form.Item>
                    <Form.Item name="indicaciones" label="Indicaciones">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

// ── Vista principal de detalle ──────────────────────────────────────

export function AtencionDetailTabs({ atencion }: AtencionDetailTabsProps) {
    const tabItems = [
        {
            key: 'formulario',
            label: 'Formulario clínico',
            children: <FormularioClinicoTab atencion={atencion} />,
        },
        {
            key: 'signos',
            label: 'Signos vitales',
            children: <SignosVitalesTab atencionId={atencion.id} />,
        },
        {
            key: 'diagnosticos',
            label: 'Diagnósticos',
            children: <DiagnosticosTab atencionId={atencion.id} />,
        },
        {
            key: 'tratamientos',
            label: 'Tratamientos',
            children: <TratamientosTab atencionId={atencion.id} />,
        },
        {
            key: 'estudios',
            label: 'Estudios',
            children: <EstudiosTab atencionId={atencion.id} />,
        },
        {
            key: 'interconsultas',
            label: 'Interconsultas',
            children: <InterconsultasTab atencionId={atencion.id} />,
        },
        {
            key: 'prescripciones',
            label: 'Prescripciones',
            children: <PrescripcionesTab atencionId={atencion.id} />,
        },
    ]

    return <Tabs items={tabItems} />
}

type AtencionDetailViewProps = {
    atencionId: string
}

export function AtencionDetailView({ atencionId }: AtencionDetailViewProps) {
    const { data: atencion, isFetching } = useAtencion(atencionId)

    if (isFetching && !atencion) {
        return <Text type="secondary">Cargando atención…</Text>
    }

    if (!atencion) {
        return <Text type="danger">No se encontró la atención.</Text>
    }

    return (
        <div className="admin-page">
            <header className="admin-page__header">
                <Flex align="center" gap={16}>
                    <Link to="/atenciones">
                        <Button type="text" icon={<ArrowLeftOutlined />} />
                    </Link>
                    <div>
                        <Title level={3} className="admin-page__title">
                            Atención {atencion.numeroTramite}
                        </Title>
                        <Text type="secondary">
                            {formatDateTime(atencion.fechaAtencion)} ·{' '}
                            <Tag>{atencion.estado}</Tag>
                        </Text>
                    </div>
                </Flex>
            </header>

            <div className="admin-page__workspace">
                <section className="admin-page__panel" style={{ marginBottom: 16 }}>
                    <Descriptions size="small" column={{ xs: 1, sm: 2, lg: 3 }}>
                        <Descriptions.Item label="Trámite">
                            {atencion.numeroTramite}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha">
                            {formatDateTime(atencion.fechaAtencion)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            <Tag>{atencion.estado}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Observaciones" span={3}>
                            {atencion.observaciones || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                </section>

                <section className="admin-page__panel">
                    <AtencionDetailTabs atencion={atencion} />
                </section>
            </div>
        </div>
    )
}
