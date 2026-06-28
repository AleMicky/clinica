import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { empleadosService } from '../services/empleados.service'
import { medicosService } from '../services/medicos.service'
import type {
    CreateMedicoPayload,
    MedicoQuery,
    UpdateMedicoPayload,
} from '../types/medico.types'

export function useMedicos(query: MedicoQuery) {
    return useAppQuery({
        queryKey: queryKeys.medicos.list(query),
        queryFn: () => medicosService.getPaged(query),
    })
}

export function useEmpleadosLookup() {
    return useAppQuery({
        queryKey: queryKeys.empleados.lookup,
        queryFn: () => empleadosService.getPaged({ page: 1, pageSize: 200 }),
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreateMedico() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateMedicoPayload) => medicosService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.medicos.all })
            notify.success('Médico registrado', 'El médico se guardó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al registrar', getApiErrorMessage(error))
        },
    })
}

export function useUpdateMedico() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMedicoPayload }) =>
            medicosService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.medicos.all })
            notify.success('Médico actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar', getApiErrorMessage(error))
        },
    })
}

export function useDeleteMedico() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => medicosService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.medicos.all })
            notify.success('Médico eliminado', 'El registro se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar', getApiErrorMessage(error))
        },
    })
}
