export type MovimientoDetalleLinea = {
  productoId: string
  loteId?: string | null
  cantidad: number
  costoUnitario?: number | null
  numeroLote?: string | null
  fechaVencimiento?: string | null
}

export type MovimientoDetalle = {
  id: string
  productoId: string
  productoCodigo: string
  productoNombre: string
  loteId?: string | null
  loteNumero?: string | null
  cantidad: number
  costoUnitario?: number | null
}

export type Movimiento = {
  id: string
  numero: string
  tipo: string
  fecha: string
  estado: string
  observaciones?: string | null
  moduloOrigen?: string | null
  entidadOrigen?: string | null
  referenciaId?: string | null
  proveedorId?: string | null
  workflowInstanceId?: string | null
  requiereAprobacion: boolean
  detalles: MovimientoDetalle[]
  almacenOrigenId?: string | null
  almacenDestinoId?: string | null
}

export type MovimientoListItem = {
  id: string
  numero: string
  tipo: string
  fecha: string
  estado: string
  requiereAprobacion: boolean
  workflowInstanceId?: string | null
}

export type RegistrarIngresoPayload = {
  lineas: MovimientoDetalleLinea[]
  proveedorId?: string | null
  observaciones?: string | null
  almacenId?: string | null
}

export type RegistrarSalidaPayload = {
  lineas: MovimientoDetalleLinea[]
  observaciones?: string | null
  usarFefo?: boolean
  almacenId?: string | null
}

export type RegistrarAjustePayload = {
  lineas: MovimientoDetalleLinea[]
  observaciones?: string | null
  empleadoId?: string | null
  almacenId?: string | null
}

export type RegistrarBajaPayload = RegistrarAjustePayload

export type RegistrarTransferenciaSimplePayload = {
  lineas: MovimientoDetalleLinea[]
  observaciones?: string | null
  empleadoId?: string | null
  almacenOrigenId?: string | null
  almacenDestinoId?: string | null
}
