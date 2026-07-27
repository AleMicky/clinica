import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { getPaged } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'

export type Existencia = {
  id: string
  productoId: string
  productoCodigo: string
  productoNombre: string
  loteId: string
  loteNumero: string
  fechaVencimiento: string | null
  cantidad: number
  stockMinimo: number
  bajoMinimo: boolean
}

export const existenciasService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<Existencia>(almacenEndpoints.existencias.root, query)
  },
}
