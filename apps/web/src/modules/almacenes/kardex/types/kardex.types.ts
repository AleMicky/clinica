export interface KardexQueryParams {
  almacenId?: number;
  productoId?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface KardexMovimientoItem {
  movimientoId: number;
  numero: string;
  fecha: string;
  tipoMovimientoCodigo: string;
  tipoMovimientoNombre: string;
  naturaleza: "ENTRADA" | "SALIDA" | string;
  referenciaOrigen?: string | null;
  observaciones?: string | null;
  // Entrada
  cantidadEntrada: number;
  costoUnitarioEntrada: number;
  valorTotalEntrada: number;
  // Salida
  cantidadSalida: number;
  costoUnitarioSalida: number;
  valorTotalSalida: number;
  // Saldo
  saldoCantidad: number;
  saldoCostoUnitario: number;
  saldoValorTotal: number;
}

export interface KardexResponse {
  almacenId: number;
  almacenNombre: string;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  saldoInicialCantidad: number;
  saldoInicialCostoUnitario: number;
  saldoInicialValorTotal: number;
  saldoFinalCantidad: number;
  saldoFinalCostoUnitario: number;
  saldoFinalValorTotal: number;
  movimientos: KardexMovimientoItem[];
}
