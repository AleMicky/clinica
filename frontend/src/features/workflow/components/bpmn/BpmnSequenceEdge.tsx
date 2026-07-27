import { memo } from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type EdgeProps,
} from '@xyflow/react'

import type { WorkflowTransitionFlowEdge } from '../../utils/buildWorkflowFlow'

function BpmnSequenceEdgeComponent({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    label,
    data,
    selected,
}: EdgeProps<WorkflowTransitionFlowEdge>) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 12,
    })

    const variant = data?.variant ?? 'default'
    const requiresComment = data?.transition.requiresComment

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={style}
                className={[
                    'bpmn-sequence-edge',
                    `bpmn-sequence-edge--${variant}`,
                    selected ? 'bpmn-sequence-edge--selected' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            />
            {label ? (
                <EdgeLabelRenderer>
                    <div
                        className={[
                            'bpmn-sequence-label',
                            `bpmn-sequence-label--${variant}`,
                            selected ? 'bpmn-sequence-label--selected' : '',
                            requiresComment ? 'bpmn-sequence-label--comment' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        {String(label)}
                        {requiresComment ? <span className="bpmn-sequence-label__icon">*</span> : null}
                    </div>
                </EdgeLabelRenderer>
            ) : null}
        </>
    )
}

export const BpmnSequenceEdge = memo(BpmnSequenceEdgeComponent)
BpmnSequenceEdge.displayName = 'BpmnSequenceEdge'
