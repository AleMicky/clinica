import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
  CreateTransferenciaPayload,
  Transferencia,
  TransferenciaListItem,
} from '../types/transferencia.types'

export const transferenciasAlmacenService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<TransferenciaListItem>(almacenEndpoints.transferencias.root, query)
  },
  getById(id: string) {
    return get<Transferencia>(almacenEndpoints.transferencias.byId(id))
  },
  create(data: CreateTransferenciaPayload) {
    return post<Transferencia, CreateTransferenciaPayload>(
      almacenEndpoints.transferencias.root,
      data,
    )
  },
  solicitar(id: string) {
    return post<Transferencia, Record<string, never>>(
      almacenEndpoints.transferencias.solicitar(id),
      {},
    )
  },
  aprobar(id: string, empleadoAprobadorId: string) {
    return post<Transferencia, { empleadoAprobadorId: string }>(
      almacenEndpoints.transferencias.aprobar(id),
      { empleadoAprobadorId },
    )
  },
  preparar(id: string) {
    return post<Transferencia, Record<string, never>>(
      almacenEndpoints.transferencias.preparar(id),
      {},
    )
  },
  enviar(id: string, empleadoDespachoId: string) {
    return post<Transferencia, { empleadoDespachoId: string }>(
      almacenEndpoints.transferencias.enviar(id),
      { empleadoDespachoId },
    )
  },
  recibir(id: string, empleadoRecepcionId: string) {
    return post<Transferencia, { empleadoRecepcionId: string }>(
      almacenEndpoints.transferencias.recibir(id),
      { empleadoRecepcionId },
    )
  },
  rechazar(id: string, empleadoId: string, motivo?: string | null) {
    return post<Transferencia, { empleadoId: string; motivo?: string | null }>(
      almacenEndpoints.transferencias.rechazar(id),
      { empleadoId, motivo },
    )
  },
  anular(id: string) {
    return post<Transferencia, Record<string, never>>(
      almacenEndpoints.transferencias.anular(id),
      {},
    )
  },
}
