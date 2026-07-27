export type Categoria = {
  id: string
  codigo: string
  nombre: string
  activo: boolean
}

export type CreateCategoriaPayload = {
  codigo: string
  nombre: string
  activo?: boolean
}

export type UpdateCategoriaPayload = CreateCategoriaPayload
