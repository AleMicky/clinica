export type Prueba = {
    id: string
    codigo: string
    nombre: string
    especialidadId: string
    especialidadNombre: string
    tipoExamenId: string
    tipoExamenNombre: string
    tipoMuestraId: string
    tipoMuestraNombre: string
    requiereAyuno: boolean
    horasAyuno: number
    esDerivable: boolean
}

export type CreatePruebaPayload = {
    codigo: string
    nombre: string
    especialidadId: string
    tipoExamenId: string
    tipoMuestraId: string
    requiereAyuno: boolean
    horasAyuno: number
    esDerivable: boolean
}

export type UpdatePruebaPayload = CreatePruebaPayload
