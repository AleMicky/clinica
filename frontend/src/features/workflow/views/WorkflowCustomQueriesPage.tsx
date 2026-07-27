import { useMemo, useState, type MouseEvent } from 'react'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import type { MenuProps } from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import {
    Button,
    Dropdown,
    Flex,
    Modal,
    Typography,
} from 'antd'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { WorkflowCustomQueryForm } from '../components/WorkflowCustomQueryForm'
import {
    useCreateWorkflowCustomQuery,
    useDeleteWorkflowCustomQuery,
    useUpdateWorkflowCustomQuery,
    useWorkflowCustomQueries,
} from '../hooks/useWorkflowCustomQueries'
import type { CreateWorkflowCustomQueryFormValues } from '../schemas/workflow.schemas'
import type { WorkflowCustomQuery } from '../types/workflow.types'

const { Text, Title } = Typography
const columnHelper = createColumnHelper<WorkflowCustomQuery>()
const DEFAULT_PAGE_SIZE = 20

type RowActionsProps = {
    entity: WorkflowCustomQuery
    deleting: boolean
    onEdit: () => void
    onDelete: () => void
}

function RowActions({ entity, deleting, onEdit, onDelete }: RowActionsProps) {
    const menuItems: MenuProps['items'] = [
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
                icon={<MoreOutlined />}
                loading={deleting}
                aria-label={`Acciones para ${entity.name}`}
                onClick={(event: MouseEvent) => event.stopPropagation()}
            />
        </Dropdown>
    )
}

export function WorkflowCustomQueriesPage() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editing, setEditing] = useState<WorkflowCustomQuery | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const query = useMemo(() => ({ page, pageSize }), [page, pageSize])
    const { data, isFetching } = useWorkflowCustomQueries(query)
    const createMutation = useCreateWorkflowCustomQuery()
    const updateMutation = useUpdateWorkflowCustomQuery()
    const deleteMutation = useDeleteWorkflowCustomQuery()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const isSaving = createMutation.isPending || updateMutation.isPending

    const columns = useMemo(
        () =>
            [
                columnHelper.accessor('code', { header: 'Código', size: 140 }),
                columnHelper.accessor('name', { header: 'Nombre' }),
                columnHelper.accessor('procedureName', {
                    header: 'Procedimiento',
                    size: 220,
                }),
                columnHelper.display({
                    id: 'actions',
                    header: '',
                    size: 48,
                    cell: ({ row }) => (
                        <RowActions
                            entity={row.original}
                            deleting={deletingId === row.original.id}
                            onEdit={() => {
                                setEditing(row.original)
                                setDrawerOpen(true)
                            }}
                            onDelete={() => {
                                Modal.confirm({
                                    title: 'Eliminar consulta',
                                    content: `¿Desea eliminar "${row.original.name}"?`,
                                    okText: 'Eliminar',
                                    okType: 'danger',
                                    cancelText: 'Cancelar',
                                    onOk: async () => {
                                        setDeletingId(row.original.id)
                                        try {
                                            await deleteMutation.mutateAsync(row.original.id)
                                        } finally {
                                            setDeletingId(null)
                                        }
                                    },
                                })
                            }}
                        />
                    ),
                }),
            ] as ColumnDef<WorkflowCustomQuery, unknown>[],
        [deleteMutation, deletingId],
    )

    const handleSubmit = async (values: CreateWorkflowCustomQueryFormValues) => {
        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: values })
        } else {
            await createMutation.mutateAsync(values)
        }

        setDrawerOpen(false)
        setEditing(null)
    }

    return (
        <div className="workflow-module">
            <Flex justify="space-between" align="flex-start" gap={16} wrap>
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Consultas personalizadas
                    </Title>
                    <Text type="secondary">
                        Procedimientos usados para asignar ejecutores de transiciones.
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null)
                        setDrawerOpen(true)
                    }}
                >
                    Nueva consulta
                </Button>
            </Flex>

            <div style={{ marginTop: 16 }}>
                <AppDataTable
                    data={items}
                    columns={columns}
                    loading={isFetching}
                    pagination={{
                        page,
                        pageSize,
                        total,
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage)
                            setPageSize(nextPageSize)
                        },
                    }}
                />
            </div>

            <WorkflowCustomQueryForm
                open={drawerOpen}
                entity={editing}
                loading={isSaving}
                onClose={() => {
                    if (isSaving) return
                    setDrawerOpen(false)
                    setEditing(null)
                }}
                onCreate={handleSubmit}
                onUpdate={handleSubmit}
            />
        </div>
    )
}
