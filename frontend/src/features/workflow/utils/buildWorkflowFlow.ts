import { MarkerType, type Edge, type Node } from '@xyflow/react'

import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'

export const BPMN_START_NODE_TYPE = 'bpmnStartEvent' as const
export const BPMN_END_NODE_TYPE = 'bpmnEndEvent' as const
export const BPMN_TASK_NODE_TYPE = 'bpmnTask' as const
export const BPMN_GATEWAY_NODE_TYPE = 'bpmnExclusiveGateway' as const
export const BPMN_SEQUENCE_EDGE_TYPE = 'bpmnSequenceFlow' as const

/** @deprecated use BPMN_TASK_NODE_TYPE */
export const WORKFLOW_STATE_NODE_TYPE = BPMN_TASK_NODE_TYPE

export const BPMN_EVENT_SIZE = 56
export const BPMN_TASK_WIDTH = 180
export const BPMN_TASK_HEIGHT = 88
export const BPMN_GATEWAY_SIZE = 72

export const WORKFLOW_NODE_WIDTH = BPMN_TASK_WIDTH
export const WORKFLOW_NODE_HEIGHT = BPMN_TASK_HEIGHT

const HORIZONTAL_GAP = 120
const VERTICAL_GAP = 120
const MAIN_ROW_Y = 40
const ALTERNATE_ROW_Y = MAIN_ROW_Y + BPMN_TASK_HEIGHT + VERTICAL_GAP + 24

export type BpmnNodeKind = 'start' | 'task' | 'end' | 'gateway'

export type BpmnPaletteKind = 'start' | 'task' | 'end' | 'gateway'

export type WorkflowStateNodeVariant = 'normal' | 'initial' | 'final' | 'alternate' | 'gateway'

export type WorkflowStateNodeData = {
    state: WorkflowState
    variant: WorkflowStateNodeVariant
    kind: BpmnNodeKind
    outgoingCount: number
    onAddTransition?: (stateId: string) => void
}

export type WorkflowTransitionEdgeVariant = 'default' | 'alternate' | 'defaultFlow'

export type WorkflowTransitionEdgeData = {
    transition: WorkflowTransition
    variant: WorkflowTransitionEdgeVariant
}

export type BpmnFlowNodeType =
    | typeof BPMN_START_NODE_TYPE
    | typeof BPMN_END_NODE_TYPE
    | typeof BPMN_TASK_NODE_TYPE
    | typeof BPMN_GATEWAY_NODE_TYPE

export type WorkflowStateFlowNode = Node<WorkflowStateNodeData, BpmnFlowNodeType>
export type WorkflowTransitionFlowEdge = Edge<WorkflowTransitionEdgeData>

export function isNegativeTerminalState(state: WorkflowState): boolean {
    const text = `${state.code} ${state.name}`.toLowerCase()
    return /anulad|cancelad|cancel|rechazad|abort|descartad/.test(text)
}

function getStateVariant(state: WorkflowState): WorkflowStateNodeVariant {
    if (state.isGateway) return 'gateway'
    if (isNegativeTerminalState(state)) return 'alternate'
    if (state.isInitial) return 'initial'
    if (state.isFinal) return 'final'
    return 'normal'
}

export function getBpmnKind(state: WorkflowState): BpmnNodeKind {
    if (state.isGateway) return 'gateway'
    if (state.isInitial && !state.isFinal) return 'start'
    if (state.isFinal) return 'end'
    return 'task'
}

function getBpmnNodeType(kind: BpmnNodeKind): BpmnFlowNodeType {
    if (kind === 'start') return BPMN_START_NODE_TYPE
    if (kind === 'end') return BPMN_END_NODE_TYPE
    if (kind === 'gateway') return BPMN_GATEWAY_NODE_TYPE
    return BPMN_TASK_NODE_TYPE
}

function getNodeWidth(kind: BpmnNodeKind): number {
    if (kind === 'task') return BPMN_TASK_WIDTH
    if (kind === 'gateway') return BPMN_GATEWAY_SIZE
    return BPMN_EVENT_SIZE
}

function isAlternateTransition(
    transition: WorkflowTransition,
    statesById: Map<string, WorkflowState>,
): boolean {
    const toState = statesById.get(transition.toStateId)
    return toState ? isNegativeTerminalState(toState) : false
}

function buildMainRowStates(states: WorkflowState[]): WorkflowState[] {
    const initial = states
        .filter((state) => state.isInitial && !state.isFinal && !state.isGateway)
        .sort((a, b) => a.order - b.order)
    const normal = states
        .filter(
            (state) =>
                !state.isInitial &&
                !state.isFinal &&
                !state.isGateway &&
                !isNegativeTerminalState(state),
        )
        .sort((a, b) => a.order - b.order)
    const gateways = states
        .filter((state) => state.isGateway)
        .sort((a, b) => a.order - b.order)
    const finals = states
        .filter((state) => state.isFinal && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)

    const placedIds = new Set(
        [...initial, ...normal, ...gateways, ...finals].map((state) => state.id),
    )
    const remaining = states
        .filter((state) => !placedIds.has(state.id) && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)

    return [...initial, ...normal, ...gateways, ...remaining, ...finals]
}

function buildAlternateRowStates(states: WorkflowState[]): WorkflowState[] {
    return states.filter(isNegativeTerminalState).sort((a, b) => a.order - b.order)
}

