export enum TipoBajaInventario {
  Vencimiento = 1,
  Danio = 2,
  Merma = 3,
}

export enum EstadoBajaInventario {
  Borrador = 1,
  Confirmado = 2,
  Anulado = 3,
}

export interface BajaInventarioDetalleRequest {
  productoId: number;
  loteId?: number | null;
  cantidad: number;
  observacion?: string | null;
}

export interface BajaInventarioRequest {
  numero: string;
  almacenId: number;
  tipo: TipoBajaInventario;
  fecha: string;
  motivo: string;
  observacion?: string | null;
  detalles: BajaInventarioDetalleRequest[];
}

export interface CreateBajaInventarioRequest extends BajaInventarioRequest {}

export interface UpdateBajaInventarioRequest extends BajaInventarioRequest {}

export interface AnularBajaInventarioRequest {
  motivoAnulacion: string;
}

export interface BajaInventarioDetalleResponse {
  id: number;
  productoId: number;
  productoNombre?: string | null;
  loteId?: number | null;
  loteNumero?: string | null;
  cantidad: number;
  observacion?: string | null;
}

export interface BajaInventarioResponse {
  id: number;
  numero: string;
  almacenId: number;
  almacenNombre?: string | null;
  tipo: TipoBajaInventario;
  fecha: string;
  motivo: string;
  observacion?: string | null;
  estado: EstadoBajaInventario;
  movimientoInventarioId?: number | null;
  fechaConfirmacion?: string | null;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  detalles: BajaInventarioDetalleResponse[];
  fechaCreacion?: string | null;
  creadoPor?: string | null;
  fechaModificacion?: string | null;
  modificadoPor?: string | null;
}

export interface BajaInventarioQueryParams {
  almacenId?: number | null;
  tipo?: TipoBajaInventario | null;
  estado?: EstadoBajaInventario | null;
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
