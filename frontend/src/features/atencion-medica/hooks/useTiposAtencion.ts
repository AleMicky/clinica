import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { tiposAtencionService } from '../services/atencion-medica.service'
import type { PagedQuery } from '../../../shared/types/pagination.types'

export function useTiposAtencion(query: PagedQuery = { page: 1, pageSize: 100 }) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.tiposAtencion.list(query),
        queryFn: () => tiposAtencionService.getPaged(query),
        staleTime: 5 * 60 * 1000,
    })
}
