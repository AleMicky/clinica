import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreatePruebaPayload,
    Prueba,
    UpdatePruebaPayload,
} from '../types/prueba.types'

export const pruebasService = createGuidCrudService<
    Prueba,
    CreatePruebaPayload,
    UpdatePruebaPayload
>(laboratorioEndpoints.pruebas.root)
