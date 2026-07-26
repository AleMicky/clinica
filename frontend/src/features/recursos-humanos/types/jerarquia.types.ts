export type JerarquiaAreaNode = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    tipoAreaId: string
    tipoAreaCodigo: string
    tipoAreaNombre: string
    tipoAreaOrden: number
    areaPadreId?: string | null
    responsableEmpleadoId?: string | null
    empleadosCount?: number | null
}

export type JerarquiaOrganizacional = {
    areas: JerarquiaAreaNode[]
}

export type JerarquiaQuery = {
    includeCounts?: boolean
}
