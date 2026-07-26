import { catalogoClinicoEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateTipoAreaPayload,
    TipoArea,
    UpdateTipoAreaPayload,
} from '../types/tipo-area.types'

export const tiposAreaService = createGuidCrudService<
    TipoArea,
    CreateTipoAreaPayload,
    UpdateTipoAreaPayload
>(catalogoClinicoEndpoints.tiposArea.root)
