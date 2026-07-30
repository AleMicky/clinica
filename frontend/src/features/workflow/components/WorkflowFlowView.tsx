import { useCallback, useEffect, useMemo, useRef, type DragEvent } from 'react'
import {
    Background,
    BackgroundVariant,
    ConnectionLineType,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    SelectionMode,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
    type EdgeMouseHandler,
    type NodeMouseHandler,
    type OnNodeDrag,
    type OnSelectionChangeFunc,
} from '@xyflow/react'
import { Alert, Empty, Typography, message } from 'antd'

import type { WorkflowDefinition, WorkflowState, WorkflowTransition } from '../types/workflow.types'
import {
    buildWorkflowFlow,
    type BpmnPaletteKind,
    type WorkflowStateFlowNode,
    type WorkflowStateNodeData,
    type WorkflowTransitionFlowEdge,
} from '../utils/buildWorkflowFlow'
import { BpmnPalette, BPMN_PALETTE_DND_TYPE } from './bpmn/BpmnPalette'
import { BpmnPropertiesPanel } from './bpmn/BpmnPropertiesPanel'
import { bpmnEdgeTypes, bpmnNodeTypes } from './bpmn/bpmnRegistry'

const { Text } = Typography

type WorkflowFlowViewProps = {
    definition?: WorkflowDefinition | null
    states: WorkflowState[]
    transitions: WorkflowTransition[]
    selectedStateId?: string | null
    selectedTransitionId?: string | null
    onStateSelect?: (state: WorkflowState | null) => void
    onTransitionSelect?: (transition: WorkflowTransition | null) => void
    onConnectStates?: (fromStateId: string, toStateId: string) => void
    onAddTransitionFrom?: (fromStateId: string) => void
    onCreateFromPalette?: (
        kind: BpmnPaletteKind,
        position: { x: number; y: number },
    ) => void
    onNodePositionChange?: (stateId: string, position: { x: number; y: number }) => void
    onDeleteSelection?: (stateIds: string[], transitionIds: string[]) => void
    onEditState?: (state: WorkflowState) => void
    onDeleteState?: (state: WorkflowState) => void
    onEditTransition?: (transition: WorkflowTransition) => void
    onDeleteTransition?: (transition: WorkflowTransition) => void
    deletingSelection?: boolean
}

function mergeNodePositions(
    currentNodes: WorkflowStateFlowNode[],
    nextNodes: WorkflowStateFlowNode[],
): WorkflowStateFlowNode[] {
    const positionById = new Map(currentNodes.map((node) => [node.id, node.position]))
    return nextNodes.map((node) => ({
        ...node,
        position: positionById.get(node.id) ?? node.position,
    }))
}

