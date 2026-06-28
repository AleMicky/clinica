import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import { pacientesService } from '../services/pacientes.service'
import type {
    CreatePacientePayload,
    UpdatePacientePayload,
} from '../types/paciente.types'

export function usePacientes(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.pacientes.list(query),
        queryFn: () => pacientesService.getPaged(query),
    })
}

export function usePersonasLookup() {
    return useAppQuery({
        queryKey: ['personas', 'lookup'] as const,
        queryFn: () =>
            pacientesService.getPersonasLookup({ page: 1, pageSize: 100 }),
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreatePaciente() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreatePacientePayload) => pacientesService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.all })
            notify.success('Paciente creado', 'El paciente se registró correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear paciente', getApiErrorMessage(error))
        },
    })
}

export function useUpdatePaciente() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePacientePayload }) =>
            pacientesService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.all })
            notify.success('Paciente actualizado', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar paciente', getApiErrorMessage(error))
        },
    })
}

export function useDeletePaciente() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => pacientesService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.pacientes.all })
            notify.success('Paciente eliminado', 'El paciente se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar paciente', getApiErrorMessage(error))
        },
    })
}
