import { createEndpoints } from '../../../shared/api/endpoints'
import { api } from '../../../shared/api/axios'
import { del, get, getPaged, post, put } from '../../../shared/api/http'
import type { ApiResponse } from '../../../shared/types/api-response.types'
import { unwrap } from '../../../shared/utils/helper'
import type {
    CreateGrupoProgramacionPayload,
    CreateProgramacionDiariaPayload,
    CreateProgramacionPayload,
    CreateTurnoPayload,
    GrupoProgramacion,
    GrupoProgramacionPagedQuery,
    MedicoDisponibilidad,
    MedicoDisponibilidadQuery,
    Programacion,
    ProgramacionDiaria,
    ProgramacionDiariaPagedQuery,
    ProgramacionLookup,
    ProgramacionPagedQuery,
    SetGrupoProgramacionEmpleadosPayload,
    Turno,
    TurnoPagedQuery,
    UpdateGrupoProgramacionPayload,
    UpdateProgramacionDiariaPayload,
    UpdateProgramacionEstadoPayload,
    UpdateProgramacionPayload,
    UpdateTurnoPayload,
} from '../types/turnos.types'

export const turnoEndpoints = createEndpoints('/api/recursos-humanos/turnos')

export const grupoProgramacionEndpoints = createEndpoints(
    '/api/recursos-humanos/grupos-programacion',
    (root) => ({
        empleados: (id: string) => `${root}/${id}/empleados`,
    }),
)

export const programacionEndpoints = createEndpoints(
    '/api/recursos-humanos/programaciones',
    (root) => ({
        estado: (id: string) => `${root}/${id}/estado`,
    }),
)

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

export class GrupoProgramacionService {
    getPaged(query: GrupoProgramacionPagedQuery) {
        return getPaged<GrupoProgramacion>(grupoProgramacionEndpoints.root, query)
    }

    getById(id: string) {
        return get<GrupoProgramacion>(grupoProgramacionEndpoints.byId(id))
    }

    create(data: CreateGrupoProgramacionPayload) {
        return post<GrupoProgramacion, CreateGrupoProgramacionPayload>(
            grupoProgramacionEndpoints.root,
            data,
        )
    }

    update(id: string, data: UpdateGrupoProgramacionPayload) {
        return put<GrupoProgramacion, UpdateGrupoProgramacionPayload>(
            grupoProgramacionEndpoints.byId(id),
            data,
        )
    }

    setEmpleados(id: string, data: SetGrupoProgramacionEmpleadosPayload) {
        return put<GrupoProgramacion, SetGrupoProgramacionEmpleadosPayload>(
            grupoProgramacionEndpoints.empleados(id),
            data,
        )
    }

    delete(id: string) {
        return del(grupoProgramacionEndpoints.byId(id))
    }
}

export class ProgramacionService {
    getPaged(query: ProgramacionPagedQuery) {
        return getPaged<Programacion>(programacionEndpoints.root, query)
    }

    getById(id: string) {
        return get<Programacion>(programacionEndpoints.byId(id))
    }

    create(data: CreateProgramacionPayload) {
        return post<Programacion, CreateProgramacionPayload>(
            programacionEndpoints.root,
            data,
        )
    }

    update(id: string, data: UpdateProgramacionPayload) {
        return put<Programacion, UpdateProgramacionPayload>(
            programacionEndpoints.byId(id),
            data,
        )
    }

    updateEstado(id: string, data: UpdateProgramacionEstadoPayload) {
        return put<Programacion, UpdateProgramacionEstadoPayload>(
            programacionEndpoints.estado(id),
            data,
        )
    }

    delete(id: string) {
        return del(programacionEndpoints.byId(id))
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
export const grupoProgramacionService = new GrupoProgramacionService()
export const programacionService = new ProgramacionService()
export const programacionDiariaService = new ProgramacionDiariaService()
