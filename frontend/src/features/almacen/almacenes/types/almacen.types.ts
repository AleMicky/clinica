export type TipoAlmacen = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

export type AlmacenCatalogo = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  tipoAlmacenId: string
  tipoAlmacenNombre: string
  responsableEmpleadoId?: string | null
  permiteVenta: boolean
  permiteDispensacion: boolean
  permiteStockNegativo: boolean
}

export type AlmacenCatalogoPayload = {
  codigo: string
  nombre: string
  tipoAlmacenId: string
  descripcion?: string | null
  responsableEmpleadoId?: string | null
  permiteVenta?: boolean
  permiteDispensacion?: boolean
  permiteStockNegativo?: boolean
}
