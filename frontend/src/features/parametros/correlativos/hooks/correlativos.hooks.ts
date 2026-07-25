import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { correlativosService } from '../services/correlativos.service'
import type {
    CorrelativoPagedQuery,
    GenerarCorrelativoPayload,
} from '../types/correlativo.types'

export function useCorrelativos(query: CorrelativoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.correlativos.list(query),
        queryFn: () => correlativosService.getPaged(query),
    })
}

export function useGenerarCorrelativo() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: (data: GenerarCorrelativoPayload) =>
            correlativosService.generar(data),
        onSuccess: (result) => {
            void qc.invalidateQueries({ queryKey: queryKeys.correlativos.all })
            notify.success(
                'Correlativo generado',
                `Número: ${result.numeroFormateado}`,
            )
        },
        onError: (e) => notify.error('Error al generar', getApiErrorMessage(e)),
    })
}
