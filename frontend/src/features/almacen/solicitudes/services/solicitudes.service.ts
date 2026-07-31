import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
  AprobarSolicitudPayload,
  AtenderSolicitudPayload,
  CreateSolicitudPayload,
  Solicitud,
  SolicitudListItem,
} from '../types/solicitud.types'

export const solicitudesAlmacenService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<SolicitudListItem>(almacenEndpoints.solicitudes.root, query)
  },
  getById(id: string) {
    return get<Solicitud>(almacenEndpoints.solicitudes.byId(id))
  },
  create(data: CreateSolicitudPayload) {
    return post<Solicitud, CreateSolicitudPayload>(almacenEndpoints.solicitudes.root, data)
  },
  solicitar(id: string) {
    return post<Solicitud, Record<string, never>>(almacenEndpoints.solicitudes.solicitar(id), {})
  },
  aprobar(id: string, data: AprobarSolicitudPayload) {
    return post<Solicitud, AprobarSolicitudPayload>(almacenEndpoints.solicitudes.aprobar(id), data)
  },
  atender(id: string, data: AtenderSolicitudPayload) {
    return post<Solicitud, AtenderSolicitudPayload>(almacenEndpoints.solicitudes.atender(id), data)
  },
  rechazar(id: string) {
    return post<Solicitud, Record<string, never>>(almacenEndpoints.solicitudes.rechazar(id), {})
  },
  anular(id: string) {
    return post<Solicitud, Record<string, never>>(almacenEndpoints.solicitudes.anular(id), {})
  },
}
