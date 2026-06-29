export type SeccionCompletitud = {
    seccionId: string
    codigo: string
    nombre: string
    etapaFlujo: string | null
    orden: number
    camposRequeridos: number
    camposCompletados: number
    completa: boolean
}

export type AtencionFlujoCompletitud = {
    atencionId: string
    estadoAtencion: string
    workflowInstanceId: string | null
    estadoWorkflow: string | null
    etapaActual: string | null
    puedeAvanzar: boolean
    siguienteAccion: string | null
    siguienteAccionNombre: string | null
    secciones: SeccionCompletitud[]
}

export type AvanzarAtencionFlujoResult = {
    atencionId: string
    estadoAnterior: string
    estadoNuevo: string
    accionEjecutada: string
}
