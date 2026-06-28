export type EntityId = string

export type Medico = {
    id: EntityId
    empleadoId: EntityId
    empleadoCodigo: string
    personaNombreCompleto: string
    especialidadId: EntityId
    especialidadNombre: string
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
    especialidadId: EntityId
    matriculaProfesional: string
    registroColegioMedico?: string | null
}

export type UpdateMedicoPayload = CreateMedicoPayload

export type EmpleadoLookup = {
    id: EntityId
    codigoEmpleado: string
    personaNombreCompleto: string
}
