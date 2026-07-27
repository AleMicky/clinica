import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { workflowService } from '../services/workflow.service'
import type {
    CreateWorkflowCustomQueryPayload,
    UpdateWorkflowCustomQueryPayload,
} from '../types/workflow.types'

export function useWorkflowCustomQueries(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.workflow.customQueries.list(query),
        queryFn: () => workflowService.getCustomQueriesPaged(query),
    })
}

export function useCreateWorkflowCustomQuery() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateWorkflowCustomQueryPayload) =>
            workflowService.createCustomQuery(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.customQueries.all })
            notify.success('Consulta creada', 'La consulta personalizada se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear consulta', getApiErrorMessage(error))
        },
    })
}

export function useUpdateWorkflowCustomQuery() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowCustomQueryPayload }) =>
            workflowService.updateCustomQuery(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.customQueries.all })
            notify.success('Consulta actualizada', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar consulta', getApiErrorMessage(error))
        },
    })
}

export function useDeleteWorkflowCustomQuery() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => workflowService.deleteCustomQuery(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.workflow.customQueries.all })
            notify.success('Consulta eliminada', 'La consulta personalizada se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar consulta', getApiErrorMessage(error))
        },
    })
}
