import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { parametrosService } from '../services/parametros.service'
import type {
    CreateParametroPayload,
    ParametroPagedQuery,
    UpdateParametroPayload,
} from '../types/parametro.types'

export function useParametros(query: ParametroPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.parametros.list(query),
        queryFn: () => parametrosService.getPaged(query),
    })
}

export function useCreateParametro() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateParametroPayload) => parametrosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.parametros.all })
            notify.success('Parámetro creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateParametro() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateParametroPayload
        }) => parametrosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.parametros.all })
            notify.success('Parámetro actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteParametro() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => parametrosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.parametros.all })
            notify.success('Parámetro eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
