import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { medicoEndpoints } from '../../../shared/api/endpoints'
import type {
    CreateMedicoPayload,
    Medico,
    MedicoQuery,
    UpdateMedicoPayload,
} from '../types/medico.types'

export class MedicosService {
    getPaged(query: MedicoQuery) {
        return getPaged<Medico>(medicoEndpoints.root, query)
    }

    getById(id: string) {
        return get<Medico>(medicoEndpoints.byId(id))
    }

    create(data: CreateMedicoPayload) {
        return post<Medico, CreateMedicoPayload>(medicoEndpoints.root, data)
    }

    update(id: string, data: UpdateMedicoPayload) {
        return put<Medico, UpdateMedicoPayload>(medicoEndpoints.byId(id), data)
    }

    delete(id: string) {
        return del<void>(medicoEndpoints.byId(id))
    }
}

export const medicosService = new MedicosService()
