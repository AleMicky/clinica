import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { muestrasService } from '../services/muestras.service'
import type { MuestraPagedQuery, TomarMuestraPayload } from '../types/muestra.types'

export function useMuestras(query: MuestraPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.muestras.list(query),
        queryFn: () => muestrasService.getPaged(query),
    })
}

export function useMuestra(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.muestras.detail(id ?? ''),
        queryFn: () => muestrasService.getById(id!),
        enabled: Boolean(id),
    })
}

export function useTomarMuestra() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            solicitudId,
            data,
        }: {
            solicitudId: string
            data: TomarMuestraPayload
        }) => muestrasService.tomarMuestra(solicitudId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.muestras.all })
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Muestra registrada', 'La muestra se registró correctamente.')
        },
        onError: (e) => notify.error('Error al registrar muestra', getApiErrorMessage(e)),
    })
}
