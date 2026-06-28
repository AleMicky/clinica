import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { workflowService } from '../services/workflow.service'
import type {
    CreateWorkflowDefinitionPayload,
    UpdateWorkflowDefinitionPayload,
} from '../types/workflow.types'

export function useWorkflowDefinitions(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.workflow.definitions.list(query),
        queryFn: () => workflowService.getDefinitionsPaged(query),
    })
}

export function useWorkflowDefinition(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.workflow.definitions.detail(id ?? ''),
        queryFn: () => workflowService.getDefinitionById(id!),
        enabled: Boolean(id),
    })
}

export function useCreateWorkflowDefinition() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateWorkflowDefinitionPayload) => workflowService.createDefinition(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.definitions.all })
            notify.success('Workflow creado', 'La definición se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear workflow', getApiErrorMessage(error))
        },
    })
}

export function useUpdateWorkflowDefinition() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowDefinitionPayload }) =>
            workflowService.updateDefinition(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.definitions.all })
            notify.success('Workflow actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar workflow', getApiErrorMessage(error))
        },
    })
}

export function useDeleteWorkflowDefinition() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => workflowService.deleteDefinition(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.definitions.all })
            notify.success('Workflow eliminado', 'La definición se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar workflow', getApiErrorMessage(error))
        },
    })
}
