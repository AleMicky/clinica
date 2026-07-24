import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { pacienteEndpoints } from '../../../shared/api/endpoints'
import type {
    CreatePacientePayload,
    Paciente,
    PacientePagedQuery,
    UpdatePacientePayload,
} from '../types/paciente.types'

export class PacientesService {
    getPaged(query: PacientePagedQuery) {
        return getPaged<Paciente>(pacienteEndpoints.root, query)
    }

    getById(id: string) {
        return get<Paciente>(pacienteEndpoints.byId(id))
    }

    create(data: CreatePacientePayload) {
        return post<Paciente, CreatePacientePayload>(pacienteEndpoints.root, data)
    }

    update(id: string, data: UpdatePacientePayload) {
        return put<Paciente, UpdatePacientePayload>(
            pacienteEndpoints.byId(id),
            data,
        )
    }

    delete(id: string) {
        return del<void>(pacienteEndpoints.byId(id))
    }
}

export const pacientesService = new PacientesService()
