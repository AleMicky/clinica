import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { pacienteEndpoints, personaEndpoints } from '../../../shared/api/endpoints'
import type { PagedQuery } from '../../../shared/types/pagination.types'
import type {
    CreatePacientePayload,
    Paciente,
    PersonaLookup,
    UpdatePacientePayload,
} from '../types/paciente.types'

export class PacientesService {
    getPaged(query: PagedQuery) {
        return getPaged<Paciente>(pacienteEndpoints.root, query)
    }

    getById(id: string) {
        return get<Paciente>(pacienteEndpoints.byId(id))
    }

    getPersonasLookup(query: PagedQuery) {
        return getPaged<PersonaLookup>(personaEndpoints.root, query)
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
