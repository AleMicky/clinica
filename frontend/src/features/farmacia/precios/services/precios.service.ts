import { farmaciaEndpoints } from '../../../../shared/api/endpoints'
import { del, getPaged, post, put } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type Precio = {
  id: string
  productoId: string
  importe: number
  fechaInicio: string
  fechaFin: string | null
  motivoCambio: string
}

export type CreatePrecioPayload = {
  productoId: string
  importe: number
  fechaInicio: string
  fechaFin?: string | null
  motivoCambio?: string
}

export const preciosFarmaciaService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<Precio>(farmaciaEndpoints.precios.root, query)
  },
  create(data: CreatePrecioPayload) {
    return post(farmaciaEndpoints.precios.root, data)
  },
  update(id: string, data: Omit<CreatePrecioPayload, 'productoId'>) {
    return put(farmaciaEndpoints.precios.byId(id), data)
  },
  delete(id: string) {
    return del(farmaciaEndpoints.precios.byId(id))
  },
}
