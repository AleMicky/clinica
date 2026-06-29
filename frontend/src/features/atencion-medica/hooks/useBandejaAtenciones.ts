import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { bandejaService } from '../services/bandeja.service'

export function useEnfermeriaPendientes() {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.enfermeria.pendientes,
        queryFn: () => bandejaService.getPendientesEnfermeria(),
    })
}

export function useConsultaMedicaPendientes() {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.consultaMedica.pendientes,
        queryFn: () => bandejaService.getPendientesConsultaMedica(),
    })
}
