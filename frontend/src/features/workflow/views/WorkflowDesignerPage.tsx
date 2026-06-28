import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import {
    Button,
    Card,
    Flex,
    Popconfirm,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd'
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from '@ant-design/icons'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { WorkflowStateBadge } from '../components/WorkflowStateBadge'
import { WorkflowStateForm } from '../components/WorkflowStateForm'
import { WorkflowTransitionForm } from '../components/WorkflowTransitionForm'
import { useWorkflowDefinition } from '../hooks/useWorkflowDefinitions'
import {
    useCreateWorkflowState,
    useDeleteWorkflowState,
    useUpdateWorkflowState,
    useWorkflowStates,
} from '../hooks/useWorkflowStates'
import {
    useCreateWorkflowTransition,
    useDeleteWorkflowTransition,
    useUpdateWorkflowTransition,
    useWorkflowTransitions,
} from '../hooks/useWorkflowTransitions'
import type {
    CreateWorkflowStateFormValues,
    CreateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'

const { Title, Text } = Typography

type WorkflowDesignerPageProps = {
    definitionId: string
}

const stateColumnHelper = createColumnHelper<WorkflowState>()
const transitionColumnHelper = createColumnHelper<WorkflowTransition>()

export function WorkflowDesignerPage({ definitionId }: WorkflowDesignerPageProps) {
    const { token } = theme.useToken()

    const [stateModalOpen, setStateModalOpen] = useState(false)
    const [transitionModalOpen, setTransitionModalOpen] = useState(false)
    const [editingState, setEditingState] = useState<WorkflowState | null>(null)
    const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null)
    const [deletingStateId, setDeletingStateId] = useState<string | null>(null)
    const [deletingTransitionId, setDeletingTransitionId] = useState<string | null>(null)

    const { data: definition } = useWorkflowDefinition(definitionId)
    const { data: states = [], isFetching: loadingStates } = useWorkflowStates(definitionId)
    const { data: transitions = [], isFetching: loadingTransitions } =
        useWorkflowTransitions(definitionId)

    const createState = useCreateWorkflowState(definitionId)
    const updateState = useUpdateWorkflowState(definitionId)
    const deleteState = useDeleteWorkflowState(definitionId)
    const createTransition = useCreateWorkflowTransition(definitionId)
    const updateTransition = useUpdateWorkflowTransition(definitionId)
    const deleteTransition = useDeleteWorkflowTransition(definitionId)

    const isSavingState = createState.isPending || updateState.isPending
    const isSavingTransition = createTransition.isPending || updateTransition.isPending

    const stateColumns = useMemo(
        () => [
            stateColumnHelper.accessor('order', { header: 'Orden', size: 70 }),
            stateColumnHelper.accessor('code', { header: 'Código' }),
            stateColumnHelper.accessor('name', {
                header: 'Estado',
                cell: ({ row }) => (
                    <WorkflowStateBadge
                        name={row.original.name}
                        color={row.original.color}
                        code={row.original.code}
                    />
                ),
            }),
            stateColumnHelper.accessor('isInitial', {
                header: 'Inicial',
                cell: ({ getValue }) => (getValue() ? <Tag color="blue">Sí</Tag> : '—'),
            }),
            stateColumnHelper.accessor('isFinal', {
                header: 'Final',
                cell: ({ getValue }) => (getValue() ? <Tag color="green">Sí</Tag> : '—'),
            }),
            stateColumnHelper.display({
                id: 'actions',
                header: 'Acciones',
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const state = row.original
                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingState(state)
                                    setStateModalOpen(true)
                                }}
                            />
                            <Popconfirm
                                title="Eliminar estado"
                                description={`¿Desea eliminar "${state.name}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                onConfirm={() => void handleDeleteState(state.id)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deletingStateId === state.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<WorkflowState, any>[],
        [deletingStateId],
    )

    const transitionColumns = useMemo(
        () => [
            transitionColumnHelper.accessor('fromStateName', {
                header: 'Desde',
                cell: ({ row }) => (
                    <WorkflowStateBadge name={row.original.fromStateName} code={row.original.fromStateCode} />
                ),
            }),
            transitionColumnHelper.accessor('actionName', { header: 'Acción' }),
            transitionColumnHelper.accessor('toStateName', {
                header: 'Hacia',
                cell: ({ row }) => (
                    <WorkflowStateBadge name={row.original.toStateName} code={row.original.toStateCode} />
                ),
            }),
            transitionColumnHelper.accessor('requiredRole', {
                header: 'Rol requerido',
                cell: ({ getValue }) => getValue() ?? '—',
            }),
            transitionColumnHelper.accessor('isActive', {
                header: 'Activa',
                cell: ({ getValue }) => (
                    <Tag color={getValue() ? 'success' : 'default'}>
                        {getValue() ? 'Sí' : 'No'}
                    </Tag>
                ),
            }),
            transitionColumnHelper.display({
                id: 'actions',
                header: 'Acciones',
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const transition = row.original
                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingTransition(transition)
                                    setTransitionModalOpen(true)
                                }}
                            />
                            <Popconfirm
                                title="Eliminar transición"
                                description={`¿Desea eliminar "${transition.actionName}"?`}
                                okText="Eliminar"
                                cancelText="Cancelar"
                                onConfirm={() => void handleDeleteTransition(transition.id)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deletingTransitionId === transition.id}
                                />
                            </Popconfirm>
                        </Space>
                    )
                },
            }),
        ] as ColumnDef<WorkflowTransition, any>[],
        [deletingTransitionId],
    )

    const handleDeleteState = async (id: string) => {
        setDeletingStateId(id)
        try {
            await deleteState.mutateAsync(id)
        } finally {
            setDeletingStateId(null)
        }
    }

    const handleDeleteTransition = async (id: string) => {
        setDeletingTransitionId(id)
        try {
            await deleteTransition.mutateAsync(id)
        } finally {
            setDeletingTransitionId(null)
        }
    }

    const handleStateSubmit = async (values: CreateWorkflowStateFormValues) => {
        if (editingState) {
            await updateState.mutateAsync({ id: editingState.id, data: values })
        } else {
            await createState.mutateAsync(values)
        }

        setStateModalOpen(false)
        setEditingState(null)
    }

    const handleTransitionSubmit = async (values: CreateWorkflowTransitionFormValues) => {
        if (editingTransition) {
            await updateTransition.mutateAsync({ id: editingTransition.id, data: values })
        } else {
            await createTransition.mutateAsync(values)
        }

        setTransitionModalOpen(false)
        setEditingTransition(null)
    }

    return (
        <div className="workflow-designer-page">
            <Flex vertical gap={16}>
                <Flex justify="space-between" align="center" wrap gap={16}>
                    <div>
                        <Link to="/workflow">
                            <Button type="link" icon={<ArrowLeftOutlined />} style={{ paddingInlineStart: 0 }}>
                                Volver al listado
                            </Button>
                        </Link>
                        <Title level={3} style={{ margin: 0 }}>
                            Diseñador de workflow
                        </Title>
                        <Text type="secondary">
                            {definition?.name ?? 'Cargando…'} · {definition?.code ?? ''}
                        </Text>
                    </div>
                </Flex>

                <Card
                    title="Estados"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingState(null)
                                setStateModalOpen(true)
                            }}
                        >
                            Nuevo estado
                        </Button>
                    }
                    style={{ background: token.colorBgContainer }}
                >
                    <AppDataTable
                        data={states}
                        columns={stateColumns}
                        loading={loadingStates}
                        emptyText="No hay estados configurados."
                        getRowId={(row) => row.id}
                    />
                </Card>

                <Card
                    title="Transiciones"
                    extra={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingTransition(null)
                                setTransitionModalOpen(true)
                            }}
                            disabled={states.length < 2}
                        >
                            Nueva transición
                        </Button>
                    }
                    style={{ background: token.colorBgContainer }}
                >
                    <AppDataTable
                        data={transitions}
                        columns={transitionColumns}
                        loading={loadingTransitions}
                        emptyText="No hay transiciones configuradas."
                        getRowId={(row) => row.id}
                    />
                </Card>
            </Flex>

            <WorkflowStateForm
                open={stateModalOpen}
                state={editingState}
                loading={isSavingState}
                onClose={() => {
                    if (isSavingState) return
                    setStateModalOpen(false)
                    setEditingState(null)
                }}
                onCreate={handleStateSubmit}
                onUpdate={handleStateSubmit}
            />

            <WorkflowTransitionForm
                open={transitionModalOpen}
                transition={editingTransition}
                states={states}
                loading={isSavingTransition}
                onClose={() => {
                    if (isSavingTransition) return
                    setTransitionModalOpen(false)
                    setEditingTransition(null)
                }}
                onCreate={handleTransitionSubmit}
                onUpdate={handleTransitionSubmit}
            />
        </div>
    )
}
