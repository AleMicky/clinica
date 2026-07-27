import { get, getPaged, post } from '../../../../shared/api/http'
import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import type {
    CreateSolicitudPayload,
    DerivarDetallePayload,
    EnviarACajaPayload,
    Solicitud,
    SolicitudDetalle,
    SolicitudPagedQuery,
} from '../types/solicitud.types'

export const solicitudesService = {
    getPaged(query: SolicitudPagedQuery) {
        return getPaged<Solicitud>(laboratorioEndpoints.solicitudes.root, query)
    },
    getById(id: string) {
        return get<Solicitud>(laboratorioEndpoints.solicitudes.byId(id))
    },
    create(data: CreateSolicitudPayload) {
        return post<Solicitud, CreateSolicitudPayload>(
            laboratorioEndpoints.solicitudes.root,
            data,
        )
    },
    enviarACaja(id: string, data: EnviarACajaPayload) {
        return post<Solicitud, EnviarACajaPayload>(
            laboratorioEndpoints.solicitudes.enviarACaja(id),
            data,
        )
    },
    derivarDetalle(id: string, detalleId: string, data: DerivarDetallePayload) {
        return post<SolicitudDetalle, DerivarDetallePayload>(
            laboratorioEndpoints.solicitudes.derivar(id, detalleId),
            data,
        )
    },
}
