import { get, getPaged, post } from '../../../../shared/api/http'
import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import type {
    Muestra,
    MuestraPagedQuery,
    TomarMuestraPayload,
} from '../types/muestra.types'

export const muestrasService = {
    getPaged(query: MuestraPagedQuery) {
        return getPaged<Muestra>(laboratorioEndpoints.muestras.root, query)
    },
    getById(id: string) {
        return get<Muestra>(laboratorioEndpoints.muestras.byId(id))
    },
    tomarMuestra(solicitudId: string, data: TomarMuestraPayload) {
        return post<Muestra, TomarMuestraPayload>(
            laboratorioEndpoints.solicitudes.tomarMuestra(solicitudId),
            data,
        )
    },
}
