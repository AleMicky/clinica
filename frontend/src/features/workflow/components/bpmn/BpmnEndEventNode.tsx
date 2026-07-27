import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

import type { WorkflowStateFlowNode } from '../../utils/buildWorkflowFlow'

function BpmnEndEventNodeComponent({ data, selected }: NodeProps<WorkflowStateFlowNode>) {
    const { state, variant } = data
    const isAlternate = variant === 'alternate'

    return (
        <div
            className={[
                'bpmn-node',
                'bpmn-node--end',
                isAlternate ? 'bpmn-node--end-alternate' : '',
                selected ? 'bpmn-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            title={`${state.name} (${state.code})`}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="bpmn-handle bpmn-handle--target"
            />
            <div
                className={[
                    'bpmn-event',
                    'bpmn-event--end',
                    isAlternate ? 'bpmn-event--end-alternate' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <span className="bpmn-event__ring" aria-hidden />
                <span className="bpmn-event__label">{state.name}</span>
            </div>
        </div>
    )
}

export const BpmnEndEventNode = memo(BpmnEndEventNodeComponent)
BpmnEndEventNode.displayName = 'BpmnEndEventNode'
