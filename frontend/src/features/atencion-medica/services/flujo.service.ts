import type {
    AtencionFlujoCompletitud,
    AvanzarAtencionFlujoResult,
} from '../types/flujo.types'
import { get, post } from '../../../shared/api/http'
import { atencionMedicaEndpoints } from '../../../shared/api/endpoints'

export const atencionFlujoService = {
    getCompletitud(atencionId: string) {
        return get<AtencionFlujoCompletitud>(
            atencionMedicaEndpoints.atenciones.flujoCompletitud(atencionId),
        )
    },

    avanzar(atencionId: string) {
        return post<AvanzarAtencionFlujoResult, Record<string, never>>(
            atencionMedicaEndpoints.atenciones.flujoAvanzar(atencionId),
            {},
        )
    },
}
