export enum EstadoInventarioFisico {
  Borrador = 1,
  EnConteo = 2,
  Cerrado = 3,
  Anulado = 4,
}

export interface InventarioFisicoDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidadSistema: number;
  cantidadContada?: number | null;
}

export interface InventarioFisicoRequest {
  numero: string;
  almacenId: number;
  fechaInicio: string;
  observacion?: string | null;
  detalles: InventarioFisicoDetalleRequest[];
}

export interface CreateInventarioFisicoRequest
  extends InventarioFisicoRequest {}

export interface UpdateInventarioFisicoRequest
  extends InventarioFisicoRequest {}

export interface InventarioFisicoConteoDetalleRequest {
  detalleId: number;
  cantidadContada: number;
}

export interface RegistrarConteoInventarioFisicoRequest {
  conteo: InventarioFisicoConteoDetalleRequest[];
}

export interface AnularInventarioFisicoRequest {
  motivoAnulacion: string;
}

export interface InventarioFisicoDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidadSistema: number;
  cantidadContada?: number | null;
  diferencia: number;
}

export interface InventarioFisicoResponse {
  id: number;
  numero: string;
  almacenId: number;
  almacenNombre?: string | null;
  fechaInicio: string;
  fechaCierre?: string | null;
  estado: EstadoInventarioFisico;
  observacion?: string | null;
  motivoAnulacion?: string | null;
  movimientoAjustePositivoId?: number | null;
  movimientoAjusteNegativoId?: number | null;
  detalles: InventarioFisicoDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface InventarioFisicoQueryParams {
  almacenId?: number | null;
  estado?: EstadoInventarioFisico | null;
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
