import type { PagedQuery } from '../../../shared/types/pagination.types'

export type Guid = string

// ── Catálogos de apoyo ──────────────────────────────────────────────

export type TipoAtencion = {
    id: Guid
    codigo: string
    nombre: string
    descripcion: string
}

export type FormularioClinico = {
    id: Guid
    tipoAtencionId: Guid
    codigo: string
    nombre: string
    descripcion: string
    version: number
    activo: boolean
}

export type PacienteLookup = {
    id: Guid
    personaId: Guid
    personaNombreCompleto: string
    numeroHistoriaClinica: string
}

export type EspecialidadLookup = {
    id: Guid
    codigo: string
    nombre: string
}

// ── Atención ────────────────────────────────────────────────────────

export type Atencion = {
    id: Guid
    numeroTramite: string
    pacienteId: Guid
    tipoAtencionId: Guid
    formularioClinicoId: Guid
    fechaAtencion: string
    estado: string
    observaciones?: string | null
}

export type CreateAtencionPayload = {
    numeroTramite: string
    pacienteId: Guid
    tipoAtencionId: Guid
    formularioClinicoId: Guid
    fechaAtencion: string
    estado?: string
    observaciones?: string | null
}

export type UpdateAtencionPayload = {
    numeroTramite: string
    pacienteId: Guid
    tipoAtencionId: Guid
    formularioClinicoId: Guid
    fechaAtencion: string
    estado: string
    observaciones?: string | null
}

export type AtencionPagedQuery = PagedQuery & {
    pacienteId?: Guid
    tipoAtencionId?: Guid
}

export type FormularioClinicoPagedQuery = PagedQuery & {
    tipoAtencionId?: Guid
}

// ── Diagnóstico CIE-10 ──────────────────────────────────────────────

export type Diagnostico = {
    id: Guid
    codigoCie10: string
    nombre: string
    descripcion?: string | null
}

export type CreateDiagnosticoPayload = {
    codigoCie10: string
    nombre: string
    descripcion?: string | null
}

export type UpdateDiagnosticoPayload = CreateDiagnosticoPayload

export type DiagnosticoPagedQuery = PagedQuery & {
    busqueda?: string
}

// ── Diagnóstico de atención ────────────────────────────────────────

export type DiagnosticoAtencion = {
    id: Guid
    atencionId: Guid
    diagnosticoId: Guid
    esPrincipal: boolean
    observaciones?: string | null
}

export type CreateDiagnosticoAtencionPayload = {
    atencionId: Guid
    diagnosticoId: Guid
    esPrincipal?: boolean
    observaciones?: string | null
}

export type UpdateDiagnosticoAtencionPayload = CreateDiagnosticoAtencionPayload

export type AtencionChildPagedQuery = PagedQuery & {
    atencionId?: Guid
}

// ── Signos vitales ──────────────────────────────────────────────────

export type SignoVital = {
    id: Guid
    atencionId: Guid
    temperatura?: number | null
    frecuenciaCardiaca?: number | null
    frecuenciaRespiratoria?: number | null
    presionSistolica?: number | null
    presionDiastolica?: number | null
    saturacionOxigeno?: number | null
    glucemiaCapilar?: number | null
    peso?: number | null
    talla?: number | null
    imc?: number | null
    glasgow?: number | null
    fechaRegistro: string
}

export type CreateSignoVitalPayload = {
    atencionId: Guid
    temperatura?: number | null
    frecuenciaCardiaca?: number | null
    frecuenciaRespiratoria?: number | null
    presionSistolica?: number | null
    presionDiastolica?: number | null
    saturacionOxigeno?: number | null
    glucemiaCapilar?: number | null
    peso?: number | null
    talla?: number | null
    imc?: number | null
    glasgow?: number | null
    fechaRegistro?: string | null
}

export type UpdateSignoVitalPayload = CreateSignoVitalPayload

// ── Tratamiento ─────────────────────────────────────────────────────

export type Tratamiento = {
    id: Guid
    atencionId: Guid
    descripcion: string
    indicaciones?: string | null
    fechaRegistro: string
}

export type CreateTratamientoPayload = {
    atencionId: Guid
    descripcion: string
    indicaciones?: string | null
    fechaRegistro?: string | null
}

export type UpdateTratamientoPayload = CreateTratamientoPayload

// ── Estudio ─────────────────────────────────────────────────────────

export type Estudio = {
    id: Guid
    atencionId: Guid
    tipoEstudioId: Guid
    nombre: string
    justificacion?: string | null
    estado: string
    fechaSolicitud: string
}

export type CreateEstudioPayload = {
    atencionId: Guid
    tipoEstudioId: Guid
    nombre: string
    justificacion?: string | null
    estado?: string
    fechaSolicitud?: string | null
}

export type UpdateEstudioPayload = CreateEstudioPayload

export type EstudioPagedQuery = AtencionChildPagedQuery & {
    estado?: string
}

// ── Resultado de estudio ────────────────────────────────────────────

export type ResultadoEstudio = {
    id: Guid
    estudioId: Guid
    resultadoTexto: string
    archivoUrl?: string | null
    fechaResultado: string
    registradoPorId?: Guid | null
    observaciones?: string | null
}

export type CreateResultadoEstudioPayload = {
    estudioId: Guid
    resultadoTexto: string
    archivoUrl?: string | null
    fechaResultado?: string | null
    registradoPorId?: Guid | null
    observaciones?: string | null
}

export type UpdateResultadoEstudioPayload = CreateResultadoEstudioPayload

export type ResultadoEstudioPagedQuery = PagedQuery & {
    estudioId?: Guid
}

// ── Interconsulta ───────────────────────────────────────────────────

export type Interconsulta = {
    id: Guid
    atencionId: Guid
    especialidadId: Guid
    medicoId?: Guid | null
    motivo: string
    respuesta?: string | null
    fechaSolicitud: string
    fechaRespuesta?: string | null
}

export type CreateInterconsultaPayload = {
    atencionId: Guid
    especialidadId: Guid
    medicoId?: Guid | null
    motivo?: string
    respuesta?: string | null
    fechaSolicitud?: string | null
    fechaRespuesta?: string | null
}

export type UpdateInterconsultaPayload = CreateInterconsultaPayload

// ── Prescripción ────────────────────────────────────────────────────

export type Prescripcion = {
    id: Guid
    atencionId: Guid
    fecha: string
    observaciones?: string | null
}

export type CreatePrescripcionPayload = {
    atencionId: Guid
    fecha?: string | null
    observaciones?: string | null
}

export type UpdatePrescripcionPayload = CreatePrescripcionPayload

// ── Detalle de prescripción ─────────────────────────────────────────

export type PrescripcionDetalle = {
    id: Guid
    prescripcionId: Guid
    medicamentoId?: Guid | null
    medicamentoNombre: string
    dosis: string
    frecuencia: string
    duracion: string
    viaAdministracion?: string | null
    indicaciones?: string | null
}

export type CreatePrescripcionDetallePayload = {
    prescripcionId: Guid
    medicamentoNombre: string
    dosis: string
    frecuencia: string
    duracion: string
    medicamentoId?: Guid | null
    viaAdministracion?: string | null
    indicaciones?: string | null
}

export type UpdatePrescripcionDetallePayload = CreatePrescripcionDetallePayload

export type PrescripcionDetallePagedQuery = PagedQuery & {
    prescripcionId?: Guid
}
