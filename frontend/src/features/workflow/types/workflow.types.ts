export type EntityId = string

export type WorkflowAssignmentType = 1 | 2 | 3

export const WorkflowAssignmentType = {
    Area: 1,
    EmployeeList: 2,
    StoredProcedure: 3,
} as const

export type WorkflowDefinition = {
    id: EntityId
    code: string
    name: string
    module: string
    entityName: string
    isActive: boolean
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowDefinitionPayload = {
    code: string
    name: string
    module: string
    entityName: string
    isActive?: boolean
}

export type UpdateWorkflowDefinitionPayload = {
    code: string
    name: string
    module: string
    entityName: string
    isActive: boolean
}

export type WorkflowCustomQuery = {
    id: EntityId
    code: string
    name: string
    description: string | null
    procedureName: string
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowCustomQueryPayload = {
    code: string
    name: string
    description?: string | null
    procedureName: string
}

export type UpdateWorkflowCustomQueryPayload = CreateWorkflowCustomQueryPayload

export type WorkflowState = {
    id: EntityId
    workflowDefinitionId: EntityId
    code: string
    name: string
    isInitial: boolean
    isFinal: boolean
    isGateway: boolean
    color: string
    order: number
    diagramX: number | null
    diagramY: number | null
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowStatePayload = {
    code: string
    name: string
    isInitial: boolean
    isFinal: boolean
    isGateway: boolean
    color: string
    order: number
    diagramX?: number | null
    diagramY?: number | null
}

export type UpdateWorkflowStatePayload = CreateWorkflowStatePayload

export type UpdateWorkflowStatePositionPayload = {
    diagramX: number
    diagramY: number
}

export type WorkflowTransitionAssignment = {
    id: EntityId
    type: WorkflowAssignmentType
    areaId: EntityId | null
    workflowCustomQueryId: EntityId | null
    workflowCustomQueryCode: string | null
    workflowCustomQueryName: string | null
    employeeIds: EntityId[]
}

export type WorkflowTransitionAssignmentPayload = {
    type: WorkflowAssignmentType
    areaId?: EntityId | null
    workflowCustomQueryId?: EntityId | null
    employeeIds?: EntityId[] | null
}

export type WorkflowTransition = {
    id: EntityId
    workflowDefinitionId: EntityId
    fromStateId: EntityId
    fromStateCode: string
    fromStateName: string
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    code: string
    name: string
    requiresComment: boolean
    isActive: boolean
    assignment: WorkflowTransitionAssignment | null
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowTransitionPayload = {
    fromStateId: EntityId
    toStateId: EntityId
    code: string
    name: string
    requiresComment: boolean
    isActive?: boolean
    assignment?: WorkflowTransitionAssignmentPayload | null
}

export type UpdateWorkflowTransitionPayload = {
    fromStateId: EntityId
    toStateId: EntityId
    code: string
    name: string
    requiresComment: boolean
    isActive: boolean
    assignment?: WorkflowTransitionAssignmentPayload | null
}

export type WorkflowInstance = {
    id: EntityId
    workflowDefinitionId: EntityId
    workflowDefinitionCode: string
    workflowDefinitionName: string
    referenceModule: string
    referenceEntity: string
    referenceId: EntityId
    currentStateId: EntityId
    currentStateCode: string
    currentStateName: string
    currentStateColor: string
    startedByEmployeeId: EntityId
    startedAt: string
    finishedAt: string | null
    isCompleted: boolean
    createdAt: string
    updatedAt: string | null
}

export type StartWorkflowInstancePayload = {
    workflowDefinitionCode: string
    referenceModule: string
    referenceEntity: string
    referenceId: EntityId
    employeeId: EntityId
}

export type ExecuteWorkflowTransitionPayload = {
    code: string
    employeeId: EntityId
    comment?: string | null
}

export type WorkflowAvailableAction = {
    code: string
    name: string
    requiresComment: boolean
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    toStateColor: string
    assignmentType: WorkflowAssignmentType | null
    workflowCustomQueryId: EntityId | null
}

export type WorkflowAssignableEmployee = {
    employeeId: EntityId
    employeeName: string
}

export type WorkflowHistoryEntry = {
    id: EntityId
    workflowTransitionId: EntityId | null
    transitionCode: string | null
    transitionName: string | null
    fromStateId: EntityId
    fromStateCode: string
    fromStateName: string
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    executedByEmployeeId: EntityId
    comment: string | null
    performedAt: string
}
