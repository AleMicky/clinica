export type JerarquiaAreaNode = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    empleadosCount?: number | null
}

export type JerarquiaOrganizacional = {
    areas: JerarquiaAreaNode[]
}

export type JerarquiaQuery = {
    includeCounts?: boolean
}
