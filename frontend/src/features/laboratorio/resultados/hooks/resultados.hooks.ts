import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../../shared/constants/query-keys'
import { notify } from '../../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../../shared/utils/api-error'
import { resultadosService } from '../services/resultados.service'
import type {
    RegistrarResultadosPayload,
    ResultadoPagedQuery,
    ValidarResultadoPayload,
} from '../types/resultado.types'

export function useResultados(query: ResultadoPagedQuery) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.resultados.list(query),
        queryFn: () => resultadosService.getPaged(query),
    })
}

export function useResultado(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.laboratorio.resultados.detail(id ?? ''),
        queryFn: () => resultadosService.getById(id!),
        enabled: Boolean(id),
    })
}

export function useRegistrarResultados() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            solicitudId,
            data,
        }: {
            solicitudId: string
            data: RegistrarResultadosPayload
        }) => resultadosService.registrar(solicitudId, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.resultados.all })
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Resultados registrados', 'Los resultados se registraron correctamente.')
        },
        onError: (e) => notify.error('Error al registrar resultados', getApiErrorMessage(e)),
    })
}

export function useValidarResultado() {
    const qc = useQueryClient()

    return useAppMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: ValidarResultadoPayload
        }) => resultadosService.validar(id, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.resultados.all })
            void qc.invalidateQueries({ queryKey: queryKeys.laboratorio.solicitudes.all })
            notify.success('Resultado validado', 'El resultado se validó correctamente.')
        },
        onError: (e) => notify.error('Error al validar', getApiErrorMessage(e)),
    })
}
