import { del, get, getPaged, post, put } from '../../../../shared/api/http'
import { unidadesMedidaEndpoints } from '../../../../shared/api/endpoints'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
    CreateUnidadMedidaPayload,
    UnidadMedida,
    UpdateUnidadMedidaPayload,
} from '../types/unidades-medida.types'

export const unidadesMedidaService = {
    getPaged: (query: PagedQuery) =>
        getPaged<UnidadMedida>(unidadesMedidaEndpoints.root, query),
    getById: (id: string) =>
        get<UnidadMedida>(unidadesMedidaEndpoints.byId(id)),
    create: (data: CreateUnidadMedidaPayload) =>
        post<UnidadMedida, CreateUnidadMedidaPayload>(
            unidadesMedidaEndpoints.root,
            data,
        ),
    update: (id: string, data: UpdateUnidadMedidaPayload) =>
        put<UnidadMedida, UpdateUnidadMedidaPayload>(
            unidadesMedidaEndpoints.byId(id),
            data,
        ),
    delete: (id: string) => del<void>(unidadesMedidaEndpoints.byId(id)),
}
