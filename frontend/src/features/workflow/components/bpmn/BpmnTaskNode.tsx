import { memo, type MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PlusOutlined } from '@ant-design/icons'

import {
    BPMN_TASK_HEIGHT,
    BPMN_TASK_WIDTH,
    type WorkflowStateFlowNode,
} from '../../utils/buildWorkflowFlow'

function BpmnTaskNodeComponent({ data, selected }: NodeProps<WorkflowStateFlowNode>) {
    const { state, variant, outgoingCount, onAddTransition } = data
    const accentColor = state.color?.trim() || '#334155'
    const showsGateway = outgoingCount > 1

    return (
        <div
            className={[
                'bpmn-node',
                'bpmn-node--task',
                `bpmn-node--${variant}`,
                selected ? 'bpmn-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                width: BPMN_TASK_WIDTH,
                minHeight: BPMN_TASK_HEIGHT,
                ['--bpmn-accent' as string]: accentColor,
            }}
            title={`${state.name} (${state.code})`}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="bpmn-handle bpmn-handle--target"
            />

            <div className="bpmn-task">
                <div className="bpmn-task__header">
                    <span className="bpmn-task__marker" aria-hidden />
                    <span className="bpmn-task__type">Tarea</span>
                </div>
                <div className="bpmn-task__name">{state.name}</div>
                <div className="bpmn-task__code">{state.code}</div>
                {onAddTransition ? (
                    <button
                        type="button"
                        className="bpmn-task__add nodrag nopan"
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            onAddTransition(state.id)
                        }}
                    >
                        <PlusOutlined /> Flujo
                    </button>
                ) : null}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                className="bpmn-handle bpmn-handle--source"
            />
            {showsGateway ? (
                <Handle
                    type="source"
                    id="bottom"
                    position={Position.Bottom}
                    className="bpmn-handle bpmn-handle--source bpmn-handle--bottom"
                />
            ) : null}
        </div>
    )
}

export const BpmnTaskNode = memo(BpmnTaskNodeComponent)
BpmnTaskNode.displayName = 'BpmnTaskNode'