function WorkflowFlowCanvas({
    states,
    transitions,
    selectedStateId,
    selectedTransitionId,
    onStateSelect,
    onTransitionSelect,
    onConnectStates,
    onAddTransitionFrom,
    onCreateFromPalette,
    onNodePositionChange,
    onDeleteSelection,
    onEditState,
    onDeleteState,
    onEditTransition,
    onDeleteTransition,
    deletingSelection,
}: Omit<WorkflowFlowViewProps, 'definition'>) {
    const { screenToFlowPosition, getNodes, getEdges, fitView } = useReactFlow()
    const selectedStateIdsRef = useRef<string[]>([])
    const selectedEdgeIdsRef = useRef<string[]>([])

    const { nodes: builtNodes, edges: builtEdges } = useMemo(
        () => buildWorkflowFlow(states, transitions),
        [states, transitions],
    )

    const nodesWithCallbacks = useMemo(
        () =>
            builtNodes.map((node) => ({
                ...node,
                selected: node.id === selectedStateId,
                data: {
                    ...node.data,
                    onAddTransition: onAddTransitionFrom,
                },
            })),
        [builtNodes, onAddTransitionFrom, selectedStateId],
    )

    const edgesWithSelection = useMemo(
        () =>
            builtEdges.map((edge) => ({
                ...edge,
                selected: edge.id === selectedTransitionId,
            })),
        [builtEdges, selectedTransitionId],
    )

    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowStateFlowNode>(nodesWithCallbacks)
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowTransitionFlowEdge>(
        edgesWithSelection,
    )

    useEffect(() => {
        setNodes((currentNodes) => mergeNodePositions(currentNodes, nodesWithCallbacks))
    }, [nodesWithCallbacks, setNodes])

    useEffect(() => {
        setEdges(edgesWithSelection)
    }, [edgesWithSelection, setEdges])

    const prevCountRef = useRef(0)
    useEffect(() => {
        const previous = prevCountRef.current
        prevCountRef.current = states.length
        if (previous === 0 && states.length > 0) {
            const frame = requestAnimationFrame(() => {
                void fitView({ padding: 0.28, maxZoom: 1.15, duration: 200 })
            })
            return () => cancelAnimationFrame(frame)
        }
    }, [fitView, states.length])

    const handleNodeClick: NodeMouseHandler<WorkflowStateFlowNode> = useCallback(
        (_event, node) => {
            onTransitionSelect?.(null)
            onStateSelect?.(node.data.state)
        },
        [onStateSelect, onTransitionSelect],
    )

    const handleEdgeClick: EdgeMouseHandler<WorkflowTransitionFlowEdge> = useCallback(
        (_event, edge) => {
            onStateSelect?.(null)
            if (edge.data?.transition) {
                onTransitionSelect?.(edge.data.transition)
            }
        },
        [onStateSelect, onTransitionSelect],
    )

    const handlePaneClick = useCallback(() => {
        onStateSelect?.(null)
        onTransitionSelect?.(null)
    }, [onStateSelect, onTransitionSelect])

    const handleSelectionChange: OnSelectionChangeFunc = useCallback(
        ({ nodes: selectedNodes, edges: selectedEdges }) => {
            selectedStateIdsRef.current = selectedNodes.map((node) => node.id)
            selectedEdgeIdsRef.current = selectedEdges.map((edge) => edge.id)

            if (selectedNodes.length === 1 && selectedEdges.length === 0) {
                const state = (selectedNodes[0] as WorkflowStateFlowNode).data.state
                onTransitionSelect?.(null)
                onStateSelect?.(state)
                return
            }

            if (selectedEdges.length === 1 && selectedNodes.length === 0) {
                const transition = (selectedEdges[0] as WorkflowTransitionFlowEdge).data
                    ?.transition
                onStateSelect?.(null)
                if (transition) onTransitionSelect?.(transition)
                return
            }

            if (selectedNodes.length === 0 && selectedEdges.length === 0) {
                return
            }

            onStateSelect?.(null)
            onTransitionSelect?.(null)
        },
        [onStateSelect, onTransitionSelect],
    )

    const handleConnect = useCallback(
        (connection: Connection) => {
            const { source, target } = connection
            if (!source || !target) return

            if (source === target) {
                void message.warning('No se puede crear un flujo hacia el mismo elemento.')
                return
            }

            const targetState = states.find((state) => state.id === target)
            if (targetState?.isInitial) {
                void message.warning('Un evento de inicio no puede recibir flujos de secuencia.')
                return
            }

            const sourceState = states.find((state) => state.id === source)
            if (sourceState?.isFinal && !sourceState.isInitial) {
                void message.warning('Un evento de fin no puede iniciar flujos de secuencia.')
                return
            }

            onConnectStates?.(source, target)
        },
        [onConnectStates, states],
    )

    const handleNodeDragStop: OnNodeDrag<WorkflowStateFlowNode> = useCallback(
        (_event, node) => {
            onNodePositionChange?.(node.id, node.position)
        },
        [onNodePositionChange],
    )

    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const dropAtClientPoint = useCallback(
        (kind: BpmnPaletteKind, clientX: number, clientY: number) => {
            const position = screenToFlowPosition({ x: clientX, y: clientY })
            onCreateFromPalette?.(kind, {
                x: Math.round(position.x / 16) * 16,
                y: Math.round(position.y / 16) * 16,
            })
        },
        [onCreateFromPalette, screenToFlowPosition],
    )

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            const kind = event.dataTransfer.getData(BPMN_PALETTE_DND_TYPE) as BpmnPaletteKind
            if (!kind) return
            dropAtClientPoint(kind, event.clientX, event.clientY)
        },
        [dropAtClientPoint],
    )

    const handleAddFromPalette = useCallback(
        (kind: BpmnPaletteKind) => {
            const bounds = document
                .querySelector('.workflow-flow-canvas--bpmn')
                ?.getBoundingClientRect()
            if (!bounds) {
                onCreateFromPalette?.(kind, { x: 80, y: 80 })
                return
            }
            dropAtClientPoint(kind, bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
        },
        [dropAtClientPoint, onCreateFromPalette],
    )

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Delete' && event.key !== 'Backspace') return

            const target = event.target as HTMLElement | null
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)
            ) {
                return
            }

            const selectedNodeIds =
                selectedStateIdsRef.current.length > 0
                    ? selectedStateIdsRef.current
                    : getNodes()
                          .filter((node) => node.selected)
                          .map((node) => node.id)
            const selectedEdgeIds =
                selectedEdgeIdsRef.current.length > 0
                    ? selectedEdgeIdsRef.current
                    : getEdges()
                          .filter((edge) => edge.selected)
                          .map((edge) => edge.id)

            if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return

            event.preventDefault()
            onDeleteSelection?.(selectedNodeIds, selectedEdgeIds)
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [getEdges, getNodes, onDeleteSelection])

    const selectedState = selectedStateId
        ? (states.find((state) => state.id === selectedStateId) ?? null)
        : null
    const selectedTransition = selectedTransitionId
        ? (transitions.find((transition) => transition.id === selectedTransitionId) ?? null)
        : null

    return (
        <div className="bpmn-designer">
            <div className="bpmn-designer__main">
                <BpmnPalette onAddElement={handleAddFromPalette} />

                {states.length === 0 ? (
                    <Alert
                        type="info"
                        showIcon
                        className="workflow-flow-view__alert"
                        message="Lienzo vacío"
                        description="Arrastre Inicio, Tarea, Fin o Gateway XOR desde la paleta para comenzar."
                    />
                ) : transitions.length === 0 ? (
                    <Alert
                        type="info"
                        showIcon
                        className="workflow-flow-view__alert"
                        message="Diagrama BPMN sin flujos"
                        description="Conecte elementos arrastrando desde el punto (●) de un nodo hacia otro."
                    />
                ) : (
                    <Text type="secondary" className="workflow-flow-view__hint">
                        Arrastre para desplazar · Shift + clic para multi-selección · Rueda para
                        desplazar · Pinch/Ctrl+rueda para zoom · Delete elimina
                    </Text>
                )}

                <div
                    className="workflow-flow-canvas workflow-flow-canvas--bpmn"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={bpmnNodeTypes}
                        edgeTypes={bpmnEdgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={handleNodeClick}
                        onEdgeClick={handleEdgeClick}
                        onPaneClick={handlePaneClick}
                        onSelectionChange={handleSelectionChange}
                        onConnect={handleConnect}
                        onNodeDragStop={handleNodeDragStop}
                        connectionLineType={ConnectionLineType.SmoothStep}
                        connectionLineStyle={{ stroke: '#334155', strokeWidth: 2 }}
                        nodesDraggable
                        nodesConnectable
                        elementsSelectable
                        selectionOnDrag={false}
                        selectionMode={SelectionMode.Partial}
                        multiSelectionKeyCode="Shift"
                        deleteKeyCode={null}
                        snapToGrid
                        snapGrid={[16, 16]}
                        panOnDrag
                        panOnScroll
                        zoomOnScroll={false}
                        zoomOnPinch
                        fitView
                        fitViewOptions={{ padding: 0.28, maxZoom: 1.15 }}
                        minZoom={0.3}
                        maxZoom={1.6}
                        defaultEdgeOptions={{
                            type: 'bpmnSequenceFlow',
                        }}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            id="bpmn-grid"
                            variant={BackgroundVariant.Lines}
                            gap={16}
                            size={1}
                            color="#e8edf3"
                        />
                        <Controls
                            showInteractive={false}
                            className="workflow-flow-canvas__controls"
                        />
                        <MiniMap
                            className="workflow-flow-canvas__minimap"
                            nodeColor={(node) => {
                                const data = node.data as WorkflowStateNodeData | undefined
                                if (data?.kind === 'start') return '#1677ff'
                                if (data?.kind === 'gateway') return '#ca8a04'
                                if (data?.kind === 'end') {
                                    return data.variant === 'alternate' ? '#ea580c' : '#16a34a'
                                }
                                return data?.state.color?.trim() || '#64748b'
                            }}
                            maskColor="rgba(248, 250, 252, 0.78)"
                        />
                    </ReactFlow>
                </div>
            </div>

            <BpmnPropertiesPanel
                state={selectedState}
                transition={selectedTransition}
                onEditState={onEditState}
                onDeleteState={onDeleteState}
                onEditTransition={onEditTransition}
                onDeleteTransition={onDeleteTransition}
                deleting={deletingSelection}
            />
        </div>
    )
}

