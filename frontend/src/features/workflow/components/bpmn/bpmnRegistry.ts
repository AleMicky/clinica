import {
    BPMN_END_NODE_TYPE,
    BPMN_GATEWAY_NODE_TYPE,
    BPMN_SEQUENCE_EDGE_TYPE,
    BPMN_START_NODE_TYPE,
    BPMN_TASK_NODE_TYPE,
} from '../../utils/buildWorkflowFlow'
import { BpmnEndEventNode } from './BpmnEndEventNode'
import { BpmnExclusiveGatewayNode } from './BpmnExclusiveGatewayNode'
import { BpmnSequenceEdge } from './BpmnSequenceEdge'
import { BpmnStartEventNode } from './BpmnStartEventNode'
import { BpmnTaskNode } from './BpmnTaskNode'

export { BpmnTaskNode }

export const bpmnNodeTypes = {
    [BPMN_START_NODE_TYPE]: BpmnStartEventNode,
    [BPMN_END_NODE_TYPE]: BpmnEndEventNode,
    [BPMN_TASK_NODE_TYPE]: BpmnTaskNode,
    [BPMN_GATEWAY_NODE_TYPE]: BpmnExclusiveGatewayNode,
}

export const bpmnEdgeTypes = {
    [BPMN_SEQUENCE_EDGE_TYPE]: BpmnSequenceEdge,
}

/** Compatibilidad con import previo */
export const workflowFlowNodeTypes = bpmnNodeTypes
