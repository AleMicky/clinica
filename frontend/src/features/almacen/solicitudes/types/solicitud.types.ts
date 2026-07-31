export type SolicitudDetalleRequest = {
  productoId: string
  cantidadSolicitada: number
  observacion?: string | null
}

export type CreateSolicitudPayload = {
  areaSolicitanteId: string
  empleadoSolicitanteId: string
  almacenId: string
  detalles: SolicitudDetalleRequest[]
  observacion?: string | null
}

export type SolicitudListItem = {
  id: string
  numero: string
  fechaSolicitud: string
  almacenNombre: string
  estado: string
}

export type SolicitudDetalle = {
  id: string
  productoId: string
  productoCodigo: string
  productoNombre: string
  cantidadSolicitada: number
  cantidadAprobada: number
  cantidadEntregada: number
  observacion?: string | null
}

export type Solicitud = {
  id: string
  numero: string
  fechaSolicitud: string
  areaSolicitanteId: string
  empleadoSolicitanteId: string
  almacenId: string
  almacenNombre: string
  estado: string
  observacion?: string | null
  detalles: SolicitudDetalle[]
}

export type AprobarSolicitudPayload = {
  detalles: Array<{ detalleId: string; cantidadAprobada: number }>
}

export type AtenderSolicitudPayload = {
  detalles: Array<{ detalleId: string; cantidadEntregar: number }>
}
