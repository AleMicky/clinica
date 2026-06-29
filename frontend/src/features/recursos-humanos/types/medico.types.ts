export type EntityId = string

export type MedicoEspecialidad = {
    especialidadId: EntityId
    especialidadNombre: string
    esPrincipal: boolean
}

export type Medico = {
    id: EntityId
    empleadoId: EntityId
    empleadoCodigo: string
    personaNombreCompleto: string
    especialidades: MedicoEspecialidad[]
    especialidadPrincipalId: EntityId
    especialidadPrincipalNombre: string
    matriculaProfesional: string
    registroColegioMedico?: string | null
}

export type MedicoQuery = {
    page?: number
    pageSize?: number
    search?: string
    empleadoId?: EntityId
    especialidadId?: EntityId
}

export type CreateMedicoPayload = {
    empleadoId: EntityId
    especialidadIds: EntityId[]
    especialidadPrincipalId: EntityId
    matriculaProfesional: string
    registroColegioMedico?: string | null
}

export type UpdateMedicoPayload = CreateMedicoPayload

export type EmpleadoLookup = {
    id: EntityId
    codigoEmpleado: string
    personaNombreCompleto: string
}
