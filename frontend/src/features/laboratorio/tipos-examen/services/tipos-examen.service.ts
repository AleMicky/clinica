import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateTipoExamenPayload,
    TipoExamen,
    UpdateTipoExamenPayload,
} from '../types/tipo-examen.types'

export const tiposExamenService = createGuidCrudService<
    TipoExamen,
    CreateTipoExamenPayload,
    UpdateTipoExamenPayload
>(laboratorioEndpoints.tiposExamen.root)
