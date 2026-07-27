export type Producto = {
  id: string
  codigo: string
  nombre: string
  categoriaId: string
  categoriaNombre: string
  unidadMedidaId: string
  stockMinimo: number
  controlaLote: boolean
  controlaVencimiento: boolean
  esMedicamento: boolean
  activo: boolean
}

export type CreateProductoPayload = {
  codigo: string
  nombre: string
  categoriaId: string
  unidadMedidaId: string
  stockMinimo?: number
  controlaLote?: boolean
  controlaVencimiento?: boolean
  esMedicamento?: boolean
  activo?: boolean
}

export type UpdateProductoPayload = CreateProductoPayload
