import { useMemo, useState, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import {
    createColumnHelper,
    type ColumnDef,
} from '@tanstack/react-table'
import type { MenuProps } from 'antd'
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    NodeIndexOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import {
    Button,
    Descriptions,
    Dropdown,
    Flex,
    Modal,
    Tabs,
    Tag,
    Typography,
} from 'antd'

import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { WorkflowDefinitionForm } from '../components/WorkflowDefinitionForm'
import { WorkflowFlowView } from '../components/WorkflowFlowView'
import { WorkflowStateBadge } from '../components/WorkflowStateBadge'
import { WorkflowStateDrawer } from '../components/WorkflowStateDrawer'
import { WorkflowStateForm } from '../components/WorkflowStateForm'
import { WorkflowTransitionDrawer } from '../components/WorkflowTransitionDrawer'
import { WorkflowTransitionForm } from '../components/WorkflowTransitionForm'
import {
    useUpdateWorkflowDefinition,
    useWorkflowDefinition,
} from '../hooks/useWorkflowDefinitions'
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
    CreateWorkflowDefinitionFormValues,
    CreateWorkflowStateFormValues,
    CreateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'

const { Text, Title } = Typography

type WorkflowDesignerPageProps = {
    definitionId: string
}

const stateColumnHelper = createColumnHelper<WorkflowState>()
const transitionColumnHelper = createColumnHelper<WorkflowTransition>()

type RowActionsProps = {
    label: string
    onEdit: () => void
    onDelete: () => void
    deleting?: boolean
}

function RowActions({ label, onEdit, onDelete, deleting = false }: RowActionsProps) {
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
                className="workflow-module__row-actions"
                icon={<MoreOutlined />}
                loading={deleting}
                aria-label={`Acciones para ${label}`}
                onClick={(event: MouseEvent) => event.stopPropagation()}
            />
        </Dropdown>
    )
}

type FlowTransitionDrawerState = {
    open: boolean
    mode: 'create' | 'edit'
    transition: WorkflowTransition | null
    initialFromStateId?: string
    initialToStateId?: string
    lockFromState?: boolean
    lockToState?: boolean
}

const closedFlowTransitionDrawer: FlowTransitionDrawerState = {
    open: false,
    mode: 'create',
    transition: null,
}

