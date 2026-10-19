export type TipoAlertaStock =
  | "SinStock"
  | "StockBajo"
  | "ProximoVencer"
  | "Vencido";

export type SeveridadAlerta = "Critica" | "Alta" | "Media" | "Baja";

export interface AlertaStockResponse {
  almacenId: number;
  almacenNombre: string;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  tipoAlerta: TipoAlertaStock;
  severidad: SeveridadAlerta;
  stockActual: number;
  stockMinimo?: number | null;
  lote?: string | null;
  fechaVencimiento?: string | null;
  diasParaVencer?: number | null;
  mensaje: string;
}

export interface AlertasStockQueryParams {
  almacenId?: number;
  tipo?: TipoAlertaStock;
  diasPorVencer?: number;
}
