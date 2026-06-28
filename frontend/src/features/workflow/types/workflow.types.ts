export type EntityId = string

export type WorkflowDefinition = {
    id: EntityId
    code: string
    name: string
    description: string
    module: string
    entityName: string
    isActive: boolean
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowDefinitionPayload = {
    code: string
    name: string
    description: string
    module: string
    entityName: string
    isActive?: boolean
}

export type UpdateWorkflowDefinitionPayload = {
    code: string
    name: string
    description: string
    module: string
    entityName: string
    isActive: boolean
}

export type WorkflowState = {
    id: EntityId
    workflowDefinitionId: EntityId
    code: string
    name: string
    description: string
    isInitial: boolean
    isFinal: boolean
    color: string
    order: number
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowStatePayload = {
    code: string
    name: string
    description: string
    isInitial: boolean
    isFinal: boolean
    color: string
    order: number
}

export type UpdateWorkflowStatePayload = CreateWorkflowStatePayload

export type WorkflowTransition = {
    id: EntityId
    workflowDefinitionId: EntityId
    fromStateId: EntityId
    fromStateCode: string
    fromStateName: string
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    actionCode: string
    actionName: string
    description: string
    requiredRole: string | null
    requiresComment: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string | null
}

export type CreateWorkflowTransitionPayload = {
    fromStateId: EntityId
    toStateId: EntityId
    actionCode: string
    actionName: string
    description: string
    requiredRole?: string | null
    requiresComment: boolean
    isActive?: boolean
}

export type UpdateWorkflowTransitionPayload = {
    fromStateId: EntityId
    toStateId: EntityId
    actionCode: string
    actionName: string
    description: string
    requiredRole?: string | null
    requiresComment: boolean
    isActive: boolean
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
    correlative: number
    startedByUserId: EntityId
    startedByUserName: string
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
}

export type ExecuteWorkflowTransitionPayload = {
    actionCode: string
    comment?: string | null
}

export type WorkflowAvailableAction = {
    actionCode: string
    actionName: string
    description: string
    requiredRole: string | null
    requiresComment: boolean
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    toStateColor: string
}

export type WorkflowHistoryEntry = {
    id: EntityId
    fromStateId: EntityId
    fromStateCode: string
    fromStateName: string
    toStateId: EntityId
    toStateCode: string
    toStateName: string
    actionCode: string
    actionName: string
    comment: string | null
    performedByUserId: EntityId
    performedByUserName: string
    performedByRole: string | null
    performedAt: string
}
