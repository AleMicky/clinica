import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateEspecialidadLabPayload,
    EspecialidadLab,
    UpdateEspecialidadLabPayload,
} from '../types/especialidad.types'

export const especialidadesLabService = createGuidCrudService<
    EspecialidadLab,
    CreateEspecialidadLabPayload,
    UpdateEspecialidadLabPayload
>(laboratorioEndpoints.especialidades.root)
