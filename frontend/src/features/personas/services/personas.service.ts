import { del, get, getPaged, post, put } from '../../../shared/api/http'
import { personaEndpoints } from '../../../shared/api/endpoints'
import type {
    CreatePersonaPayload,
    Persona,
    PersonaPagedQuery,
    UpdatePersonaPayload,
} from '../types/persona.types'

export class PersonasService {
    getPaged(query: PersonaPagedQuery) {
        return getPaged<Persona>(personaEndpoints.root, query)
    }

    getById(id: string) {
        return get<Persona>(personaEndpoints.byId(id))
    }

    create(data: CreatePersonaPayload) {
        return post<Persona, CreatePersonaPayload>(personaEndpoints.root, data)
    }

    update(id: string, data: UpdatePersonaPayload) {
        return put<Persona, UpdatePersonaPayload>(personaEndpoints.byId(id), data)
    }

    delete(id: string) {
        return del<void>(personaEndpoints.byId(id))
    }
}

export const personasService = new PersonasService()
