import { memo, type MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PlusOutlined } from '@ant-design/icons'

import type { WorkflowStateFlowNode } from '../../utils/buildWorkflowFlow'

function BpmnStartEventNodeComponent({ data, selected }: NodeProps<WorkflowStateFlowNode>) {
    const { state, onAddTransition } = data

    return (
        <div
            className={[
                'bpmn-node',
                'bpmn-node--start',
                selected ? 'bpmn-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            title={`${state.name} (${state.code})`}
        >
            <div className="bpmn-event bpmn-event--start">
                <span className="bpmn-event__label">{state.name}</span>
            </div>
            {onAddTransition ? (
                <button
                    type="button"
                    className="bpmn-node__quick-add nodrag nopan"
                    aria-label="Agregar transición"
                    onClick={(event: MouseEvent) => {
                        event.stopPropagation()
                        onAddTransition(state.id)
                    }}
                >
                    <PlusOutlined />
                </button>
            ) : null}
            <Handle
                type="source"
                position={Position.Right}
                className="bpmn-handle bpmn-handle--source"
            />
        </div>
    )
}

export const BpmnStartEventNode = memo(BpmnStartEventNodeComponent)
BpmnStartEventNode.displayName = 'BpmnStartEventNode'
