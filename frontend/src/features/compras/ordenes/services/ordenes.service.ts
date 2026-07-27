import { comprasEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type OrdenListItem = {
  id: string
  numero: string
  proveedorId: string
  proveedorNombre: string
  fecha: string
  estado: string
}

export type CreateOrdenPayload = {
  proveedorId: string
  detalles: Array<{ productoId: string; cantidad: number; costoUnitario: number }>
  observaciones?: string
}

export type RecibirPayload = {
  lineas: Array<{
    detalleId: string
    cantidad: number
    numeroLote: string
    fechaVencimiento?: string | null
  }>
}

export const ordenesCompraService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<OrdenListItem>(comprasEndpoints.ordenes.root, query)
  },
  getById(id: string) {
    return get(comprasEndpoints.ordenes.byId(id))
  },
  create(data: CreateOrdenPayload) {
    return post(comprasEndpoints.ordenes.root, data)
  },
  confirmar(id: string) {
    return post(comprasEndpoints.ordenes.confirmar(id), {})
  },
  recibir(id: string, data: RecibirPayload) {
    return post(comprasEndpoints.ordenes.recibir(id), data)
  },
}
