import { useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    NodeIndexOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import {
    Button,
    Dropdown,
    Flex,
    Modal,
    Tag,
    Typography,
} from 'antd'

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

const { Text, Title } = Typography
const columnHelper = createColumnHelper<WorkflowDefinition>()
const DEFAULT_PAGE_SIZE = 20

type DefinitionRowActionsProps = {
    definition: WorkflowDefinition
    deleting: boolean
    onDesign: () => void
    onEdit: () => void
    onDelete: () => void
}

function DefinitionRowActions({
    definition,
    deleting,
    onDesign,
    onEdit,
    onDelete,
}: DefinitionRowActionsProps) {
    const menuItems: MenuProps['items'] = [
        {
            key: 'design',
            label: 'Diseñar workflow',
            icon: <NodeIndexOutlined />,
            onClick: onDesign,
        },
        {
            key: 'edit',
            label: 'Editar',
            icon: <EditOutlined />,
            onClick: onEdit,
        },
        { type: 'divider' },
        {
            key: 'delete',
            label: 'Eliminar',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: onDelete,
        },
    ]

    return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
                type="text"
                size="small"
                className="workflow-module__row-actions"
                icon={<MoreOutlined />}
                loading={deleting}
                aria-label={`Acciones para ${definition.name}`}
                onClick={(event: MouseEvent) => event.stopPropagation()}
            />
        </Dropdown>
    )
}

export function WorkflowDefinitionsPage() {
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [drawerOpen, setDrawerOpen] = useState(false)
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
            columnHelper.accessor('code', { header: 'Código', size: 120 }),
            columnHelper.accessor('name', { header: 'Nombre' }),
            columnHelper.accessor('module', { header: 'Módulo', size: 140 }),
            columnHelper.accessor('entityName', { header: 'Entidad', size: 140 }),
            columnHelper.accessor('isActive', {
                header: 'Estado',
                size: 100,
                cell: ({ getValue }) => (
                    <Tag color={getValue() ? 'success' : 'default'}>
                        {getValue() ? 'Activo' : 'Inactivo'}
                    </Tag>
                ),
            }),
            columnHelper.display({
                id: 'actions',
                header: '',
                size: 56,
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const definition = row.original

                    return (
                        <DefinitionRowActions
                            definition={definition}
                            deleting={deletingId === definition.id}
                            onDesign={() =>
                                void navigate({
                                    to: '/workflow/designer/$definitionId',
                                    params: { definitionId: definition.id },
                                })
                            }
                            onEdit={() => {
                                setEditingDefinition(definition)
                                setDrawerOpen(true)
                            }}
                            onDelete={() => {
                                Modal.confirm({
                                    title: 'Eliminar workflow',
                                    content: `¿Desea eliminar "${definition.name}"?`,
                                    okText: 'Eliminar',
                                    okType: 'danger',
                                    cancelText: 'Cancelar',
                                    onOk: () => void handleDelete(definition),
                                })
                            }}
                        />
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

        setDrawerOpen(false)
        setEditingDefinition(null)
    }

    return (
        <div className="workflow-module workflow-definitions-page">
            <div className="workflow-module__header workflow-module__header--list">
                <Flex justify="space-between" align="center" wrap gap={12}>
                    <div>
                        <Title level={4} className="workflow-module__title">
                            Workflows configurables
                        </Title>
                        <Text type="secondary" className="workflow-module__subtitle">
                            {total} definición{total === 1 ? '' : 'es'} registrada
                            {total === 1 ? '' : 's'}
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingDefinition(null)
                            setDrawerOpen(true)
                        }}
                    >
                        Nuevo workflow
                    </Button>
                </Flex>
            </div>

            <div className="workflow-module__card workflow-module__card--table">
                <div className="workflow-module__table">
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
            </div>

            <WorkflowDefinitionForm
                open={drawerOpen}
                definition={editingDefinition}
                loading={isSaving}
                onClose={() => {
                    if (isSaving) return
                    setDrawerOpen(false)
                    setEditingDefinition(null)
                }}
                onCreate={handleSubmit}
                onUpdate={handleSubmit}
            />
        </div>
    )
}
