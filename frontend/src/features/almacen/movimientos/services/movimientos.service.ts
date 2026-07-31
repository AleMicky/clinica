import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
  Movimiento,
  MovimientoListItem,
  RegistrarAjustePayload,
  RegistrarBajaPayload,
  RegistrarIngresoPayload,
  RegistrarSalidaPayload,
  RegistrarTransferenciaSimplePayload,
} from '../types/movimiento.types'

export const movimientosAlmacenService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<MovimientoListItem>(almacenEndpoints.movimientos.root, query)
  },
  getById(id: string) {
    return get<Movimiento>(almacenEndpoints.movimientos.byId(id))
  },
  registrarIngreso(data: RegistrarIngresoPayload) {
    return post<Movimiento, RegistrarIngresoPayload>(almacenEndpoints.movimientos.ingresos, data)
  },
  registrarSalida(data: RegistrarSalidaPayload) {
    return post<Movimiento, RegistrarSalidaPayload>(almacenEndpoints.movimientos.salidas, data)
  },
  registrarAjuste(data: RegistrarAjustePayload) {
    return post<Movimiento, RegistrarAjustePayload>(almacenEndpoints.movimientos.ajustes, data)
  },
  registrarBaja(data: RegistrarBajaPayload) {
    return post<Movimiento, RegistrarBajaPayload>(almacenEndpoints.movimientos.bajas, data)
  },
  registrarTransferencia(data: RegistrarTransferenciaSimplePayload) {
    return post<Movimiento, RegistrarTransferenciaSimplePayload>(
      almacenEndpoints.movimientos.transferencias,
      data,
    )
  },
  aplicar(id: string, empleadoId?: string | null) {
    return post<Movimiento, { empleadoId?: string | null }>(
      almacenEndpoints.movimientos.aplicar(id),
      { empleadoId },
    )
  },
  anular(id: string) {
    return post<Movimiento, Record<string, never>>(almacenEndpoints.movimientos.anular(id), {})
  },
}
