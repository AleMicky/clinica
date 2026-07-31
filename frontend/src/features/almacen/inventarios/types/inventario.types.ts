export type CreateInventarioPayload = {
  almacenId: string
  observacion?: string | null
}

export type InventarioListItem = {
  id: string
  numero: string
  almacenNombre: string
  fechaInicio: string
  estado: string
}

export type InventarioDetalle = {
  id: string
  productoId: string
  productoCodigo: string
  productoNombre: string
  productoLoteId?: string | null
  loteNumero?: string | null
  cantidadSistema: number
  cantidadContada: number
  diferencia: number
  observacion?: string | null
}

export type InventarioFisico = {
  id: string
  numero: string
  almacenId: string
  almacenNombre: string
  fechaInicio: string
  fechaFinalizacion?: string | null
  estado: string
  observacion?: string | null
  detalles: InventarioDetalle[]
}

export type ContarInventarioPayload = {
  detalles: Array<{
    productoId: string
    cantidadContada: number
    productoLoteId?: string | null
    observacion?: string | null
  }>
}
