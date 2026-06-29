import { useAppQuery } from '../../../shared/hooks/use-app-query'
import { queryKeys } from '../../../shared/constants/query-keys'
import { recepcionService } from '../services/recepcion.service'

export function useFormularioRecepcion(tipoAtencionId: string | undefined) {
    return useAppQuery({
        queryKey: queryKeys.atencionMedica.recepcion.formulario(tipoAtencionId ?? ''),
        queryFn: () => recepcionService.getFormulario(tipoAtencionId!),
        enabled: Boolean(tipoAtencionId),
    })
}
