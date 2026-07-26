import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreatePruebaPrecioPayload,
    PruebaPrecio,
    UpdatePruebaPrecioPayload,
} from '../types/prueba-precio.types'

export const pruebaPreciosService = createGuidCrudService<
    PruebaPrecio,
    CreatePruebaPrecioPayload,
    UpdatePruebaPrecioPayload
>(laboratorioEndpoints.pruebaPrecios.root)
