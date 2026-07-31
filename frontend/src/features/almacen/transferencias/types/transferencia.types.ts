export type TransferenciaDetalleRequest = {
  productoId: string
  cantidadSolicitada: number
  productoLoteOrigenId?: string | null
  observacion?: string | null
}

export type CreateTransferenciaPayload = {
  almacenOrigenId: string
  almacenDestinoId: string
  empleadoSolicitanteId: string
  detalles: TransferenciaDetalleRequest[]
  observacion?: string | null
}

export type TransferenciaListItem = {
  id: string
  numero: string
  fechaSolicitud: string
  almacenOrigenNombre: string
  almacenDestinoNombre: string
  estado: string
}

export type TransferenciaDetalle = {
  id: string
  productoId: string
  productoCodigo: string
  productoNombre: string
  productoLoteOrigenId?: string | null
  loteNumero?: string | null
  cantidadSolicitada: number
  cantidadEnviada: number
  cantidadRecibida: number
  observacion?: string | null
}

export type Transferencia = {
  id: string
  numero: string
  fechaSolicitud: string
  almacenOrigenId: string
  almacenOrigenNombre: string
  almacenDestinoId: string
  almacenDestinoNombre: string
  empleadoSolicitanteId: string
  empleadoAprobadorId?: string | null
  empleadoDespachoId?: string | null
  empleadoRecepcionId?: string | null
  fechaEnvio?: string | null
  fechaRecepcion?: string | null
  estado: string
  observacion?: string | null
  detalles: TransferenciaDetalle[]
}