export function WorkflowFlowView({
    definition,
    states,
    transitions,
    selectedStateId,
    selectedTransitionId,
    onStateSelect,
    onTransitionSelect,
    onConnectStates,
    onAddTransitionFrom,
    onCreateFromPalette,
    onNodePositionChange,
    onDeleteSelection,
    onEditState,
    onDeleteState,
    onEditTransition,
    onDeleteTransition,
    deletingSelection,
}: WorkflowFlowViewProps) {
    if (!definition) {
        return (
            <div className="workflow-flow-view workflow-flow-view--empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Seleccione un workflow para diseñar el diagrama."
                />
            </div>
        )
    }

    return (
        <div className="workflow-flow-view">
            <ReactFlowProvider>
                <WorkflowFlowCanvas
                    states={states}
                    transitions={transitions}
                    selectedStateId={selectedStateId}
                    selectedTransitionId={selectedTransitionId}
                    onStateSelect={onStateSelect}
                    onTransitionSelect={onTransitionSelect}
                    onConnectStates={onConnectStates}
                    onAddTransitionFrom={onAddTransitionFrom}
                    onCreateFromPalette={onCreateFromPalette}
                    onNodePositionChange={onNodePositionChange}
                    onDeleteSelection={onDeleteSelection}
                    onEditState={onEditState}
                    onDeleteState={onDeleteState}
                    onEditTransition={onEditTransition}
                    onDeleteTransition={onDeleteTransition}
                    deletingSelection={deletingSelection}
                />
            </ReactFlowProvider>
        </div>
    )
}
