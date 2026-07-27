import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import { laboratoriosExternosService } from '../services/laboratorios-externos.service'
import type {
    CreateLaboratorioExternoPayload,
    UpdateLaboratorioExternoPayload,
} from '../types/laboratorio-externo.types'

export function useLaboratoriosExternos(query: PagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.laboratoriosExternos.list(query),
        queryFn: () => laboratoriosExternosService.getPaged(query),
    })
}

export function useCreateLaboratorioExterno() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateLaboratorioExternoPayload) =>
            laboratoriosExternosService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.laboratoriosExternos.all,
            })
            notify.success('Laboratorio externo creado', 'Registro guardado correctamente.')
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateLaboratorioExterno() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateLaboratorioExternoPayload
        }) => laboratoriosExternosService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.laboratoriosExternos.all,
            })
            notify.success('Laboratorio externo actualizado', 'Los cambios se guardaron.')
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteLaboratorioExterno() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => laboratoriosExternosService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.laboratoriosExternos.all,
            })
            notify.success('Laboratorio externo eliminado', 'Se eliminó correctamente.')
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
