import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type { UnidadMedida, UnidadMedidaPayload } from '../types/unidad-medida.types'

export const unidadesMedidaAlmacenService = createGuidCrudService<
  UnidadMedida,
  UnidadMedidaPayload
>(almacenEndpoints.unidadesMedida.root)
