export enum EstadoMovimientoInventario {
  Borrador = 1,
  Confirmado = 2,
  Anulado = 3,
}

export type EstadoMovimientoInventarioValue =
  | EstadoMovimientoInventario
  | "borrador"
  | "confirmado"
  | "anulado"
  | "Borrador"
  | "Confirmado"
  | "Anulado"
  | number
  | string;

export function normalizeEstadoMovimiento(
  estado?: EstadoMovimientoInventarioValue | null
): EstadoMovimientoInventario | null {
  if (estado === null || estado === undefined) return null;
  if (
    estado === EstadoMovimientoInventario.Borrador ||
    String(estado).toLowerCase() === "borrador" ||
    String(estado) === "1"
  ) {
    return EstadoMovimientoInventario.Borrador;
  }
  if (
    estado === EstadoMovimientoInventario.Confirmado ||
    String(estado).toLowerCase() === "confirmado" ||
    String(estado) === "2"
  ) {
    return EstadoMovimientoInventario.Confirmado;
  }
  if (
    estado === EstadoMovimientoInventario.Anulado ||
    String(estado).toLowerCase() === "anulado" ||
    String(estado) === "3"
  ) {
    return EstadoMovimientoInventario.Anulado;
  }
  return null;
}

export const INTEGRATED_REFERENCIA_TIPOS = new Set([
  "DEVOLUCION_PROVEEDOR",
  "RECEPCION_COMPRA",
  "CONSUMO_INTERNO",
  "TRANSFERENCIA_ALMACEN",
  "BAJA_INVENTARIO",
  "AJUSTE_INVENTARIO",
  "DISPENSACION",
  "INVENTARIO_FISICO",
  "INVENTARIOFISICO",
  "INTEGRACION",
  "CIRUGIA",
  "QUIROFANO",
]);

export interface MovimientoInventarioDetalleRequest {
  productoId: number;
  cantidad: number;
  costoUnitario?: number | null;
}

export interface MovimientoInventarioRequest {
  numero?: string;
  tipoMovimientoInventarioId: number;
  almacenId: number;
  fechaMovimiento: string;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  esIntegrado?: boolean;
  observacion?: string | null;
  detalles: MovimientoInventarioDetalleRequest[];
}

export type CreateMovimientoInventarioRequest = MovimientoInventarioRequest;

export type UpdateMovimientoInventarioRequest = MovimientoInventarioRequest;

export interface AnularMovimientoInventarioRequest {
  motivoAnulacion: string;
}

export interface MovimientoInventarioDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  cantidad: number;
  costoUnitario?: number | null;
  costoTotal: number;
}

export interface MovimientoInventarioResponse {
  id: number;
  numero: string;
  tipoMovimientoInventarioId: number;
  tipoMovimientoNombre?: string | null;
  almacenId: number;
  almacenNombre?: string | null;
  fechaMovimiento: string;
  estado: EstadoMovimientoInventarioValue;
  referenciaTipo?: string | null;
  referenciaId?: number | null;
  esIntegrado?: boolean;
  observacion?: string | null;
  fechaConfirmacion?: string | null;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  detalles: MovimientoInventarioDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface MovimientoInventarioQueryParams {
  tipoMovimientoInventarioId?: number | null;
  almacenId?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function isMovimientoIntegrado(
  mov?: Pick<
    MovimientoInventarioResponse,
    "esIntegrado" | "referenciaTipo"
  > | null
): boolean {
  if (!mov) return false;
  if (mov.esIntegrado === true) return true;
  const ref = mov.referenciaTipo?.trim().toUpperCase();
  return Boolean(ref && INTEGRATED_REFERENCIA_TIPOS.has(ref));
}

export function canEditMovimiento(
  mov?: Pick<
    MovimientoInventarioResponse,
    "estado" | "esIntegrado" | "referenciaTipo"
  > | null
): boolean {
  if (!mov) return false;
  return (
    normalizeEstadoMovimiento(mov.estado) ===
      EstadoMovimientoInventario.Borrador && !isMovimientoIntegrado(mov)
  );
}
