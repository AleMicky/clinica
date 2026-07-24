import type { PagedQuery } from '../../../shared/types/pagination.types'

export type Guid = string

// ── Catálogos de apoyo ──────────────────────────────────────────────

export type TipoAtencion = {
    id: Guid
    codigo: string
    nombre: string
    descripcion: string
    color: string
    icono?: string | null
}

export type CreateTipoAtencionPayload = {
    codigo: string
    nombre: string
    descripcion?: string
    color: string
    icono?: string | null
}

export type UpdateTipoAtencionPayload = CreateTipoAtencionPayload

export type FormularioClinico = {
    id: Guid
    tipoAtencionId: Guid
    codigo: string
    nombre: string
    descripcion: string
    version: number
    activo: boolean
}

export type CreateFormularioClinicoPayload = {
    tipoAtencionId: Guid
    codigo: string
    nombre: string
    descripcion?: string
    version?: number
    activo?: boolean
}

export type UpdateFormularioClinicoPayload = CreateFormularioClinicoPayload

export type FormularioSeccion = {
    id: Guid
    formularioClinicoId: Guid
    codigo: string
    nombre: string
    orden: number
    etapaFlujo?: string | null
    visible: boolean
}

export type CreateFormularioSeccionPayload = {
    formularioClinicoId: Guid
    codigo: string
    nombre: string
    orden: number
    etapaFlujo?: string | null
    visible: boolean
}

export type UpdateFormularioSeccionPayload = CreateFormularioSeccionPayload

export type FormularioSeccionPagedQuery = PagedQuery & {
    formularioClinicoId?: Guid
}

export type TipoCampoFormulario = {
    id: Guid
    codigo: string
    nombre: string
    controlFrontend: string
    tipoDato: string
    permiteOpciones: boolean
    permiteValorDefecto: boolean
    permiteValidaciones: boolean
    permiteMultiple: boolean
}

export type FormularioCampo = {
    id: Guid
    formularioSeccionId: Guid
    codigo: string
    etiqueta: string
    tipoCampoFormularioId: Guid
    esRequerido: boolean
    visible: boolean
    orden: number
    placeholder?: string | null
    valorDefecto?: string | null
    opcionesJson?: string | null
    validacionesJson?: string | null
}

export type CreateFormularioCampoPayload = {
    formularioSeccionId: Guid
    codigo: string
    etiqueta: string
    tipoCampoFormularioId: Guid
    esRequerido: boolean
    visible: boolean
    orden: number
    placeholder?: string | null
    valorDefecto?: string | null
    opcionesJson?: string | null
    validacionesJson?: string | null
}

export type UpdateFormularioCampoPayload = CreateFormularioCampoPayload

export type FormularioCampoPagedQuery = PagedQuery & {
    formularioSeccionId?: Guid
}

export type AtencionFormularioRespuesta = {
    id: Guid
    atencionId: Guid
    formularioCampoId: Guid
    valorTexto?: string | null
    valorNumero?: number | null
    valorFecha?: string | null
    valorBooleano?: boolean | null
    valorJson?: string | null
}

export type CreateAtencionFormularioRespuestaPayload = {
    atencionId: Guid
    formularioCampoId: Guid
    valorTexto?: string | null
    valorNumero?: number | null
    valorFecha?: string | null
    valorBooleano?: boolean | null
    valorJson?: string | null
}

export type UpdateAtencionFormularioRespuestaPayload = CreateAtencionFormularioRespuestaPayload

export type PacienteLookup = {
    id: Guid
    personaId: Guid
    personaNombreCompleto: string
    numeroHistoriaClinica: string
}

// ── Atención ────────────────────────────────────────────────────────

export type Atencion = {
    id: Guid
    numeroAtencion: string
    pacienteId: Guid
    tipoAtencionId: Guid
    medicoId?: Guid | null
    formularioClinicoId?: Guid | null
    fechaAtencion: string
    fechaRecepcion?: string | null
    estado: string
    workflowInstanceId?: Guid | null
    observaciones?: string | null
    pacienteNombre?: string
    numeroHistoriaClinica?: string
    tipoAtencionNombre?: string
    tipoAtencionCodigo?: string
    tipoAtencionColor?: string
    tipoAtencionIcono?: string | null
    formularioClinicoNombre?: string | null
}

export type CreateAtencionPayload = {
    pacienteId: Guid
    tipoAtencionId: Guid
    formularioClinicoId: Guid
    fechaAtencion: string
    observaciones?: string | null
}

export type RecepcionPacienteNuevoPayload = {
    tipoDocumentoId: Guid
    numeroDocumento: string
    nombres: string
    apellidoPaterno: string
    apellidoMaterno: string
    fechaNacimiento: string
    sexoId: Guid
    estadoCivilId: Guid
    telefono: string
    direccion?: string | null
    extensionDocumentoId?: Guid | null
    complementoDocumento?: string | null
}

export type RecepcionarAtencionPayload = {
    tipoAtencionId: Guid
    fechaAtencion?: string | null
    observaciones?: string | null
    pacienteId?: Guid | null
    pacienteNuevo?: RecepcionPacienteNuevoPayload | null
}

export type UpdateAtencionPayload = {
    pacienteId: Guid
    tipoAtencionId: Guid
    formularioClinicoId: Guid
    fechaAtencion: string
    observaciones?: string | null
}

export type AtencionPagedQuery = PagedQuery & {
    pacienteId?: Guid
    tipoAtencionId?: Guid
}

export type FormularioClinicoPagedQuery = PagedQuery & {
    tipoAtencionId?: Guid
}

export type AtencionChildPagedQuery = PagedQuery & {
    atencionId?: Guid
}

export type AtencionRespuestaPagedQuery = AtencionChildPagedQuery

