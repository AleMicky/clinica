export type CategoriaProducto = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type CategoriaProductoPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
}
