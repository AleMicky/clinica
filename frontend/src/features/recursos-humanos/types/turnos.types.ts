import type { PagedQuery } from '../../../shared/types/pagination.types'

export type Guid = string

export type Turno = {
    id: Guid
    codigo: string
    nombre: string
    horaInicio: string
    horaFin: string
    cruceDia: boolean
    activo: boolean
    permiteMultiplesMedicosTurno: boolean
}

export type CreateTurnoPayload = {
    codigo: string
    nombre: string
    horaInicio: string
    horaFin: string
    cruceDia?: boolean
    activo?: boolean
    permiteMultiplesMedicosTurno?: boolean
}

export type UpdateTurnoPayload = CreateTurnoPayload

export type TurnoPagedQuery = PagedQuery & {
    search?: string
    activo?: boolean
}

/** Regular = 1, Descanso = 2 */
export type TipoAsignacionProgramacion = 1 | 2

/** Borrador = 1, Publicada = 2, Cerrada = 3, Cancelada = 4 */
export type EstadoProgramacion = 1 | 2 | 3 | 4

export type ProgramacionLookup = {
    id: Guid
    nombre: string
    estado: EstadoProgramacion
    grupoProgramacionId: Guid
    grupoProgramacionNombre: string
    areaId: Guid
    areaNombre: string
    fechaInicio: string
    fechaFin: string
}

export type ProgramacionDiaria = {
    id: Guid
    programacionId: Guid
    programacionNombre: string
    programacionEstado: EstadoProgramacion
    grupoProgramacionId: Guid
    grupoProgramacionNombre: string
    areaId: Guid
    areaCodigo: string
    areaNombre: string
    empleadoId: Guid
    empleadoCodigo: string
    empleadoNombre: string
    fecha: string
    turnoId?: Guid | null
    turnoCodigo?: string | null
    turnoNombre?: string | null
    horaInicio?: string | null
    horaFin?: string | null
    cruceDia?: boolean | null
    tipoAsignacion: TipoAsignacionProgramacion
    observacion?: string | null
    medicoId?: Guid | null
}

export type CreateProgramacionDiariaPayload = {
    programacionId: Guid
    empleadoId: Guid
    fecha: string
    turnoId?: Guid | null
    tipoAsignacion: TipoAsignacionProgramacion
    observacion?: string | null
}

export type UpdateProgramacionDiariaPayload = CreateProgramacionDiariaPayload

export type ProgramacionDiariaPagedQuery = PagedQuery & {
    search?: string
    fecha?: string
    fechaDesde?: string
    fechaHasta?: string
    empleadoId?: Guid
    turnoId?: Guid
    programacionId?: Guid
    grupoProgramacionId?: Guid
    areaId?: Guid
    tipoAsignacion?: TipoAsignacionProgramacion
    estadoProgramacion?: EstadoProgramacion
}

export type MedicoDisponibilidad = {
    programacionDiariaId: Guid
    programacionId: Guid
    medicoId: Guid
    empleadoId: Guid
    medicoNombre: string
    areaId: Guid
    areaNombre: string
    turnoNombre?: string | null
    horaInicio?: string | null
    horaFin?: string | null
    cruceDia: boolean
    disponibleAhora: boolean
    proximaDisponibilidad?: string | null
}

export type MedicoDisponibilidadQuery = {
    fecha?: string
    hora?: string
    areaId?: Guid
    soloDisponiblesAhora?: boolean
    incluirProximaDisponibilidad?: boolean
}

export const TIPO_ASIGNACION_OPTIONS = [
    { value: 1 as TipoAsignacionProgramacion, label: 'Regular' },
    { value: 2 as TipoAsignacionProgramacion, label: 'Descanso' },
]

export const ESTADO_PROGRAMACION_LABELS: Record<EstadoProgramacion, string> = {
    1: 'Borrador',
    2: 'Publicada',
    3: 'Cerrada',
    4: 'Cancelada',
}
