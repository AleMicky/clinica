import { getPaged, post } from '../../../../shared/api/http'
import { correlativoEndpoints } from '../../../../shared/api/endpoints'
import type { PagedQuery } from '../../../../shared/types/pagination.types'
import type {
    Correlativo,
    CorrelativoPagedQuery,
    GenerarCorrelativoPayload,
} from '../types/correlativo.types'

export const correlativosService = {
    getPaged: (query: CorrelativoPagedQuery) =>
        getPaged<Correlativo>(
            correlativoEndpoints.root,
            query as PagedQuery & CorrelativoPagedQuery,
        ),
    generar: (data: GenerarCorrelativoPayload) =>
        post<Correlativo, GenerarCorrelativoPayload>(
            correlativoEndpoints.generar,
            data,
        ),
}
