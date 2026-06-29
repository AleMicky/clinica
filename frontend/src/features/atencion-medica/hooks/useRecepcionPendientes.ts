import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { recepcionService } from '../services/recepcion.service'

export function useRecepcionPendientes() {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.recepcion.pendientes,
        queryFn: () => recepcionService.getPendientes(),
    })
}

export function useRecepcionAtencion(id: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.recepcion.detail(id ?? ''),
        queryFn: () => recepcionService.getById(id!),
        enabled: Boolean(id),
    })
}
