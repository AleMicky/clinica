import { useMemo, useState, type MouseEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
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
    SettingOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import {
    Button,
    Drawer,
    Dropdown,
    Flex,
    Modal,
    Tag,
    Typography,
} from 'antd'

import { queryKeys } from '../../../shared/constants/query-keys'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { AppDataTable } from '../../../shared/components/ui/data-table/AppDataTable'
import { WorkflowDefinitionForm } from '../components/WorkflowDefinitionForm'
import { WorkflowFlowView } from '../components/WorkflowFlowView'
import { WorkflowStateBadge } from '../components/WorkflowStateBadge'
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
    useUpdateWorkflowStatePosition,
    useWorkflowStates,
} from '../hooks/useWorkflowStates'
import {
    useCreateWorkflowTransition,
    useDeleteWorkflowTransition,
    useUpdateWorkflowTransition,
    useWorkflowTransitions,
} from '../hooks/useWorkflowTransitions'
import { useWorkflowCustomQueries } from '../hooks/useWorkflowCustomQueries'
import { workflowService } from '../services/workflow.service'
import type {
    CreateWorkflowDefinitionFormValues,
    CreateWorkflowStateFormValues,
    CreateWorkflowTransitionFormValues,
} from '../schemas/workflow.schemas'
import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'
import {
    buildPaletteStateDefaults,
    type BpmnPaletteKind,
} from '../utils/buildWorkflowFlow'

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
    const [definitionDrawerOpen, setDefinitionDrawerOpen] = useState(false)
    const [statesPanelOpen, setStatesPanelOpen] = useState(false)
    const [transitionsPanelOpen, setTransitionsPanelOpen] = useState(false)
    const [stateDrawerOpen, setStateDrawerOpen] = useState(false)
    const [transitionDrawerOpen, setTransitionDrawerOpen] = useState(false)
    const [editingState, setEditingState] = useState<WorkflowState | null>(null)
    const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null)
    const [deletingStateId, setDeletingStateId] = useState<string | null>(null)
    const [deletingTransitionId, setDeletingTransitionId] = useState<string | null>(null)
    const [flowSelectedStateId, setFlowSelectedStateId] = useState<string | null>(null)
    const [flowSelectedTransitionId, setFlowSelectedTransitionId] = useState<string | null>(null)
    const [deletingFlowSelection, setDeletingFlowSelection] = useState(false)
    const [flowTransitionDrawer, setFlowTransitionDrawer] =
        useState<FlowTransitionDrawerState>(closedFlowTransitionDrawer)
    const [deletingFlowTransitionId, setDeletingFlowTransitionId] = useState<string | null>(null)

    const queryClient = useQueryClient()
    const { data: definition, isFetching: loadingDefinition } = useWorkflowDefinition(definitionId)
    const { data: states = [], isFetching: loadingStates } = useWorkflowStates(definitionId)
    const { data: transitions = [], isFetching: loadingTransitions } =
        useWorkflowTransitions(definitionId)
    const { data: customQueriesPage } = useWorkflowCustomQueries({ page: 1, pageSize: 100 })
    const customQueries = customQueriesPage?.items ?? []

    const updateDefinition = useUpdateWorkflowDefinition()
    const createState = useCreateWorkflowState(definitionId)
    const updateState = useUpdateWorkflowState(definitionId)
    const updateStatePosition = useUpdateWorkflowStatePosition(definitionId)
    const deleteState = useDeleteWorkflowState(definitionId)
    const createTransition = useCreateWorkflowTransition(definitionId)
    const updateTransition = useUpdateWorkflowTransition(definitionId)
    const deleteTransition = useDeleteWorkflowTransition(definitionId)

    const isSavingDefinition = updateDefinition.isPending
    const isSavingState = createState.isPending || updateState.isPending
    const isSavingTransition = createTransition.isPending || updateTransition.isPending

    const stateColumns = useMemo(
        () =>
            [
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
                        if (state.isGateway) {
                            return <Tag color="gold">Gateway XOR</Tag>
                        }
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
        () =>
            [
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
                            {row.original.name}
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
                transitionColumnHelper.accessor('code', {
                    header: 'Código',
                    size: 140,
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
                                label={transition.name}
                                deleting={deletingTransitionId === transition.id}
                                onEdit={() => {
                                    setEditingTransition(transition)
                                    setTransitionDrawerOpen(true)
                                }}
                                onDelete={() => {
                                    Modal.confirm({
                                        title: 'Eliminar transición',
                                        content: `¿Desea eliminar "${transition.name}"?`,
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
        setFlowSelectedStateId(null)
        setFlowSelectedTransitionId(transition.id)
        setFlowTransitionDrawer({
            open: true,
            mode: 'edit',
            transition,
            lockFromState: false,
            lockToState: false,
        })
    }

    const handleCreateFromPalette = async (
        kind: BpmnPaletteKind,
        position: { x: number; y: number },
    ) => {
        if (kind === 'start' && states.some((state) => state.isInitial)) {
            notify.error(
                'Ya existe un inicio',
                'Solo puede haber un evento de inicio por definición.',
            )
            return
        }

        const payload = buildPaletteStateDefaults(kind, states, position)
        await createState.mutateAsync(payload)
    }

    const handleNodePositionChange = (stateId: string, position: { x: number; y: number }) => {
        void updateStatePosition.mutateAsync({
            id: stateId,
            data: { diagramX: position.x, diagramY: position.y },
        })
    }

    const deleteFlowSelection = async (stateIds: string[], transitionIds: string[]) => {
        const incidentTransitionIds = transitions
            .filter(
                (transition) =>
                    stateIds.includes(transition.fromStateId) ||
                    stateIds.includes(transition.toStateId),
            )
            .map((transition) => transition.id)

        const allTransitionIds = [...new Set([...transitionIds, ...incidentTransitionIds])]

        setDeletingFlowSelection(true)
        try {
            for (const id of allTransitionIds) {
                await workflowService.deleteTransition(id)
            }
            for (const id of stateIds) {
                await workflowService.deleteState(id)
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.workflow.states.byDefinition(definitionId),
                }),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.workflow.transitions.byDefinition(definitionId),
                }),
            ])

            setFlowSelectedStateId(null)
            setFlowSelectedTransitionId(null)
            notify.success('Selección eliminada', 'Los elementos se eliminaron del diagrama.')
        } catch (error) {
            notify.error('Error al eliminar', getApiErrorMessage(error))
        } finally {
            setDeletingFlowSelection(false)
        }
    }

    const confirmDeleteFlowSelection = (stateIds: string[], transitionIds: string[]) => {
        if (stateIds.length === 0 && transitionIds.length === 0) return

        const label =
            stateIds.length + transitionIds.length === 1
                ? 'el elemento seleccionado'
                : `${stateIds.length + transitionIds.length} elementos seleccionados`

        Modal.confirm({
            title: 'Eliminar del diagrama',
            content: `¿Desea eliminar ${label}? Las transiciones conectadas a estados también se eliminarán.`,
            okText: 'Eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: () => deleteFlowSelection(stateIds, transitionIds),
        })
    }

    return (
        <div className="workflow-module workflow-designer-page">
            <div className="workflow-module__header workflow-designer-page__toolbar">
                <Flex justify="space-between" align="center" wrap gap={12}>
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

                    <Flex gap={8} wrap align="center" className="workflow-designer-page__actions">
                        <Button
                            icon={<SettingOutlined />}
                            onClick={() => setDefinitionDrawerOpen(true)}
                            disabled={!definition}
                        >
                            Información
                        </Button>
                        <Button
                            icon={<NodeIndexOutlined />}
                            onClick={() => setStatesPanelOpen(true)}
                        >
                            Estados ({states.length})
                        </Button>
                        <Button
                            icon={<SwapOutlined />}
                            onClick={() => setTransitionsPanelOpen(true)}
                        >
                            Transiciones ({transitions.length})
                        </Button>
                    </Flex>
                </Flex>
            </div>

            <div className="workflow-designer-page__canvas">
                <WorkflowFlowView
                    definition={definition}
                    states={states}
                    transitions={transitions}
                    selectedStateId={flowSelectedStateId}
                    selectedTransitionId={flowSelectedTransitionId}
                    onStateSelect={(state) => {
                        setFlowSelectedStateId(state?.id ?? null)
                        if (state) setFlowSelectedTransitionId(null)
                    }}
                    onTransitionSelect={(transition) => {
                        setFlowSelectedTransitionId(transition?.id ?? null)
                        if (transition) {
                            setFlowSelectedStateId(null)
                        }
                    }}
                    onConnectStates={(fromStateId, toStateId) =>
                        openFlowTransitionCreate(fromStateId, toStateId)
                    }
                    onAddTransitionFrom={(fromStateId) =>
                        openFlowTransitionCreate(fromStateId, '', {
                            lockFromState: true,
                            lockToState: false,
                        })
                    }
                    onCreateFromPalette={(kind, position) => {
                        void handleCreateFromPalette(kind, position)
                    }}
                    onNodePositionChange={handleNodePositionChange}
                    onDeleteSelection={confirmDeleteFlowSelection}
                    onEditState={(state) => {
                        setEditingState(state)
                        setStateDrawerOpen(true)
                    }}
                    onDeleteState={(state) => confirmDeleteFlowSelection([state.id], [])}
                    onEditTransition={openFlowTransitionEdit}
                    onDeleteTransition={(transition) =>
                        confirmDeleteFlowSelection([], [transition.id])
                    }
                    deletingSelection={deletingFlowSelection}
                />
            </div>

            <Drawer
                title={`Estados (${states.length})`}
                open={statesPanelOpen}
                onClose={() => setStatesPanelOpen(false)}
                size={720}
                destroyOnHidden
                className="workflow-drawer"
                extra={
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
                }
            >
                <Text type="secondary" className="workflow-designer-page__panel-hint">
                    Vista técnica. Lo habitual es crear y editar desde el diagrama BPMN.
                </Text>
                <div className="workflow-module__table workflow-module__table--drawer">
                    <AppDataTable
                        data={states}
                        columns={stateColumns}
                        loading={loadingStates}
                        emptyText="No hay estados configurados."
                        getRowId={(row) => row.id}
                    />
                </div>
            </Drawer>

            <Drawer
                title={`Transiciones (${transitions.length})`}
                open={transitionsPanelOpen}
                onClose={() => setTransitionsPanelOpen(false)}
                size={860}
                destroyOnHidden
                className="workflow-drawer"
                extra={
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
                }
            >
                <Text type="secondary" className="workflow-designer-page__panel-hint">
                    Vista técnica de respaldo. La creación principal se hace conectando elementos
                    en el canvas.
                </Text>
                <div className="workflow-module__table workflow-module__table--drawer">
                    <AppDataTable
                        data={transitions}
                        columns={transitionColumns}
                        loading={loadingTransitions}
                        emptyText="No hay transiciones configuradas."
                        getRowId={(row) => row.id}
                    />
                </div>
            </Drawer>

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
                customQueries={customQueries}
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
                customQueries={customQueries}
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
        </div>
    )
}
