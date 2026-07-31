export type DisponibilidadLote = {
  loteId: string
  numero: string
  fechaVencimiento?: string | null
  cantidad: number
}

export type DisponibilidadProducto = {
  productoId: string
  productoCodigo: string
  productoNombre: string
  cantidadDisponible: number
  stockMinimo: number
  bajoMinimo: boolean
  lotes: DisponibilidadLote[]
}
