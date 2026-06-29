import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { recepcionAtencionService } from '../services/atencion-medica.service'

export function useRecepcionPendientes() {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.recepcion.pendientes,
        queryFn: () => recepcionAtencionService.getPendientes(),
    })
}

export function useRecepcionAtencion(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.recepcion.detail(id ?? ''),
        queryFn: () => recepcionAtencionService.getById(id!),
        enabled: Boolean(id),
    })
}