function createStateNode(
    state: WorkflowState,
    x: number,
    y: number,
    outgoingCount: number,
    options?: { alignToTaskRow?: boolean },
): WorkflowStateFlowNode {
    const kind = getBpmnKind(state)
    const width = getNodeWidth(kind)
    const positionY =
        options?.alignToTaskRow && kind !== 'task'
            ? y + (BPMN_TASK_HEIGHT - width) / 2
            : y

    return {
        id: state.id,
        type: getBpmnNodeType(kind),
        position: { x, y: positionY },
        data: {
            state,
            variant: getStateVariant(state),
            kind,
            outgoingCount,
        },
        draggable: true,
        selectable: true,
        connectable: true,
        style: { width },
    }
}

function hasPersistedPosition(state: WorkflowState): boolean {
    return state.diagramX != null && state.diagramY != null
}

export function buildWorkflowFlow(
    states: WorkflowState[],
    transitions: WorkflowTransition[],
): { nodes: WorkflowStateFlowNode[]; edges: WorkflowTransitionFlowEdge[] } {
    const statesById = new Map(states.map((state) => [state.id, state]))

    const outgoingByState = new Map<string, number>()
    for (const transition of transitions) {
        outgoingByState.set(
            transition.fromStateId,
            (outgoingByState.get(transition.fromStateId) ?? 0) + 1,
        )
    }

    const stepX = BPMN_TASK_WIDTH + HORIZONTAL_GAP
    const nodes: WorkflowStateFlowNode[] = []

    const withPosition = states.filter(hasPersistedPosition)
    const withoutPosition = states.filter((state) => !hasPersistedPosition(state))

    for (const state of withPosition) {
        nodes.push(
            createStateNode(
                state,
                state.diagramX!,
                state.diagramY!,
                outgoingByState.get(state.id) ?? 0,
            ),
        )
    }

    if (withoutPosition.length > 0) {
        const mainRowStates = buildMainRowStates(withoutPosition)
        const alternateRowStates = buildAlternateRowStates(withoutPosition)
        const occupiedXs = withPosition.map((state) => state.diagramX!)
        const startX =
            occupiedXs.length > 0 ? Math.max(...occupiedXs) + stepX : 0

        nodes.push(
            ...mainRowStates.map((state, index) =>
                createStateNode(
                    state,
                    startX + index * stepX,
                    MAIN_ROW_Y,
                    outgoingByState.get(state.id) ?? 0,
                    { alignToTaskRow: true },
                ),
            ),
            ...alternateRowStates.map((state, index) =>
                createStateNode(
                    state,
                    startX + index * stepX,
                    ALTERNATE_ROW_Y,
                    outgoingByState.get(state.id) ?? 0,
                    { alignToTaskRow: true },
                ),
            ),
        )
    }

    const edges: WorkflowTransitionFlowEdge[] = transitions.map((transition) => {
        const alternate = isAlternateTransition(transition, statesById)
        const stroke = alternate ? '#ea580c' : '#334155'
        const fromOutgoing = outgoingByState.get(transition.fromStateId) ?? 0
        const fromState = statesById.get(transition.fromStateId)
        const isDefaultFlow =
            !alternate && fromOutgoing > 1 && !(fromState?.isGateway ?? false)

        return {
            id: transition.id,
            source: transition.fromStateId,
            target: transition.toStateId,
            type: BPMN_SEQUENCE_EDGE_TYPE,
            label: transition.name,
            animated: false,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 18,
                height: 18,
                color: stroke,
            },
            style: {
                stroke,
                strokeWidth: alternate ? 1.75 : 2.25,
                strokeDasharray: alternate ? '6 4' : undefined,
            },
            data: {
                transition,
                variant: alternate ? 'alternate' : isDefaultFlow ? 'defaultFlow' : 'default',
            },
            selectable: true,
        }
    })

    return { nodes, edges }
}

export function buildPaletteStateDefaults(
    kind: BpmnPaletteKind,
    states: WorkflowState[],
    position: { x: number; y: number },
): {
    code: string
    name: string
    isInitial: boolean
    isFinal: boolean
    isGateway: boolean
    color: string
    order: number
    diagramX: number
    diagramY: number
} {
    const order =
        states.reduce((max, state) => Math.max(max, state.order), -1) + 1
    const nextIndex = (prefix: string) => {
        const used = new Set(states.map((state) => state.code.toUpperCase()))
        if (!used.has(prefix)) return prefix
        let i = 2
        while (used.has(`${prefix}_${i}`)) i += 1
        return `${prefix}_${i}`
    }

    switch (kind) {
        case 'start':
            return {
                code: nextIndex('START'),
                name: 'Inicio',
                isInitial: true,
                isFinal: false,
                isGateway: false,
                color: '#2563eb',
                order,
                diagramX: position.x,
                diagramY: position.y,
            }
        case 'end':
            return {
                code: nextIndex('END'),
                name: 'Fin',
                isInitial: false,
                isFinal: true,
                isGateway: false,
                color: '#16a34a',
                order,
                diagramX: position.x,
                diagramY: position.y,
            }
        case 'gateway':
            return {
                code: nextIndex('XOR'),
                name: 'Gateway XOR',
                isInitial: false,
                isFinal: false,
                isGateway: true,
                color: '#ca8a04',
                order,
                diagramX: position.x,
                diagramY: position.y,
            }
        default:
            return {
                code: nextIndex('TASK'),
                name: `Tarea ${order + 1}`,
                isInitial: false,
                isFinal: false,
                isGateway: false,
                color: '#334155',
                order,
                diagramX: position.x,
                diagramY: position.y,
            }
    }
}
