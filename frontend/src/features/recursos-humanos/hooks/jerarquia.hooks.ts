import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { jerarquiaService } from '../services/jerarquia.service'

export function useJerarquiaOrganizacional(includeCounts = false) {
    return useAppQuery({
        queryKey: queryKeys.recursosHumanos.jerarquia.tree(includeCounts),
        queryFn: () => jerarquiaService.get({ includeCounts }),
    })
}
