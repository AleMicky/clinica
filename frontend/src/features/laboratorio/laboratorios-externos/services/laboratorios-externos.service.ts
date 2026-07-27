import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateLaboratorioExternoPayload,
    LaboratorioExterno,
    UpdateLaboratorioExternoPayload,
} from '../types/laboratorio-externo.types'

export const laboratoriosExternosService = createGuidCrudService<
    LaboratorioExterno,
    CreateLaboratorioExternoPayload,
    UpdateLaboratorioExternoPayload
>(laboratorioEndpoints.laboratoriosExternos.root)
