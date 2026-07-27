import { memo, type MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PlusOutlined } from '@ant-design/icons'

import {
    BPMN_GATEWAY_SIZE,
    type WorkflowStateFlowNode,
} from '../../utils/buildWorkflowFlow'

function BpmnExclusiveGatewayNodeComponent({
    data,
    selected,
}: NodeProps<WorkflowStateFlowNode>) {
    const { state, onAddTransition } = data

    return (
        <div
            className={[
                'bpmn-node',
                'bpmn-node--gateway',
                selected ? 'bpmn-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ width: BPMN_GATEWAY_SIZE, height: BPMN_GATEWAY_SIZE }}
            title={`${state.name} (${state.code})`}
        >
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                className="bpmn-handle bpmn-handle--target"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="top-target"
                className="bpmn-handle bpmn-handle--target bpmn-handle--top"
            />

            <div className="bpmn-gateway">
                <div className="bpmn-gateway__diamond" aria-hidden>
                    <span className="bpmn-gateway__x">×</span>
                </div>
                <div className="bpmn-gateway__label">{state.name}</div>
                {onAddTransition ? (
                    <button
                        type="button"
                        className="bpmn-gateway__add nodrag nopan"
                        onClick={(event: MouseEvent) => {
                            event.stopPropagation()
                            onAddTransition(state.id)
                        }}
                    >
                        <PlusOutlined />
                    </button>
                ) : null}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="bpmn-handle bpmn-handle--source"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="bpmn-handle bpmn-handle--source bpmn-handle--bottom"
            />
        </div>
    )
}

export const BpmnExclusiveGatewayNode = memo(BpmnExclusiveGatewayNodeComponent)
BpmnExclusiveGatewayNode.displayName = 'BpmnExclusiveGatewayNode'
