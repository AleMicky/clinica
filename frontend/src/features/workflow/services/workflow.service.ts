import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { workflowEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type {
    CreateWorkflowDefinitionPayload,
    CreateWorkflowStatePayload,
    CreateWorkflowTransitionPayload,
    ExecuteWorkflowTransitionPayload,
    StartWorkflowInstancePayload,
    UpdateWorkflowDefinitionPayload,
    UpdateWorkflowStatePayload,
    UpdateWorkflowTransitionPayload,
    WorkflowAvailableAction,
    WorkflowDefinition,
    WorkflowHistoryEntry,
    WorkflowInstance,
    WorkflowState,
    WorkflowTransition,
} from '../types/workflow.types'

export class WorkflowService {
    getDefinitionsPaged(query: PagedQuery) {
        return getPaged<WorkflowDefinition>(workflowEndpoints.definitions.root, query)
    }

    getDefinitionById(id: string) {
        return get<WorkflowDefinition>(workflowEndpoints.definitions.byId(id))
    }

    createDefinition(data: CreateWorkflowDefinitionPayload) {
        return post<WorkflowDefinition, CreateWorkflowDefinitionPayload>(
            workflowEndpoints.definitions.root,
            data,
        )
    }

    updateDefinition(id: string, data: UpdateWorkflowDefinitionPayload) {
        return put<WorkflowDefinition, UpdateWorkflowDefinitionPayload>(
            workflowEndpoints.definitions.byId(id),
            data,
        )
    }

    deleteDefinition(id: string) {
        return del<void>(workflowEndpoints.definitions.byId(id))
    }

    getStatesByDefinition(definitionId: string) {
        return get<WorkflowState[]>(workflowEndpoints.states(definitionId))
    }

    createState(definitionId: string, data: CreateWorkflowStatePayload) {
        return post<WorkflowState, CreateWorkflowStatePayload>(
            workflowEndpoints.states(definitionId),
            data,
        )
    }

    updateState(id: string, data: UpdateWorkflowStatePayload) {
        return put<WorkflowState, UpdateWorkflowStatePayload>(
            workflowEndpoints.stateById(id),
            data,
        )
    }

    deleteState(id: string) {
        return del<void>(workflowEndpoints.stateById(id))
    }

    getTransitionsByDefinition(definitionId: string) {
        return get<WorkflowTransition[]>(workflowEndpoints.transitions(definitionId))
    }

    createTransition(definitionId: string, data: CreateWorkflowTransitionPayload) {
        return post<WorkflowTransition, CreateWorkflowTransitionPayload>(
            workflowEndpoints.transitions(definitionId),
            data,
        )
    }

    updateTransition(id: string, data: UpdateWorkflowTransitionPayload) {
        return put<WorkflowTransition, UpdateWorkflowTransitionPayload>(
            workflowEndpoints.transitionById(id),
            data,
        )
    }

    deleteTransition(id: string) {
        return del<void>(workflowEndpoints.transitionById(id))
    }

    startInstance(data: StartWorkflowInstancePayload) {
        return post<WorkflowInstance, StartWorkflowInstancePayload>(
            workflowEndpoints.instances.start,
            data,
        )
    }

    getInstanceById(id: string) {
        return get<WorkflowInstance>(workflowEndpoints.instances.byId(id))
    }

    getInstanceByReference(referenceModule: string, referenceEntity: string, referenceId: string) {
        return get<WorkflowInstance>(
            workflowEndpoints.instances.byReference(referenceModule, referenceEntity, referenceId),
        )
    }

    getAvailableActions(instanceId: string) {
        return get<WorkflowAvailableAction[]>(workflowEndpoints.instances.availableActions(instanceId))
    }

    executeTransition(instanceId: string, data: ExecuteWorkflowTransitionPayload) {
        return post<WorkflowInstance, ExecuteWorkflowTransitionPayload>(
            workflowEndpoints.instances.execute(instanceId),
            data,
        )
    }

    getHistory(instanceId: string) {
        return get<WorkflowHistoryEntry[]>(workflowEndpoints.instances.history(instanceId))
    }
}

export const workflowService = new WorkflowService()
