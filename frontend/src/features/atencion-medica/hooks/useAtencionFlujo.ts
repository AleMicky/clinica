import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../../../shared/constants/query-keys'
import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { notify } from '../../../shared/utils/notify'
import { atencionFlujoService } from '../services/flujo.service'

export function useAtencionFlujoCompletitud(atencionId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.flujo.completitud(atencionId ?? ''),
        queryFn: () => atencionFlujoService.getCompletitud(atencionId!),
        enabled: Boolean(atencionId),
    })
}

export function useAvanzarAtencionFlujo(atencionId: string) {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: () => atencionFlujoService.avanzar(atencionId),
        onSuccess: (result) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.flujo.completitud(atencionId),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.atenciones.detail(atencionId),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.workflow.instances.all,
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.enfermeria.pendientes,
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.consultaMedica.pendientes,
            })
            notify.success(
                'Flujo actualizado',
                `La atención pasó de ${result.estadoAnterior} a ${result.estadoNuevo}.`,
            )
        },
        onError: (error) => {
            notify.error('No se pudo avanzar el flujo', getApiErrorMessage(error))
        },
    })
}
