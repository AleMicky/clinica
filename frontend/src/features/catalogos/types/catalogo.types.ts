export type EntityId = string

export type CatalogoGrupo = {
    id: EntityId
    codigo: string
    nombre: string
    descripcion: string
}

export type CatalogoItem = {
    id: EntityId
    catalogoGrupoId: EntityId
    codigo: string
    nombre: string
    valor: string
    orden: number
}

export type CreateCatalogoGrupoPayload = {
    codigo: string
    nombre: string
    descripcion: string
}

export type UpdateCatalogoGrupoPayload = {
    nombre: string
    descripcion: string
}

export type CreateCatalogoItemPayload = {
    catalogoGrupoId: EntityId
    codigo: string
    nombre: string
    valor: string
    orden: number
}

export type UpdateCatalogoItemPayload = CreateCatalogoItemPayload

export type CatalogoItemOption = {
    id: EntityId
    codigo: string
    nombre: string
    valor: string
    orden: number
}

export type CatalogoGrupoConItems = CatalogoGrupo & {
    items: CatalogoItemOption[]
}

export type CatalogoItemPagedQuery = {
    page?: number
    pageSize?: number
    catalogoGrupoId?: EntityId
}
