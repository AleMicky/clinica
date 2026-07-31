import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { get } from '../../../../shared/api/http'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
  AlmacenCatalogo,
  AlmacenCatalogoPayload,
  TipoAlmacen,
} from '../types/almacen.types'

const crud = createGuidCrudService<AlmacenCatalogo, AlmacenCatalogoPayload>(
  almacenEndpoints.almacenes.root,
)

export const almacenesCatalogService = {
  ...crud,
  getTipos() {
    return get<TipoAlmacen[]>(almacenEndpoints.almacenes.tipos)
  },
}
