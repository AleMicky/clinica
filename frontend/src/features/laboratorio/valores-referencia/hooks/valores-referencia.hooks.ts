import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { valoresReferenciaService } from '../services/valores-referencia.service'
import type {
    CreateValorReferenciaPayload,
    UpdateValorReferenciaPayload,
    ValorReferenciaPagedQuery,
} from '../types/valor-referencia.types'

export function useValoresReferencia(
    query: ValorReferenciaPagedQuery,
    enabled = true,
) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.valoresReferencia.list(query),
        queryFn: () => valoresReferenciaService.getPaged(query),
        enabled: enabled && Boolean(query.parametroId),
    })
}

export function useCreateValorReferencia() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CreateValorReferenciaPayload) =>
            valoresReferenciaService.create(data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.valoresReferencia.all,
            })
            notify.success(
                'Valor de referencia creado',
                'Registro guardado correctamente.',
            )
        },
        onError: (e) => notify.error('Error al crear', getApiErrorMessage(e)),
    })
}

export function useUpdateValorReferencia() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: UpdateValorReferenciaPayload
        }) => valoresReferenciaService.update(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.valoresReferencia.all,
            })
            notify.success(
                'Valor de referencia actualizado',
                'Los cambios se guardaron.',
            )
        },
        onError: (e) => notify.error('Error al actualizar', getApiErrorMessage(e)),
    })
}

export function useDeleteValorReferencia() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (id: string) => valoresReferenciaService.delete(id),
        onSuccess: () => {
            void qc.invalidateQueries({
                queryKey: queryKeys.laboratorio.valoresReferencia.all,
            })
            notify.success(
                'Valor de referencia eliminado',
                'Se eliminó correctamente.',
            )
        },
        onError: (e) => notify.error('Error al eliminar', getApiErrorMessage(e)),
    })
}
