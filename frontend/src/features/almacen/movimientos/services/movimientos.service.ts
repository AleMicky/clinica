import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type MovimientoListItem = {
  id: string
  numero: string
  tipo: string
  fecha: string
  estado: string
  requiereAprobacion: boolean
  workflowInstanceId: string | null
}

export type IngresoPayload = {
  lineas: Array<{
    productoId: string
    cantidad: number
    numeroLote?: string
    fechaVencimiento?: string | null
    costoUnitario?: number
  }>
  proveedorId?: string | null
  observaciones?: string
}

export const movimientosAlmacenService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<MovimientoListItem>(almacenEndpoints.movimientos.root, query)
  },
  getById(id: string) {
    return get(almacenEndpoints.movimientos.byId(id))
  },
  registrarIngreso(data: IngresoPayload) {
    return post(almacenEndpoints.movimientos.ingresos, data)
  },
  aplicar(id: string) {
    return post(almacenEndpoints.movimientos.aplicar(id), {})
  },
}
