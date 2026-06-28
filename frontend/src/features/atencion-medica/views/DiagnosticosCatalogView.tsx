import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
    Button,
    Flex,
    Form,
    Input,
    Modal,
    Popconfirm,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import {
    diagnosticosCatalogoHooks,
    useDiagnosticosCatalogo,
} from '../hooks/atencion-medica.hooks'
import type { Diagnostico } from '../types/atencion-medica.types'

const { Text } = Typography
const DEFAULT_PAGE_SIZE = 20

const columnHelper = createColumnHelper<Diagnostico>()

export function DiagnosticosCatalogView() {
    const { token } = theme.useToken()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<Diagnostico | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [form] = Form.useForm()

    const { data, isFetching } = useDiagnosticosCatalogo({
        page,
        pageSize,
        busqueda: search || undefined,
    })
    const createMutation = diagnosticosCatalogoHooks.useCreate()
    const updateMutation = diagnosticosCatalogoHooks.useUpdate()
    const deleteMutation = diagnosticosCatalogoHooks.useDelete()

    const isSaving = createMutation.isPending || updateMutation.isPending

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('codigoCie10', {
                    header: 'CIE-10',
                    size: 120,
                    cell: ({ getValue }) => (
                        <Tag className="catalogo-clinico-code-tag">{getValue()}</Tag>
                    ),
                }),
                columnHelper.accessor('nombre', { header: 'Nombre' }),
                columnHelper.accessor('descripcion', {
                    header: 'Descripción',
                    cell: ({ getValue }) => getValue() || '—',
                }),
                columnHelper.display({
                    id: 'actions',
                    header: 'Acciones',
                    size: 120,
                    meta: { align: 'right', headerAlign: 'right' },
                    cell: ({ row }) => (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditing(row.original)
                                    form.setFieldsValue({
                                        codigoCie10: row.original.codigoCie10,
                                        nombre: row.original.nombre,
                                        descripcion: row.original.descripcion ?? '',
                                    })
                                    setModalOpen(true)
                                }}
                            />
                            <Popconfirm
                                title="Eliminar diagnóstico"
                                description={`¿Eliminar "${row.original.nombre}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === row.original.id,
                                }}
                                onConfirm={async () => {
                                    setDeletingId(row.original.id)
                                    try {
                                        await deleteMutation.mutateAsync(row.original.id)
                                    } finally {
                                        setDeletingId(null)
                                    }
                                }}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deletingId === row.original.id}
                                />
                            </Popconfirm>
                        </Space>
                    ),
                }),
            ] as ColumnDef<Diagnostico, unknown>[],
        [deleteMutation, deletingId, form],
    )

    const handleSubmit = async () => {
        const values = await form.validateFields()
        const payload = {
            codigoCie10: values.codigoCie10,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
        }

        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: payload })
        } else {
            await createMutation.mutateAsync(payload)
        }

        setModalOpen(false)
        setEditing(null)
    }

    return (
        <div className="module-object-page__panel catalogo-clinico-panel">
            <div className="catalogo-clinico-panel__head">
                <div className="catalogo-clinico-panel__head-text">
                    <Text strong className="catalogo-clinico-panel__title">
                        Diagnósticos CIE-10
                    </Text>
                    <Text type="secondary" className="catalogo-clinico-panel__subtitle">
                        Catálogo de diagnósticos para asociar a las atenciones clínicas
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null)
                        form.resetFields()
                        setModalOpen(true)
                    }}
                >
                    Nuevo diagnóstico
                </Button>
            </div>

            <div className="catalogo-clinico-panel__search">
                <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
                    placeholder="Buscar por código CIE-10 o nombre…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onPressEnter={() => {
                        setSearch(searchInput.trim())
                        setPage(1)
                    }}
                    onClear={() => {
                        setSearchInput('')
                        setSearch('')
                    }}
                />
            </div>

            <div className="catalogo-clinico-panel__body">
                <Flex justify="space-between" align="center" className="catalogo-clinico-panel__meta">
                    <Text type="secondary">
                        {data?.totalRecords ?? 0} registro
                        {(data?.totalRecords ?? 0) === 1 ? '' : 's'}
                        {search ? ` · "${search}"` : ''}
                    </Text>
                </Flex>

                <AppDataTable
                    data={data?.items ?? []}
                    columns={columns}
                    loading={isFetching}
                    emptyText="No hay diagnósticos registrados."
                    getRowId={(row) => row.id}
                    pagination={{
                        page,
                        pageSize,
                        total: data?.totalRecords ?? 0,
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage)
                            setPageSize(nextPageSize)
                        },
                    }}
                />
            </div>

            <Modal
                title={editing ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}
                open={modalOpen}
                onCancel={() => {
                    if (!isSaving) {
                        setModalOpen(false)
                        setEditing(null)
                    }
                }}
                onOk={() => void handleSubmit()}
                confirmLoading={isSaving}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="codigoCie10"
                        label="Código CIE-10"
                        rules={[{ required: true, message: 'Ingrese el código' }]}
                    >
                        <Input placeholder="Ej. J06.9" />
                    </Form.Item>
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Ingrese el nombre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="descripcion" label="Descripción">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
