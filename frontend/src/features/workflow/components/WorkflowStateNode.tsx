import { memo, type MouseEvent } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Tag, Typography } from 'antd'

import {
    WORKFLOW_NODE_HEIGHT,
    WORKFLOW_NODE_WIDTH,
    WORKFLOW_STATE_NODE_TYPE,
    type WorkflowStateFlowNode,
} from '../utils/buildWorkflowFlow'

const { Text } = Typography

function WorkflowStateNodeComponent({ data, selected }: NodeProps<WorkflowStateFlowNode>) {
    const { state, variant, onAddTransition } = data
    const accentColor = state.color?.trim() || '#1677ff'

    const handleAddTransition = (event: MouseEvent) => {
        event.stopPropagation()
        onAddTransition?.(state.id)
    }

    return (
        <div
            className={[
                'workflow-state-node',
                `workflow-state-node--${variant}`,
                selected ? 'workflow-state-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                width: WORKFLOW_NODE_WIDTH,
                minHeight: WORKFLOW_NODE_HEIGHT,
                ['--workflow-node-color' as string]: accentColor,
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="workflow-state-node__handle workflow-state-node__handle--target"
            />
            <span className="workflow-state-node__accent" aria-hidden />
            <Text strong className="workflow-state-node__name" title={state.name}>
                {state.name}
            </Text>
            <Text type="secondary" className="workflow-state-node__code" title={state.code}>
                {state.code}
            </Text>
            <div className="workflow-state-node__tags">
                {state.isInitial ? (
                    <Tag color="blue" className="workflow-state-node__tag">
                        Inicial
                    </Tag>
                ) : null}
                {state.isFinal ? (
                    <Tag color="green" className="workflow-state-node__tag">
                        Final
                    </Tag>
                ) : null}
                {variant === 'alternate' ? (
                    <Tag color="orange" className="workflow-state-node__tag">
                        Alternativa
                    </Tag>
                ) : null}
            </div>
            {onAddTransition ? (
                <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    className="workflow-state-node__add-transition nodrag nopan"
                    onClick={handleAddTransition}
                >
                    Transición
                </Button>
            ) : null}
            <Handle
                type="source"
                position={Position.Right}
                className="workflow-state-node__handle workflow-state-node__handle--source"
            />
        </div>
    )
}

export const WorkflowStateNode = memo(WorkflowStateNodeComponent)
WorkflowStateNode.displayName = 'WorkflowStateNode'

export const workflowFlowNodeTypes = {
    [WORKFLOW_STATE_NODE_TYPE]: WorkflowStateNode,
}
