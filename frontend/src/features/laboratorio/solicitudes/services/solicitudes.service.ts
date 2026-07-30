import { del, get, getPaged, post, put } from '../../../../shared/api/http'
import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import type {
    CreateSolicitudPayload,
    DerivarDetallePayload,
    EnviarACajaPayload,
    SetSolicitudEstadoPayload,
    Solicitud,
    SolicitudDetalle,
    SolicitudPagedQuery,
    UpdateSolicitudPayload,
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
    update(id: string, data: UpdateSolicitudPayload) {
        return put<Solicitud, UpdateSolicitudPayload>(
            laboratorioEndpoints.solicitudes.byId(id),
            data,
        )
    },
    setEstado(id: string, data: SetSolicitudEstadoPayload) {
        return put<Solicitud, SetSolicitudEstadoPayload>(
            laboratorioEndpoints.solicitudes.estado(id),
            data,
        )
    },
    delete(id: string) {
        return del<void>(laboratorioEndpoints.solicitudes.byId(id))
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
