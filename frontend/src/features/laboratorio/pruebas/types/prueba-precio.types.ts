export type PruebaPrecio = {
    id: string
    pruebaId: string
    importeFacturado: number
    costoLaboratorio: number
    costoDerivacion: number
    fechaInicio: string
    fechaFin: string | null
    motivoCambio: string
}

export type CreatePruebaPrecioPayload = {
    pruebaId: string
    importeFacturado: number
    costoLaboratorio: number
    costoDerivacion: number
    fechaInicio: string
    fechaFin?: string | null
    motivoCambio: string
}

export type UpdatePruebaPrecioPayload = CreatePruebaPrecioPayload

export type PruebaPrecioPagedQuery = {
    page: number
    pageSize: number
    pruebaId?: string
}
