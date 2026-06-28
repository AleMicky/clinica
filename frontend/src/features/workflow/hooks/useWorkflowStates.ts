import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { workflowService } from '../services/workflow.service'
import type {
    CreateWorkflowStatePayload,
    UpdateWorkflowStatePayload,
} from '../types/workflow.types'

export function useWorkflowStates(definitionId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.states.byDefinition(definitionId ?? ''),
        queryFn: () => workflowService.getStatesByDefinition(definitionId!),
        enabled: Boolean(definitionId),
    })
}

export function useCreateWorkflowState(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateWorkflowStatePayload) =>
            workflowService.createState(definitionId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.states.all })
            notify.success('Estado creado', 'El estado se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear estado', getApiErrorMessage(error))
        },
    })
}

export function useUpdateWorkflowState(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowStatePayload }) =>
            workflowService.updateState(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.workflow.states.byDefinition(definitionId),
            })
            notify.success('Estado actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar estado', getApiErrorMessage(error))
        },
    })
}

export function useDeleteWorkflowState(definitionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => workflowService.deleteState(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.workflow.states.byDefinition(definitionId),
            })
            notify.success('Estado eliminado', 'El estado se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar estado', getApiErrorMessage(error))
        },
    })
}
