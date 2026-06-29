import type { Atencion } from './atencion-medica.types'

export type RecepcionAtencion = Atencion

export type RespuestaFormularioPayload = {
    formularioCampoId: string
    valorTexto?: string | null
    valorNumero?: number | null
    valorFecha?: string | null
    valorBooleano?: boolean | null
    valorJson?: string | null
}

export type CrearRecepcionAtencionPayload = {
    pacienteId: string
    tipoAtencionId: string
    respuestasFormulario: RespuestaFormularioPayload[]
}

export type FormularioRecepcionCampo = {
    id: string
    codigo: string
    etiqueta: string
    tipoCampoCodigo: string
    controlFrontend: string
    tipoDato: string
    esRequerido: boolean
    visible: boolean
    orden: number
    placeholder?: string | null
    valorDefecto?: string | null
    opcionesJson?: string | null
}

export type FormularioRecepcionSeccion = {
    id: string
    codigo: string
    nombre: string
    orden: number
    campos: FormularioRecepcionCampo[]
}

export type FormularioRecepcion = {
    formularioClinicoId: string
    tipoAtencionId: string
    formularioCodigo: string
    formularioNombre: string
    secciones: FormularioRecepcionSeccion[]
}

export type DynamicFormValues = Record<string, unknown>
