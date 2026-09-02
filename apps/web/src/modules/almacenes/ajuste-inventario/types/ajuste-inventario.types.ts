export enum TipoAjusteInventario {
  Positivo = 1,
  Negativo = 2,
}

export enum EstadoAjusteInventario {
  Borrador = 1,
  Confirmado = 2,
  Anulado = 3,
}

export interface AjusteInventarioDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidad: number;
}

export interface AjusteInventarioRequest {
  almacenId: number;
  tipo: TipoAjusteInventario;
  fecha: string;
  motivo: string;
  observacion?: string | null;
  detalles: AjusteInventarioDetalleRequest[];
}

export interface CreateAjusteInventarioRequest
  extends AjusteInventarioRequest { }

export interface UpdateAjusteInventarioRequest
  extends AjusteInventarioRequest { }

export interface AnularAjusteInventarioRequest {
  motivoAnulacion: string;
}

export interface AjusteInventarioDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidad: number;
}

export interface AjusteInventarioResponse {
  id: number;
  numero: string;
  almacenId: number;
  almacenNombre?: string | null;
  tipo: TipoAjusteInventario;
  fecha: string;
  motivo: string;
  observacion?: string | null;
  estado: EstadoAjusteInventario;
  movimientoInventarioId?: number | null;
  fechaConfirmacion?: string | null;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  detalles: AjusteInventarioDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface AjusteInventarioQueryParams {
  almacenId?: number | null;
  tipo?: TipoAjusteInventario | null;
  estado?: EstadoAjusteInventario | null;
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
