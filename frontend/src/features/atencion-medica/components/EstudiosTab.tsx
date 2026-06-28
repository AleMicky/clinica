import { useMemo, useState } from 'react'
import {
    Button,
    Flex,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import { useCatalogoGruposGrouped } from '../../parametros/catalogos/hooks/catalogo-grupos.hooks'
import {
    estudiosHooks,
    resultadosEstudioHooks,
    useEstudios,
    useResultadosEstudio,
} from '../hooks/atencion-medica.hooks'
import type { Estudio, ResultadoEstudio } from '../types/atencion-medica.types'
import { formatDateTime } from '../utils/format'

const { Text } = Typography

const ESTADO_OPTIONS = [
    { value: 'SOLICITADO', label: 'Solicitado' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'RESULTADO', label: 'Con resultado' },
    { value: 'ANULADO', label: 'Anulado' },
]

type EstudiosTabProps = {
    atencionId: string
}

export function EstudiosTab({ atencionId }: EstudiosTabProps) {
    const { data, isFetching } = useEstudios({ atencionId, page: 1, pageSize: 50 })
    const { data: catalogosGrouped } = useCatalogoGruposGrouped()
    const createMutation = estudiosHooks.useCreate()
    const updateMutation = estudiosHooks.useUpdate()
    const deleteMutation = estudiosHooks.useDelete()

    const [selectedEstudio, setSelectedEstudio] = useState<Estudio | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Estudio | null>(null)
    const [form] = Form.useForm()

    const { data: resultados, isFetching: loadingResultados } = useResultadosEstudio({
        estudioId: selectedEstudio?.id,
        page: 1,
        pageSize: 10,
    })
    const createResultado = resultadosEstudioHooks.useCreate()
    const deleteResultado = resultadosEstudioHooks.useDelete()
    const [resultadoModalOpen, setResultadoModalOpen] = useState(false)
    const [resultadoForm] = Form.useForm()

    const tipoEstudioOptions = useMemo(() => {
        const items =
            catalogosGrouped?.flatMap((grupo) =>
                grupo.items.map((item) => ({
                    value: item.id,
                    label: `${grupo.nombre}: ${item.nombre}`,
                })),
            ) ?? []
        return items
    }, [catalogosGrouped])

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = {
            atencionId,
            tipoEstudioId: values.tipoEstudioId,
            nombre: values.nombre,
            justificacion: values.justificacion || null,
            estado: values.estado || 'SOLICITADO',
            fechaSolicitud: values.fechaSolicitud
                ? new Date(values.fechaSolicitud).toISOString()
                : null,
        }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
    }

    const handleCreateResultado = async () => {
        if (!selectedEstudio) return
        const values = await resultadoForm.validateFields()
        await createResultado.mutateAsync({
            estudioId: selectedEstudio.id,
            resultadoTexto: values.resultadoTexto,
            archivoUrl: values.archivoUrl || null,
            fechaResultado: values.fechaResultado
                ? new Date(values.fechaResultado).toISOString()
                : null,
            observaciones: values.observaciones || null,
        })
        setResultadoModalOpen(false)
        resultadoForm.resetFields()
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
                        form.setFieldValue('estado', 'SOLICITADO')
                        setModalOpen(true)
                    }}
                >
                    Solicitar estudio
                </Button>
            </Flex>
            <Table
                rowKey="id"
                loading={isFetching}
                dataSource={data?.items ?? []}
                size="small"
                pagination={false}
                onRow={(row) => ({
                    onClick: () => setSelectedEstudio(row),
                    style: {
                        cursor: 'pointer',
                        background:
                            selectedEstudio?.id === row.id
                                ? 'var(--ant-color-primary-bg)'
                                : undefined,
                    },
                })}
                columns={[
                    { title: 'Nombre', dataIndex: 'nombre' },
                    { title: 'Estado', dataIndex: 'estado', render: (v) => <Tag>{v}</Tag> },
                    { title: 'Solicitud', dataIndex: 'fechaSolicitud', render: formatDateTime },
                    { title: 'Justificación', dataIndex: 'justificacion', render: (v) => v || '—' },
                    {
                        title: 'Acciones',
                        width: 100,
                        render: (_, row) => (
                            <Space onClick={(e) => e.stopPropagation()}>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditing(row)
                                        form.setFieldsValue({
                                            ...row,
                                            fechaSolicitud: row.fechaSolicitud.slice(0, 16),
                                        })
                                        setModalOpen(true)
                                    }}
                                />
                                <Popconfirm
                                    title="¿Eliminar estudio?"
                                    onConfirm={() => {
                                        deleteMutation.mutate(row.id)
                                        if (selectedEstudio?.id === row.id) {
                                            setSelectedEstudio(null)
                                        }
                                    }}
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
            />

            {selectedEstudio && (
                <div style={{ marginTop: 24 }}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                        <Text strong>Resultados del estudio</Text>
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                resultadoForm.resetFields()
                                setResultadoModalOpen(true)
                            }}
                        >
                            Registrar resultado
                        </Button>
                    </Flex>
                    <Table
                        rowKey="id"
                        loading={loadingResultados}
                        dataSource={resultados?.items ?? []}
                        size="small"
                        pagination={false}
                        columns={[
                            {
                                title: 'Resultado',
                                dataIndex: 'resultadoTexto',
                                ellipsis: true,
                            },
                            {
                                title: 'Fecha',
                                dataIndex: 'fechaResultado',
                                render: formatDateTime,
                            },
                            {
                                title: 'Archivo',
                                dataIndex: 'archivoUrl',
                                render: (v) => v || '—',
                            },
                            {
                                title: '',
                                width: 60,
                                render: (_, row: ResultadoEstudio) => (
                                    <Popconfirm
                                        title="¿Eliminar resultado?"
                                        onConfirm={() => deleteResultado.mutate(row.id)}
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
                title={editing ? 'Editar estudio' : 'Solicitar estudio'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={() => void handleSubmit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="tipoEstudioId"
                        label="Tipo de estudio"
                        rules={[{ required: true, message: 'Seleccione el tipo' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={tipoEstudioOptions}
                            placeholder="Seleccione del catálogo"
                        />
                    </Form.Item>
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="estado" label="Estado">
                        <Select options={ESTADO_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="fechaSolicitud" label="Fecha de solicitud">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item name="justificacion" label="Justificación">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Registrar resultado"
                open={resultadoModalOpen}
                onCancel={() => setResultadoModalOpen(false)}
                onOk={() => void handleCreateResultado()}
                confirmLoading={createResultado.isPending}
            >
                <Form form={resultadoForm} layout="vertical">
                    <Form.Item
                        name="resultadoTexto"
                        label="Resultado"
                        rules={[{ required: true, message: 'Ingrese el resultado' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="fechaResultado" label="Fecha del resultado">
                        <Input type="datetime-local" />
                    </Form.Item>
                    <Form.Item name="archivoUrl" label="URL del archivo">
                        <Input placeholder="https://…" />
                    </Form.Item>
                    <Form.Item name="observaciones" label="Observaciones">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
