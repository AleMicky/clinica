import { useQueryClient } from '@tanstack/react-query'

import { useAppMutation } from '../../../shared/hooks/use-app-mutation'
import { notify } from '../../../shared/utils/notify'
import { getApiErrorMessage } from '../../../shared/utils/api-error'
import { queryKeys } from '../../../shared/constants/query-keys'
import { recepcionService } from '../services/recepcion.service'
import type { CrearRecepcionAtencionPayload } from '../types/recepcion.types'

export function useCrearRecepcionAtencion() {
    const queryClient = useQueryClient()

    return useAppMutation({
        mutationFn: (data: CrearRecepcionAtencionPayload) => recepcionService.crear(data),
        onSuccess: (atencion) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.recepcion.all,
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.atencionMedica.atenciones.all,
            })
            notify.success(
                'Atención creada',
                `Número de atención: ${atencion.numeroAtencion} · Estado: ${atencion.estado}`,
            )
        },
        onError: (error) => {
            notify.error('Error al registrar recepción', getApiErrorMessage(error))
        },
    })
}
