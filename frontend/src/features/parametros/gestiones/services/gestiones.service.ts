import { gestionesEndpoints, periodosEndpoints } from '../../../../shared/api/endpoints'
import { createGuidCrudService } from '../../../../shared/services/guid-crud.service'
import { getPaged, put } from '../../../../shared/api/http'
import type {
    CreateGestionPayload,
    Gestion,
    Periodo,
    PeriodoPagedQuery,
    UpdateGestionPayload,
    UpdatePeriodoPayload,
} from '../types/gestiones.types'

export const gestionesService = createGuidCrudService<
    Gestion,
    CreateGestionPayload,
    UpdateGestionPayload
>(gestionesEndpoints.root)

export const periodosService = {
    getPaged(query: PeriodoPagedQuery) {
        return getPaged<Periodo>(periodosEndpoints.root, query)
    },

    update(id: string, data: UpdatePeriodoPayload) {
        return put<Periodo, UpdatePeriodoPayload>(`${periodosEndpoints.root}/${id}`, data)
    },
}
