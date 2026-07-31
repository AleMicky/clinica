import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get, getPaged, post } from '../../../../shared/api/http'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
  ContarInventarioPayload,
  CreateInventarioPayload,
  InventarioFisico,
  InventarioListItem,
} from '../types/inventario.types'

export const inventariosFisicosService = {
  getPaged(query: PagedQuery & Record<string, unknown>) {
    return getPaged<InventarioListItem>(almacenEndpoints.inventariosFisicos.root, query)
  },
  getById(id: string) {
    return get<InventarioFisico>(almacenEndpoints.inventariosFisicos.byId(id))
  },
  create(data: CreateInventarioPayload) {
    return post<InventarioFisico, CreateInventarioPayload>(
      almacenEndpoints.inventariosFisicos.root,
      data,
    )
  },
  iniciarConteo(id: string) {
    return post<InventarioFisico, Record<string, never>>(
      almacenEndpoints.inventariosFisicos.iniciarConteo(id),
      {},
    )
  },
  contar(id: string, data: ContarInventarioPayload) {
    return post<InventarioFisico, ContarInventarioPayload>(
      almacenEndpoints.inventariosFisicos.contar(id),
      data,
    )
  },
  finalizarConteo(id: string) {
    return post<InventarioFisico, Record<string, never>>(
      almacenEndpoints.inventariosFisicos.finalizarConteo(id),
      {},
    )
  },
  aprobar(id: string) {
    return post<InventarioFisico, Record<string, never>>(
      almacenEndpoints.inventariosFisicos.aprobar(id),
      {},
    )
  },
  anular(id: string) {
    return post<InventarioFisico, Record<string, never>>(
      almacenEndpoints.inventariosFisicos.anular(id),
      {},
    )
  },
}
