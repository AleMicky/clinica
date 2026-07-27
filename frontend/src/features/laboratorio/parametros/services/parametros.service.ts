import { getPaged } from '../../../../shared/api/http'
import { laboratorioEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import type {
    CreateParametroPayload,
    Parametro,
    ParametroPagedQuery,
    UpdateParametroPayload,
} from '../types/parametro.types'

export const parametrosService = {
    ...createGuidCrudService<Parametro, CreateParametroPayload, UpdateParametroPayload>(
        laboratorioEndpoints.parametros.root,
    ),
    getPaged(query: ParametroPagedQuery) {
        return getPaged<Parametro>(laboratorioEndpoints.parametros.root, query)
    },
}
