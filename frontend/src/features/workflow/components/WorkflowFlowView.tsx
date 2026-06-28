import { useCallback, useEffect, useMemo } from 'react'
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    type Connection,
    type EdgeMouseHandler,
    type NodeMouseHandler,
} from '@xyflow/react'
import { Alert, Card, Empty, Typography, message } from 'antd'

import type { WorkflowDefinition, WorkflowState, WorkflowTransition } from '../types/workflow.types'
import {
    buildWorkflowFlow,
    type WorkflowStateFlowNode,
    type WorkflowStateNodeData,
    type WorkflowTransitionFlowEdge,
} from '../utils/buildWorkflowFlow'
import { workflowFlowNodeTypes } from './WorkflowStateNode'

const { Text } = Typography

type WorkflowFlowViewProps = {
    definition?: WorkflowDefinition | null
    states: WorkflowState[]
    transitions: WorkflowTransition[]
    onStateSelect?: (state: WorkflowState) => void
    onTransitionSelect?: (transition: WorkflowTransition) => void
    onConnectStates?: (fromStateId: string, toStateId: string) => void
    onAddTransitionFrom?: (fromStateId: string) => void
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
    onStateSelect,
    onTransitionSelect,
    onConnectStates,
    onAddTransitionFrom,
}: Omit<WorkflowFlowViewProps, 'definition'>) {
    const { nodes: builtNodes, edges: builtEdges } = useMemo(
        () => buildWorkflowFlow(states, transitions),
        [states, transitions],
    )

    const nodesWithCallbacks = useMemo(
        () =>
            builtNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onAddTransition: onAddTransitionFrom,
                },
            })),
        [builtNodes, onAddTransitionFrom],
    )

    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowStateFlowNode>(nodesWithCallbacks)
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowTransitionFlowEdge>(builtEdges)

    useEffect(() => {
        setNodes((currentNodes) => mergeNodePositions(currentNodes, nodesWithCallbacks))
    }, [nodesWithCallbacks, setNodes])

    useEffect(() => {
        setEdges(builtEdges)
    }, [builtEdges, setEdges])

    const handleNodeClick: NodeMouseHandler<WorkflowStateFlowNode> = useCallback(
        (_event, node) => {
            onStateSelect?.(node.data.state)
        },
        [onStateSelect],
    )

    const handleEdgeClick: EdgeMouseHandler<WorkflowTransitionFlowEdge> = useCallback(
        (_event, edge) => {
            if (edge.data?.transition) {
                onTransitionSelect?.(edge.data.transition)
            }
        },
        [onTransitionSelect],
    )

    const handleConnect = useCallback(
        (connection: Connection) => {
            const { source, target } = connection
            if (!source || !target) return

            if (source === target) {
                void message.warning('No se puede crear una transición hacia el mismo estado.')
                return
            }

            onConnectStates?.(source, target)
        },
        [onConnectStates],
    )

    return (
        <>
            {transitions.length === 0 ? (
                <Alert
                    type="info"
                    showIcon
                    className="workflow-flow-view__alert"
                    message="Aún no hay transiciones configuradas."
                    description="Arrastra desde un nodo hacia otro para crear una transición."
                />
            ) : (
                <Text type="secondary" className="workflow-flow-view__hint">
                    Arrastra desde un nodo hacia otro para crear una transición. Haz clic en una
                    línea para editarla o en un nodo para ver su detalle.
                </Text>
            )}

            <div className="workflow-flow-canvas">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={workflowFlowNodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    onConnect={handleConnect}
                    nodesDraggable
                    nodesConnectable
                    elementsSelectable
                    panOnDrag
                    zoomOnScroll
                    fitView
                    fitViewOptions={{ padding: 0.22, maxZoom: 1.2 }}
                    minZoom={0.35}
                    maxZoom={1.5}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background gap={20} size={1} color="#e2e8f0" />
                    <Controls showInteractive={false} className="workflow-flow-canvas__controls" />
                    <MiniMap
                        className="workflow-flow-canvas__minimap"
                        nodeColor={(node) => {
                            const data = node.data as WorkflowStateNodeData | undefined
                            const variant = data?.variant
                            if (variant === 'initial') return '#1677ff'
                            if (variant === 'final') return '#52c41a'
                            if (variant === 'alternate') return '#f97316'
                            return '#94a3b8'
                        }}
                        maskColor="rgba(248, 250, 252, 0.82)"
                    />
                </ReactFlow>
            </div>
        </>
    )
}

export function WorkflowFlowView({
    definition,
    states,
    transitions,
    onStateSelect,
    onTransitionSelect,
    onConnectStates,
    onAddTransitionFrom,
}: WorkflowFlowViewProps) {
    if (!definition) {
        return (
            <Card size="small" className="workflow-flow-view__card" title="Vista del flujo">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Seleccione un workflow para visualizar el proceso."
                />
            </Card>
        )
    }

    if (states.length === 0) {
        return (
            <Card size="small" className="workflow-flow-view__card" title="Vista del flujo">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aún no hay estados configurados. Cree estados en la pestaña Estados."
                />
            </Card>
        )
    }

    return (
        <Card
            size="small"
            className="workflow-flow-view__card"
            title="Diseñador del flujo"
            extra={
                <Text type="secondary" className="workflow-flow-view__legend">
                    {states.length} estado{states.length === 1 ? '' : 's'} ·{' '}
                    {transitions.length} transición
                    {transitions.length === 1 ? '' : 'es'}
                </Text>
            }
        >
            <ReactFlowProvider>
                <WorkflowFlowCanvas
                    states={states}
                    transitions={transitions}
                    onStateSelect={onStateSelect}
                    onTransitionSelect={onTransitionSelect}
                    onConnectStates={onConnectStates}
                    onAddTransitionFrom={onAddTransitionFrom}
                />
            </ReactFlowProvider>
        </Card>
    )
}
