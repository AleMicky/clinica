import type { Atencion } from './atencion-medica.types'

export type RecepcionAtencion = Atencion

export type CrearRecepcionAtencionPayload = {
    pacienteId: string
    tipoAtencionId: string
    servicioId: string
    motivoConsulta: string
    especialidadId?: string | null
    medicoId?: string | null
    responsableFinancieroNombre?: string | null
    responsableFinancieroDocumento?: string | null
    responsableFinancieroTelefono?: string | null
    seguroNombre?: string | null
    numeroAfiliacion?: string | null
    observaciones?: string | null
}
