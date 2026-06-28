import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { personasService } from '../services/personas.service'
import type {
    CreatePersonaPayload,
    PersonaPagedQuery,
    UpdatePersonaPayload,
} from '../types/persona.types'

export function usePersonas(query: PersonaPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.personas.list(query),
        queryFn: () => personasService.getPaged(query),
    })
}

export function usePersonasLookup() {
    return useAppQuery({
        queryKey: queryKeys.personas.lookup,
        queryFn: () => personasService.getPaged({ page: 1, pageSize: 100 }),
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreatePersona() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreatePersonaPayload) => personasService.create(data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.personas.all })
            notify.success('Persona creada', 'El registro se guardó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al crear persona', getApiErrorMessage(error))
        },
    })
}

export function useUpdatePersona() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePersonaPayload }) =>
            personasService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.personas.all })
            notify.success('Persona actualizada', 'Los cambios se guardaron correctamente.')
        },
        onError: (error) => {
            notify.error('Error al actualizar persona', getApiErrorMessage(error))
        },
    })
}

export function useDeletePersona() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => personasService.delete(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.personas.all })
            notify.success('Persona eliminada', 'El registro se eliminó correctamente.')
        },
        onError: (error) => {
            notify.error('Error al eliminar persona', getApiErrorMessage(error))
        },
    })
}