export function WorkflowDesignerPage({ definitionId }: WorkflowDesignerPageProps) {
    const [activeTab, setActiveTab] = useState('general')
    const [definitionDrawerOpen, setDefinitionDrawerOpen] = useState(false)
    const [stateDrawerOpen, setStateDrawerOpen] = useState(false)
    const [transitionDrawerOpen, setTransitionDrawerOpen] = useState(false)
    const [editingState, setEditingState] = useState<WorkflowState | null>(null)
    const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null)
    const [deletingStateId, setDeletingStateId] = useState<string | null>(null)
    const [deletingTransitionId, setDeletingTransitionId] = useState<string | null>(null)
    const [flowStateDetail, setFlowStateDetail] = useState<WorkflowState | null>(null)
    const [flowTransitionDrawer, setFlowTransitionDrawer] =
        useState<FlowTransitionDrawerState>(closedFlowTransitionDrawer)
    const [deletingFlowTransitionId, setDeletingFlowTransitionId] = useState<string | null>(null)

    const { data: definition, isFetching: loadingDefinition } = useWorkflowDefinition(definitionId)
    const { data: states = [], isFetching: loadingStates } = useWorkflowStates(definitionId)
    const { data: transitions = [], isFetching: loadingTransitions } =
        useWorkflowTransitions(definitionId)

    const updateDefinition = useUpdateWorkflowDefinition()
    const createState = useCreateWorkflowState(definitionId)
    const updateState = useUpdateWorkflowState(definitionId)
    const deleteState = useDeleteWorkflowState(definitionId)
    const createTransition = useCreateWorkflowTransition(definitionId)
    const updateTransition = useUpdateWorkflowTransition(definitionId)
    const deleteTransition = useDeleteWorkflowTransition(definitionId)

    const isSavingDefinition = updateDefinition.isPending
    const isSavingState = createState.isPending || updateState.isPending
    const isSavingTransition = createTransition.isPending || updateTransition.isPending

    const stateColumns = useMemo(
        () => [
            stateColumnHelper.accessor('order', { header: 'Orden', size: 64 }),
            stateColumnHelper.accessor('code', { header: 'Código', size: 120 }),
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
            stateColumnHelper.display({
                id: 'stateType',
                header: 'Tipo',
                size: 120,
                cell: ({ row }) => {
                    const state = row.original
                    if (state.isInitial) {
                        return <Tag color="blue">Estado inicial</Tag>
                    }
                    if (state.isFinal) {
                        return <Tag color="green">Estado final</Tag>
                    }
                    return <Tag>Normal</Tag>
                },
            }),
            stateColumnHelper.display({
                id: 'actions',
                header: '',
                size: 56,
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const state = row.original

                    return (
                        <RowActions
                            label={state.name}
                            deleting={deletingStateId === state.id}
                            onEdit={() => {
                                setEditingState(state)
                                setStateDrawerOpen(true)
                            }}
                            onDelete={() => {
                                Modal.confirm({
                                    title: 'Eliminar estado',
                                    content: `¿Desea eliminar "${state.name}"?`,
                                    okText: 'Eliminar',
                                    okType: 'danger',
                                    cancelText: 'Cancelar',
                                    onOk: () => void handleDeleteState(state.id),
                                })
                            }}
                        />
                    )
                },
            }),
        ] as ColumnDef<WorkflowState, any>[],
        [deletingStateId],
    )

    const transitionColumns = useMemo(
        () => [
            transitionColumnHelper.accessor('fromStateName', {
                header: 'Origen',
                cell: ({ row }) => (
                    <WorkflowStateBadge
                        name={row.original.fromStateName}
                        code={row.original.fromStateCode}
                    />
                ),
            }),
            transitionColumnHelper.display({
                id: 'flow',
                header: 'Acción',
                cell: ({ row }) => (
                    <span className="workflow-module__transition-action">
                        {row.original.actionName}
                    </span>
                ),
            }),
            transitionColumnHelper.accessor('toStateName', {
                header: 'Destino',
                cell: ({ row }) => (
                    <WorkflowStateBadge
                        name={row.original.toStateName}
                        code={row.original.toStateCode}
                    />
                ),
            }),
            transitionColumnHelper.accessor('requiredRole', {
                header: 'Rol',
                size: 120,
                cell: ({ getValue }) => getValue() ?? '—',
            }),
            transitionColumnHelper.accessor('isActive', {
                header: 'Estado',
                size: 90,
                cell: ({ getValue }) => (
                    <Tag color={getValue() ? 'success' : 'default'}>
                        {getValue() ? 'Activa' : 'Inactiva'}
                    </Tag>
                ),
            }),
            transitionColumnHelper.display({
                id: 'actions',
                header: '',
                size: 56,
                meta: { align: 'right', headerAlign: 'right' },
                cell: ({ row }) => {
                    const transition = row.original

                    return (
                        <RowActions
                            label={transition.actionName}
                            deleting={deletingTransitionId === transition.id}
                            onEdit={() => {
                                setEditingTransition(transition)
                                setTransitionDrawerOpen(true)
                            }}
                            onDelete={() => {
                                Modal.confirm({
                                    title: 'Eliminar transición',
                                    content: `¿Desea eliminar "${transition.actionName}"?`,
                                    okText: 'Eliminar',
                                    okType: 'danger',
                                    cancelText: 'Cancelar',
                                    onOk: () => void handleDeleteTransition(transition.id),
                                })
                            }}
                        />
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

    const handleDefinitionSubmit = async (values: CreateWorkflowDefinitionFormValues) => {
        if (!definition) return

        await updateDefinition.mutateAsync({ id: definition.id, data: values })
        setDefinitionDrawerOpen(false)
    }

    const handleStateSubmit = async (values: CreateWorkflowStateFormValues) => {
        if (editingState) {
            await updateState.mutateAsync({ id: editingState.id, data: values })
        } else {
            await createState.mutateAsync(values)
        }

        setStateDrawerOpen(false)
        setEditingState(null)
    }

    const handleTransitionSubmit = async (values: CreateWorkflowTransitionFormValues) => {
        if (editingTransition) {
            await updateTransition.mutateAsync({ id: editingTransition.id, data: values })
        } else {
            await createTransition.mutateAsync(values)
        }

        setTransitionDrawerOpen(false)
        setEditingTransition(null)
    }

    const handleFlowTransitionSubmit = async (values: CreateWorkflowTransitionFormValues) => {
        if (flowTransitionDrawer.mode === 'edit' && flowTransitionDrawer.transition) {
            await updateTransition.mutateAsync({
                id: flowTransitionDrawer.transition.id,
                data: values,
            })
        } else {
            await createTransition.mutateAsync(values)
        }

        setFlowTransitionDrawer(closedFlowTransitionDrawer)
    }

    const handleFlowTransitionDelete = async (id: string) => {
        setDeletingFlowTransitionId(id)
        try {
            await deleteTransition.mutateAsync(id)
            setFlowTransitionDrawer(closedFlowTransitionDrawer)
        } finally {
            setDeletingFlowTransitionId(null)
        }
    }

    const openFlowTransitionCreate = (
        fromStateId: string,
        toStateId: string,
        options?: { lockFromState?: boolean; lockToState?: boolean },
    ) => {
        setFlowTransitionDrawer({
            open: true,
            mode: 'create',
            transition: null,
            initialFromStateId: fromStateId,
            initialToStateId: toStateId,
            lockFromState: options?.lockFromState ?? true,
            lockToState: options?.lockToState ?? true,
        })
    }

    const openFlowTransitionEdit = (transition: WorkflowTransition) => {
        setFlowTransitionDrawer({
            open: true,
            mode: 'edit',
            transition,
            lockFromState: false,
            lockToState: false,
        })
    }

    const tabItems = [
        {
            key: 'general',
            label: 'Información general',
            children: (
                <div className="workflow-module__tab-panel">
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap
                        gap={12}
                        className="workflow-module__action-bar"
                    >
                        <Text type="secondary">Datos principales del workflow</Text>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setDefinitionDrawerOpen(true)}
                            disabled={!definition}
                        >
                            Editar información
                        </Button>
                    </Flex>
                    <div className="workflow-module__general-body">
                        {definition ? (
                            <Descriptions
                                bordered
                                size="small"
                                column={{ xs: 1, sm: 2, lg: 3 }}
                                className="workflow-module__descriptions"
                            >
                                <Descriptions.Item label="Código">{definition.code}</Descriptions.Item>
                                <Descriptions.Item label="Nombre">{definition.name}</Descriptions.Item>
                                <Descriptions.Item label="Estado">
                                    <Tag color={definition.isActive ? 'success' : 'default'}>
                                        {definition.isActive ? 'Activo' : 'Inactivo'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Módulo">{definition.module}</Descriptions.Item>
                                <Descriptions.Item label="Entidad">{definition.entityName}</Descriptions.Item>
                                <Descriptions.Item label="Descripción" span={3}>
                                    {definition.description?.trim() || '—'}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Text type="secondary">Cargando información…</Text>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'states',
            label: `Estados (${states.length})`,
            children: (
                <div className="workflow-module__tab-panel">
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap
                        gap={12}
                        className="workflow-module__action-bar"
                    >
                        <Text type="secondary">
                            {states.length} estado{states.length === 1 ? '' : 's'} configurado
                            {states.length === 1 ? '' : 's'}
                        </Text>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingState(null)
                                setStateDrawerOpen(true)
                            }}
                        >
                            Nuevo estado
                        </Button>
                    </Flex>
                    <div className="workflow-module__table">
                        <AppDataTable
                            data={states}
                            columns={stateColumns}
                            loading={loadingStates}
                            emptyText="No hay estados configurados."
                            getRowId={(row) => row.id}
                        />
                    </div>
                </div>
            ),
        },
        {
            key: 'flow',
            label: 'Vista del flujo',
            children: (
                <div className="workflow-module__tab-panel workflow-module__tab-panel--flow">
                    <WorkflowFlowView
                        definition={definition}
                        states={states}
                        transitions={transitions}
                        onStateSelect={setFlowStateDetail}
                        onTransitionSelect={openFlowTransitionEdit}
                        onConnectStates={(fromStateId, toStateId) =>
                            openFlowTransitionCreate(fromStateId, toStateId)
                        }
                        onAddTransitionFrom={(fromStateId) =>
                            openFlowTransitionCreate(fromStateId, '', {
                                lockFromState: true,
                                lockToState: false,
                            })
                        }
                    />
                </div>
            ),
        },
        {
            key: 'transitions',
            label: `Transiciones (${transitions.length})`,
            children: (
                <div className="workflow-module__tab-panel">
                    <Flex
                        justify="space-between"
                        align="center"
                        wrap
                        gap={12}
                        className="workflow-module__action-bar"
                    >
                        <Text type="secondary">
                            Vista técnica de respaldo. La creación principal se realiza desde la
                            Vista del flujo.
                        </Text>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            disabled={states.length < 2}
                            onClick={() => {
                                setEditingTransition(null)
                                setTransitionDrawerOpen(true)
                            }}
                        >
                            Nueva transición
                        </Button>
                    </Flex>
                    <div className="workflow-module__table">
                        <AppDataTable
                            data={transitions}
                            columns={transitionColumns}
                            loading={loadingTransitions}
                            emptyText="No hay transiciones configuradas."
                            getRowId={(row) => row.id}
                        />
                    </div>
                </div>
            ),
        },
    ]

    return (
        <div className="workflow-module workflow-designer-page">
            <div className="workflow-module__header">
                <Flex justify="space-between" align="flex-start" wrap gap={12}>
                    <div className="workflow-module__header-main">
                        <Link to="/workflow">
                            <Button
                                type="link"
                                size="small"
                                icon={<ArrowLeftOutlined />}
                                className="workflow-module__back"
                            >
                                Volver al listado
                            </Button>
                        </Link>
                        <Flex align="center" gap={8} wrap>
                            <Title level={4} className="workflow-module__title">
                                {definition?.name ?? 'Cargando…'}
                            </Title>
                            {definition ? (
                                <Tag color={definition.isActive ? 'success' : 'default'}>
                                    {definition.isActive ? 'Activo' : 'Inactivo'}
                                </Tag>
                            ) : null}
                        </Flex>
                        <Flex gap={8} wrap className="workflow-module__meta">
                            <span className="workflow-module__meta-item">
                                <Text type="secondary">Código:</Text>{' '}
                                <Text>{definition?.code ?? '—'}</Text>
                            </span>
                            <span className="workflow-module__meta-divider" aria-hidden>
                                ·
                            </span>
                            <span className="workflow-module__meta-item">
                                <Text type="secondary">Módulo:</Text>{' '}
                                <Text>{definition?.module ?? '—'}</Text>
                            </span>
                            <span className="workflow-module__meta-divider" aria-hidden>
                                ·
                            </span>
                            <span className="workflow-module__meta-item">
                                <Text type="secondary">Entidad:</Text>{' '}
                                <Text>{definition?.entityName ?? '—'}</Text>
                            </span>
                        </Flex>
                    </div>

                    <Flex gap={8} wrap className="workflow-module__stats">
                        <span className="workflow-module__stat">
                            <NodeIndexOutlined />
                            {states.length} estado{states.length === 1 ? '' : 's'}
                        </span>
                        <span className="workflow-module__stat">
                            {transitions.length} transición
                            {transitions.length === 1 ? '' : 'es'}
                        </span>
                    </Flex>
                </Flex>
            </div>

            <div className="workflow-module__card">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="workflow-module__tabs"
                    size="small"
                />
            </div>

            <WorkflowDefinitionForm
                open={definitionDrawerOpen}
                definition={definition ?? null}
                loading={isSavingDefinition || loadingDefinition}
                onClose={() => {
                    if (isSavingDefinition) return
                    setDefinitionDrawerOpen(false)
                }}
                onCreate={handleDefinitionSubmit}
                onUpdate={handleDefinitionSubmit}
            />

            <WorkflowStateForm
                open={stateDrawerOpen}
                state={editingState}
                loading={isSavingState}
                onClose={() => {
                    if (isSavingState) return
                    setStateDrawerOpen(false)
                    setEditingState(null)
                }}
                onCreate={handleStateSubmit}
                onUpdate={handleStateSubmit}
            />

            <WorkflowTransitionForm
                open={transitionDrawerOpen}
                transition={editingTransition}
                states={states}
                loading={isSavingTransition}
                onClose={() => {
                    if (isSavingTransition) return
                    setTransitionDrawerOpen(false)
                    setEditingTransition(null)
                }}
                onCreate={handleTransitionSubmit}
                onUpdate={handleTransitionSubmit}
            />

            <WorkflowTransitionDrawer
                open={flowTransitionDrawer.open}
                mode={flowTransitionDrawer.mode}
                transition={flowTransitionDrawer.transition}
                states={states}
                existingTransitions={transitions}
                initialFromStateId={flowTransitionDrawer.initialFromStateId}
                initialToStateId={flowTransitionDrawer.initialToStateId}
                lockFromState={flowTransitionDrawer.lockFromState}
                lockToState={flowTransitionDrawer.lockToState}
                loading={isSavingTransition}
                deleting={Boolean(deletingFlowTransitionId)}
                onClose={() => {
                    if (isSavingTransition || deletingFlowTransitionId) return
                    setFlowTransitionDrawer(closedFlowTransitionDrawer)
                }}
                onCreate={handleFlowTransitionSubmit}
                onUpdate={handleFlowTransitionSubmit}
                onDelete={
                    flowTransitionDrawer.mode === 'edit'
                        ? handleFlowTransitionDelete
                        : undefined
                }
            />

            <WorkflowStateDrawer
                open={Boolean(flowStateDetail)}
                state={flowStateDetail}
                onClose={() => setFlowStateDetail(null)}
                onEdit={(state) => {
                    setEditingState(state)
                    setStateDrawerOpen(true)
                }}
            />
        </div>
    )
}
