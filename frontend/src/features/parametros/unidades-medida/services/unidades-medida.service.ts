import { unidadesMedidaEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateUnidadMedidaPayload,
    UnidadMedida,
    UpdateUnidadMedidaPayload,
} from '../types/unidades-medida.types'

export const unidadesMedidaService = createGuidCrudService<
    UnidadMedida,
    CreateUnidadMedidaPayload,
    UpdateUnidadMedidaPayload
>(unidadesMedidaEndpoints.root)
