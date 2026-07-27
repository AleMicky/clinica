import { farmaciaEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type DispensacionListItem = {
  id: string
  numero: string
  pacienteId: string
  fecha: string
  estado: string
  cuentaId: string | null
}

export type CreateDispensacionPayload = {
  pacienteId: string
  detalles: Array<{ productoId: string; cantidad: number }>
  recetaId?: string | null
  observaciones?: string
  empleadoId?: string | null
}

export const dispensacionesService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<DispensacionListItem>(farmaciaEndpoints.dispensaciones.root, query)
  },
  getById(id: string) {
    return get(farmaciaEndpoints.dispensaciones.byId(id))
  },
  create(data: CreateDispensacionPayload) {
    return post(farmaciaEndpoints.dispensaciones.root, data)
  },
  confirmar(id: string, empleadoId?: string) {
    return post(farmaciaEndpoints.dispensaciones.confirmar(id), { empleadoId })
  },
}
