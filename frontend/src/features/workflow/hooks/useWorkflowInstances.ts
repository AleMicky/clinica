import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { workflowService } from '../services/workflow.service'
import type {
    ExecuteWorkflowTransitionPayload,
    StartWorkflowInstancePayload,
    WorkflowInstance,
} from '../types/workflow.types'
import { isNotFoundError } from '../utils/is-not-found-error'

export function useWorkflowInstance(instanceId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.instances.detail(instanceId ?? ''),
        queryFn: () => workflowService.getInstanceById(instanceId!),
        enabled: Boolean(instanceId),
    })
}

/** Devuelve `null` si la entidad aún no tiene instancia (404), sin notificar error. */
export function useWorkflowInstanceByReference(
    referenceModule: string | undefined,
    referenceEntity: string | undefined,
    referenceId: string | undefined,
) {
    return useAppQuery({
        queryKey: queryKeys.workflow.instances.byReference(
            referenceModule ?? '',
            referenceEntity ?? '',
            referenceId ?? '',
        ),
        queryFn: async (): Promise<WorkflowInstance | null> => {
            try {
                return await workflowService.getInstanceByReference(
                    referenceModule!,
                    referenceEntity!,
                    referenceId!,
                )
            } catch (error) {
                if (isNotFoundError(error)) return null
                throw error
            }
        },
        enabled: Boolean(referenceModule && referenceEntity && referenceId),
    })
}

export function useWorkflowAvailableActions(instanceId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.instances.availableActions(instanceId ?? ''),
        queryFn: () => workflowService.getAvailableActions(instanceId!),
        enabled: Boolean(instanceId),
    })
}

export function useWorkflowAssignees(
    instanceId: string | undefined,
    transitionCode: string | undefined,
    page = 1,
    pageSize = 50,
) {
    return useAppQuery({
        queryKey: queryKeys.workflow.instances.assignees(
            instanceId ?? '',
            transitionCode ?? '',
            page,
            pageSize,
        ),
        queryFn: () =>
            workflowService.getAssignees(instanceId!, transitionCode!, page, pageSize),
        enabled: Boolean(instanceId && transitionCode),
    })
}

export function useWorkflowHistory(instanceId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.instances.history(instanceId ?? ''),
        queryFn: () => workflowService.getHistory(instanceId!),
        enabled: Boolean(instanceId),
    })
}

export function useStartWorkflowInstance() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: StartWorkflowInstancePayload) => workflowService.startInstance(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.instances.all })
            notify.success('Instancia iniciada', 'El workflow se inició correctamente.')
        },
        onError: (error) => {
            notify.error('Error al iniciar workflow', getApiErrorMessage(error))
        },
    })
}

export function useExecuteWorkflowTransition(instanceId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: ExecuteWorkflowTransitionPayload) =>
            workflowService.executeTransition(instanceId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.instances.all })
            notify.success('Transición ejecutada', 'El estado se actualizó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al ejecutar transición', getApiErrorMessage(error))
        },
    })
}
