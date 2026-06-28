import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Flex,
    Popconfirm,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    NodeIndexOutlined,
    PlusOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { WorkflowDefinitionForm } from '../components/WorkflowDefinitionForm'
import {
    useCreateWorkflowDefinition,
    useDeleteWorkflowDefinition,
    useUpdateWorkflowDefinition,
    useWorkflowDefinitions,
} from '../hooks/useWorkflowDefinitions'
import type { CreateWorkflowDefinitionFormValues } from '../schemas/workflow.schemas'
import type { WorkflowDefinition } from '../types/workflow.types'

const { Title, Text } = Typography
const columnHelper = createColumnHelper<WorkflowDefinition>()
const DEFAULT_PAGE_SIZE = 20

export function WorkflowDefinitionsPage() {
    const { token } = theme.useToken()
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useWorkflowDefinitions({ page, pageSize })
    const createDefinition = useCreateWorkflowDefinition()
    const updateDefinition = useUpdateWorkflowDefinition()
    const deleteDefinition = useDeleteWorkflowDefinition()

    const definitions = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const isSaving = createDefinition.isPending || updateDefinition.isPending

    const columns = useMemo(
        () => [
            columnHelper.accessor('code', { header: 'Código' }),
            columnHelper.accessor('name', { header: 'Nombre' }),
            columnHelper.accessor('module', { header: 'Módulo' }),
            columnHelper.accessor('entityName', { header: 'Entidad' }),
            columnHelper.accessor('isActive', {
                header: 'Estado',
                cell: ({ getValue }) => (
                    <Tag color={getValue() ? 'success' : 'default'}>
                        {getValue() ? 'Activo' : 'Inactivo'}
                    </Tag>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Acciones',
                size: 180,
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const definition = row.original

                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<NodeIndexOutlined />}
                                aria-label={`Diseñar ${definition.name}`}
                                onClick={() =>
                                    void navigate({
                                        to: '/workflow/designer/$definitionId',
                                        params: { definitionId: definition.id },
                                    })
                                }
                            />
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                aria-label={`Editar ${definition.name}`}
                                onClick={() => {
                                    setEditingDefinition(definition)
                                    setModalOpen(true)
                                }}
                            />
                            <Popconfirm
                                title="Eliminar workflow"
                                description={`¿Desea eliminar "${definition.name}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                okButtonProps={{
                                    danger: true,
                                    loading: deletingId === definition.id,
                                }}
                                onConfirm={() => void handleDelete(definition)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deletingId === definition.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<WorkflowDefinition, any>[],
        [deletingId, navigate],
    )

    const handleDelete = async (definition: WorkflowDefinition) => {
        setDeletingId(definition.id)
        try {
            await deleteDefinition.mutateAsync(definition.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handleSubmit = async (values: CreateWorkflowDefinitionFormValues) => {
        if (editingDefinition) {
            await updateDefinition.mutateAsync({ id: editingDefinition.id, data: values })
        } else {
            await createDefinition.mutateAsync(values)
        }

        setModalOpen(false)
        setEditingDefinition(null)
    }

    return (
        <div className="workflow-definitions-page">
            <Flex justify="space-between" align="center" wrap gap={16} style={{ marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Workflows configurables
                    </Title>
                    <Text type="secondary">
                        {total} definición{total === 1 ? '' : 'es'} registrada{total === 1 ? '' : 's'}
                    </Text>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingDefinition(null)
                        setModalOpen(true)
                    }}
                >
                    Nuevo workflow
                </Button>
            </Flex>

            <div
                className="workflow-definitions-page__panel"
                style={{
                    background: token.colorBgContainer,
                    borderRadius: token.borderRadiusLG,
                    padding: 16,
                }}
            >
                <AppDataTable
                    data={definitions}
                    columns={columns}
                    loading={isFetching}
                    emptyText="No hay workflows registrados."
                    getRowId={(row) => row.id}
                    pagination={{
                        page,
                        pageSize,
                        total,
                        pageSizeOptions: [10, 20, 50],
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage)
                            setPageSize(nextPageSize)
                        },
                    }}
                />
            </div>

            <WorkflowDefinitionForm
                open={modalOpen}
                definition={editingDefinition}
                loading={isSaving}
                onClose={() => {
                    if (isSaving) return
                    setModalOpen(false)
                    setEditingDefinition(null)
                }}
                onCreate={handleSubmit}
                onUpdate={handleSubmit}
            />
        </div>
    )
}
