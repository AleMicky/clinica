export type EntityId = string

export type EmpleadoMedicoEspecialidad = {
    especialidadId: EntityId
    especialidadNombre: string
    esPrincipal: boolean
}

export type EmpleadoMedico = {
    id: EntityId
    especialidades: EmpleadoMedicoEspecialidad[]
    especialidadPrincipalId: EntityId
    matriculaProfesional: string
    registroColegioMedico?: string | null
}

export type Empleado = {
    id: EntityId
    personaId: EntityId
    personaNombreCompleto: string
    codigoEmpleado: string
    fechaIngreso?: string | null
    areaId: EntityId
    areaNombre: string
    departamentoId: EntityId
    departamentoNombre: string
    servicioId: EntityId
    servicioNombre: string
    profesionId: EntityId
    profesionNombre: string
    cargoId: EntityId
    cargoNombre: string
    esMedico: boolean
    medico?: EmpleadoMedico | null
}

export type EmpleadoQuery = {
    page?: number
    pageSize?: number
    search?: string
    areaId?: EntityId
    departamentoId?: EntityId
}

export type CreateEmpleadoPayload = {
    personaId: EntityId
    codigoEmpleado: string
    areaId: EntityId
    departamentoId: EntityId
    servicioId: EntityId
    profesionId: EntityId
    cargoId: EntityId
    fechaIngreso?: string | null
    esMedico: boolean
    medico?: CreateEmpleadoMedicoPayload | null
}

export type CreateEmpleadoMedicoPayload = {
    especialidadIds: EntityId[]
    especialidadPrincipalId: EntityId
    matriculaProfesional: string
    registroColegioMedico?: string | null
}

export type UpdateEmpleadoPayload = CreateEmpleadoPayload
