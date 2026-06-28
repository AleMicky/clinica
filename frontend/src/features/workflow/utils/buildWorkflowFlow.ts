import { MarkerType, type Edge, type Node } from '@xyflow/react'

import type { WorkflowState, WorkflowTransition } from '../types/workflow.types'

export const WORKFLOW_STATE_NODE_TYPE = 'workflowState' as const

export const WORKFLOW_NODE_WIDTH = 168
export const WORKFLOW_NODE_HEIGHT = 96
const HORIZONTAL_GAP = 132
const VERTICAL_GAP = 148
const MAIN_ROW_Y = 0
const ALTERNATE_ROW_Y = MAIN_ROW_Y + WORKFLOW_NODE_HEIGHT + VERTICAL_GAP

export type WorkflowStateNodeVariant = 'normal' | 'initial' | 'final' | 'alternate'

export type WorkflowStateNodeData = {
    state: WorkflowState
    variant: WorkflowStateNodeVariant
    onAddTransition?: (stateId: string) => void
}

export type WorkflowTransitionEdgeVariant = 'default' | 'alternate'

export type WorkflowTransitionEdgeData = {
    transition: WorkflowTransition
    variant: WorkflowTransitionEdgeVariant
}

export type WorkflowStateFlowNode = Node<WorkflowStateNodeData, typeof WORKFLOW_STATE_NODE_TYPE>
export type WorkflowTransitionFlowEdge = Edge<WorkflowTransitionEdgeData>

export function isNegativeTerminalState(state: WorkflowState): boolean {
    const text = `${state.code} ${state.name}`.toLowerCase()
    return /anulad|cancelad|cancel|rechazad|abort|descartad/.test(text)
}

function getStateVariant(state: WorkflowState): WorkflowStateNodeVariant {
    if (isNegativeTerminalState(state)) return 'alternate'
    if (state.isInitial) return 'initial'
    if (state.isFinal) return 'final'
    return 'normal'
}

function isAlternateTransition(
    transition: WorkflowTransition,
    statesById: Map<string, WorkflowState>,
): boolean {
    const toState = statesById.get(transition.toStateId)
    if (toState && isNegativeTerminalState(toState)) {
        return true
    }

    const label = `${transition.actionCode} ${transition.actionName}`.toLowerCase()
    return /anulad|cancelad|cancel|rechazad|abort|descartad/.test(label)
}

function buildMainRowStates(states: WorkflowState[]): WorkflowState[] {
    const initial = states
        .filter((state) => state.isInitial && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)
    const normal = states
        .filter((state) => !state.isInitial && !state.isFinal && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)
    const finals = states
        .filter((state) => state.isFinal && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)

    const placedIds = new Set([...initial, ...normal, ...finals].map((state) => state.id))
    const remaining = states
        .filter((state) => !placedIds.has(state.id) && !isNegativeTerminalState(state))
        .sort((a, b) => a.order - b.order)

    return [...initial, ...normal, ...remaining, ...finals]
}

function buildAlternateRowStates(states: WorkflowState[]): WorkflowState[] {
    return states.filter(isNegativeTerminalState).sort((a, b) => a.order - b.order)
}

function createStateNode(state: WorkflowState, x: number, y: number): WorkflowStateFlowNode {
    return {
        id: state.id,
        type: WORKFLOW_STATE_NODE_TYPE,
        position: { x, y },
        data: {
            state,
            variant: getStateVariant(state),
        },
        draggable: true,
        selectable: true,
        connectable: true,
    }
}

export function buildWorkflowFlow(
    states: WorkflowState[],
    transitions: WorkflowTransition[],
): { nodes: WorkflowStateFlowNode[]; edges: WorkflowTransitionFlowEdge[] } {
    const mainRowStates = buildMainRowStates(states)
    const alternateRowStates = buildAlternateRowStates(states)
    const statesById = new Map(states.map((state) => [state.id, state]))

    const nodes: WorkflowStateFlowNode[] = [
        ...mainRowStates.map((state, index) =>
            createStateNode(state, index * (WORKFLOW_NODE_WIDTH + HORIZONTAL_GAP), MAIN_ROW_Y),
        ),
        ...alternateRowStates.map((state, index) =>
            createStateNode(
                state,
                index * (WORKFLOW_NODE_WIDTH + HORIZONTAL_GAP),
                ALTERNATE_ROW_Y,
            ),
        ),
    ]

    const edges: WorkflowTransitionFlowEdge[] = transitions.map((transition) => {
        const alternate = isAlternateTransition(transition, statesById)
        const stroke = alternate ? '#f97316' : '#1677ff'

        return {
            id: transition.id,
            source: transition.fromStateId,
            target: transition.toStateId,
            label: transition.actionName,
            type: 'smoothstep',
            animated: transition.isActive,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: stroke,
            },
            style: {
                stroke,
                strokeWidth: alternate ? 1.5 : 2,
            },
            labelStyle: {
                fill: alternate ? '#c2410c' : '#0958d9',
                fontWeight: 500,
                fontSize: 11,
            },
            labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.92,
            },
            labelBgPadding: [6, 4] as [number, number],
            labelBgBorderRadius: 6,
            data: {
                transition,
                variant: alternate ? 'alternate' : 'default',
            },
            selectable: true,
        }
    })

    return { nodes, edges }
}
