import { almacenEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
  FormaFarmaceutica,
  FormaFarmaceuticaPayload,
} from '../types/forma-farmaceutica.types'

export const formasFarmaceuticasService = createGuidCrudService<
  FormaFarmaceutica,
  FormaFarmaceuticaPayload
>(almacenEndpoints.formasFarmaceuticas.root)
