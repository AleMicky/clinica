import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { especialidadesLabService } from '../services/especialidades.service'
import type {
    CreateEspecialidadLabPayload,
    UpdateEspecialidadLabPayload,
} from '../types/especialidad.types'

export function useEspecialidadesLab(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.especialidades.list(query),
        queryFn: () => especialidadesLabService.getPaged(query),
    })
}

export function useCreateEspecialidadLab() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateEspecialidadLabPayload) =>
            especialidadesLabService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.especialidades.all,
            })
            notify.success('Especialidad creada', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateEspecialidadLab() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateEspecialidadLabPayload
        }) => especialidadesLabService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.especialidades.all,
            })
            notify.success('Especialidad actualizada', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteEspecialidadLab() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => especialidadesLabService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.especialidades.all,
            })
            notify.success('Especialidad eliminada', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
