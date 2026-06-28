import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { workflowService } from '../services/workflow.service'
import type {
    CreateWorkflowTransitionPayload,
    UpdateWorkflowTransitionPayload,
} from '../types/workflow.types'

export function useWorkflowTransitions(definitionId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.transitions.byDefinition(definitionId ?? ''),
        queryFn: () => workflowService.getTransitionsByDefinition(definitionId!),
        enabled: Boolean(definitionId),
    })
}

export function useCreateWorkflowTransition(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateWorkflowTransitionPayload) =>
            workflowService.createTransition(definitionId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.transitions.all })
            notify.success('Transición creada', 'La transición se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear transición', getApiErrorMessage(error))
        },
    })
}

export function useUpdateWorkflowTransition(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowTransitionPayload }) =>
            workflowService.updateTransition(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.workflow.transitions.byDefinition(definitionId),
            })
            notify.success('Transición actualizada', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar transición', getApiErrorMessage(error))
        },
    })
}

export function useDeleteWorkflowTransition(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => workflowService.deleteTransition(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.workflow.transitions.byDefinition(definitionId),
            })
            notify.success('Transición eliminada', 'La transición se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar transición', getApiErrorMessage(error))
        },
    })
}
