import { createEndpoints } from '../../../shared/api/endpoints'
import { api } from '../../../shared/api/axios'
import { del, get, getPaged, post, put } from '../../../shared/api/http'
import type { ApiResponse } from '../../../shared/types/api-response.types'
import { unwrap } from '../../../shared/utils/helper'
import type {
    CreateProgramacionDiariaPayload,
    CreateTurnoPayload,
    MedicoDisponibilidad,
    MedicoDisponibilidadQuery,
    ProgramacionDiaria,
    ProgramacionDiariaPagedQuery,
    ProgramacionLookup,
    Turno,
    TurnoPagedQuery,
    UpdateProgramacionDiariaPayload,
    UpdateTurnoPayload,
} from '../types/turnos.types'

export const turnoEndpoints = createEndpoints('/api/recursos-humanos/turnos')

export const programacionDiariaEndpoints = createEndpoints(
    '/api/recursos-humanos/programacion-diaria',
    (root) => ({
        disponibilidad: `${root}/disponibilidad`,
        programacionesLookup: `${root}/programaciones-lookup`,
    }),
)

export class TurnosService {
    getPaged(query: TurnoPagedQuery) {
        return getPaged<Turno>(turnoEndpoints.root, query)
    }

    getById(id: string) {
        return get<Turno>(turnoEndpoints.byId(id))
    }

    create(data: CreateTurnoPayload) {
        return post<Turno, CreateTurnoPayload>(turnoEndpoints.root, data)
    }

    update(id: string, data: UpdateTurnoPayload) {
        return put<Turno, UpdateTurnoPayload>(turnoEndpoints.byId(id), data)
    }

    delete(id: string) {
        return del(turnoEndpoints.byId(id))
    }
}

export class ProgramacionDiariaService {
    getPaged(query: ProgramacionDiariaPagedQuery) {
        return getPaged<ProgramacionDiaria>(programacionDiariaEndpoints.root, query)
    }

    getDisponibilidad(query: MedicoDisponibilidadQuery) {
        return api
            .get<ApiResponse<MedicoDisponibilidad[]>>(
                programacionDiariaEndpoints.disponibilidad,
                { params: query },
            )
            .then(({ data }) => unwrap(data))
    }

    getProgramacionesLookup() {
        return api
            .get<ApiResponse<ProgramacionLookup[]>>(
                programacionDiariaEndpoints.programacionesLookup,
            )
            .then(({ data }) => unwrap(data))
    }

    getById(id: string) {
        return get<ProgramacionDiaria>(programacionDiariaEndpoints.byId(id))
    }

    create(data: CreateProgramacionDiariaPayload) {
        return post<ProgramacionDiaria, CreateProgramacionDiariaPayload>(
            programacionDiariaEndpoints.root,
            data,
        )
    }

    update(id: string, data: UpdateProgramacionDiariaPayload) {
        return put<ProgramacionDiaria, UpdateProgramacionDiariaPayload>(
            programacionDiariaEndpoints.byId(id),
            data,
        )
    }

    delete(id: string) {
        return del(programacionDiariaEndpoints.byId(id))
    }
}

export const turnosService = new TurnosService()
export const programacionDiariaService = new ProgramacionDiariaService()
