import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateValorReferenciaPayload,
    UpdateValorReferenciaPayload,
    ValorReferencia,
} from '../types/valor-referencia.types'

export const valoresReferenciaService = createGuidCrudService<
    ValorReferencia,
    CreateValorReferenciaPayload,
    UpdateValorReferenciaPayload
>(laboratorioEndpoints.valoresReferencia.root)
