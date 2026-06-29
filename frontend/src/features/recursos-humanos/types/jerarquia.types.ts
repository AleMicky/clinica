export type JerarquiaServicioNode = {
    id: string
    departamentoId: string
    codigo: string
    nombre: string
    descripcion: string
    empleadosCount?: number | null
}

export type JerarquiaDepartamentoNode = {
    id: string
    areaId: string
    codigo: string
    nombre: string
    descripcion: string
    empleadosCount?: number | null
    servicios: JerarquiaServicioNode[]
}

export type JerarquiaAreaNode = {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    empleadosCount?: number | null
    departamentos: JerarquiaDepartamentoNode[]
}

export type JerarquiaOrganizacional = {
    areas: JerarquiaAreaNode[]
}

export type JerarquiaQuery = {
    includeCounts?: boolean
}
