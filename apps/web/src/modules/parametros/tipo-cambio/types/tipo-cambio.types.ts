export interface TipoCambioResponse {
  id: number;
  monedaOrigenId: number;
  monedaDestinoId: number;
  compra: number;
  venta: number;
  fecha: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export interface CreateTipoCambioRequest {
  monedaOrigenId: number;
  monedaDestinoId: number;
  compra: number;
  venta: number;
  fecha: string;
}

export interface UpdateTipoCambioRequest extends CreateTipoCambioRequest {}

export interface TipoCambioQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface TipoCambioMetrics {
  ultimaTasa: string;
  tasaCompraPromedio: string;
  totalRegistros: number;
  ultimaFecha: string;
}
