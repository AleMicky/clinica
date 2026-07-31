import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get } from '../../../../shared/api/http'
import type { DisponibilidadProducto } from '../types/stock.types'

export const stockAlmacenService = {
  getDisponibilidad(productoId: string) {
    return get<DisponibilidadProducto>(almacenEndpoints.movimientos.disponibilidad(productoId))
  },
}
