export type MedicamentoDetalle = {
  nombreGenerico?: string | null
  nombreComercial?: string | null
  concentracion?: string | null
  presentacion?: string | null
  formaFarmaceuticaId?: string | null
  requiereReceta?: boolean
  esControlado?: boolean
}

export type Producto = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  codigoBarras?: string | null
  categoriaId: string
  categoriaNombre: string
  unidadMedidaId: string
  unidadMedidaNombre?: string | null
  stockMinimo: number
  stockMaximo: number
  controlaLote: boolean
  controlaVencimiento: boolean
  manejaSerie: boolean
  esMedicamento: boolean
  activo: boolean
  medicamento?: MedicamentoDetalle | null
}

export type CreateProductoPayload = {
  codigo: string
  nombre: string
  categoriaId: string
  unidadMedidaId: string
  descripcion?: string | null
  codigoBarras?: string | null
  stockMinimo?: number
  stockMaximo?: number
  controlaLote?: boolean
  controlaVencimiento?: boolean
  manejaSerie?: boolean
  esMedicamento?: boolean
  activo?: boolean
  medicamento?: MedicamentoDetalle | null
}

export type UpdateProductoPayload = CreateProductoPayload
