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

export type ProgramacionDiaria = {
    id: Guid
    empleadoId: Guid
    empleadoCodigo: string
    empleadoNombre: string
    fecha: string
    turnoId: Guid
    turnoCodigo: string
    turnoNombre: string
    horaInicio: string
    horaFin: string
    cruceDia: boolean
    areaId: Guid
    areaCodigo: string
    areaNombre: string
    cargoId: Guid
    cargoNombre: string
    especialidadId?: Guid | null
    especialidadNombre?: string | null
    esMedicoTurno: boolean
    aceptaConsultas: boolean
    aceptaSinCita: boolean
    maxPacientes: number
    estado: string
    observacion?: string | null
    permiteMultiplesMedicosTurno: boolean
    medicoId?: Guid | null
}

export type CreateProgramacionDiariaPayload = {
    empleadoId: Guid
    fecha: string
    turnoId: Guid
    areaId: Guid
    cargoId: Guid
    especialidadId?: Guid | null
    esMedicoTurno: boolean
    aceptaConsultas: boolean
    aceptaSinCita: boolean
    maxPacientes: number
    estado: string
    observacion?: string | null
    permiteMultiplesMedicosTurno?: boolean
}

export type UpdateProgramacionDiariaPayload = CreateProgramacionDiariaPayload

export type ProgramacionDiariaPagedQuery = PagedQuery & {
    search?: string
    fecha?: string
    fechaDesde?: string
    fechaHasta?: string
    empleadoId?: Guid
    turnoId?: Guid
    areaId?: Guid
    especialidadId?: Guid
    estado?: string
    esMedicoTurno?: boolean
}

export type MedicoDisponibilidad = {
    programacionId: Guid
    medicoId: Guid
    empleadoId: Guid
    medicoNombre: string
    especialidadNombre?: string | null
    especialidadId?: Guid | null
    areaId: Guid
    areaNombre: string
    turnoNombre: string
    horaInicio: string
    horaFin: string
    cruceDia: boolean
    esMedicoTurno: boolean
    aceptaConsultas: boolean
    aceptaSinCita: boolean
    maxPacientes: number
    disponibleAhora: boolean
    proximaDisponibilidad?: string | null
}

export type MedicoDisponibilidadQuery = {
    fecha?: string
    hora?: string
    especialidadId?: Guid
    areaId?: Guid
    soloDisponiblesAhora?: boolean
    incluirProximaDisponibilidad?: boolean
}

export const PROGRAMACION_ESTADOS = ['ACTIVO', 'INACTIVO', 'CANCELADO'] as const
