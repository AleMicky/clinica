export type EstadoCirugia =
  | "Programada"
  | "EnPreparacion"
  | "EnCurso"
  | "Recuperacion"
  | "Finalizada"
  | "Cancelada";

export type TipoCirugia = "Programada" | "Urgencia" | "Ambulatoria";

export type TipoAnestesia =
  | "General"
  | "RegionalRaquidea"
  | "Epidural"
  | "LocalYSedacion"
  | "Local";

export interface CirugiaGastoMaterialResponse {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  partidaInventarioId?: number;
  lote?: string;
  fechaVencimiento?: string;
  cantidad: number;
  costoUnitario: number;
  precioUnitario: number;
  subtotal: number;
  momentoQuirurgico?: string;
  observaciones?: string;
}

export interface CirugiaResponse {
  id: number;
  numero: string;
  tipo: TipoCirugia;
  tipoTexto: string;
  estado: EstadoCirugia;
  estadoTexto: string;
  tipoAnestesia: TipoAnestesia;
  tipoAnestesiaTexto: string;

  admisionId?: number;
  admisionNumero?: string;

  pacienteId: number;
  pacienteNombreCompleto: string;
  pacienteDocumento: string;
  pacienteHistoriaClinica: string;

  cirujanoPrincipalId: number;
  cirujanoNombreCompleto: string;
  cirujanoEspecialidad: string;

  anestesiologoId?: number;
  anestesiologoNombreCompleto?: string;

  primerAyudanteId?: number;
  primerAyudanteNombreCompleto?: string;

  instrumentista?: string;
  circulante?: string;

  salaOperaciones: string;
  procedimientoQuirurgico: string;
  diagnosticoPreOperatorio?: string;
  diagnosticoPostOperatorio?: string;

  fechaProgramada: string;
  fechaInicio?: string;
  fechaFin?: string;

  almacenId: number;
  almacenNombre: string;
  movimientoInventarioId?: number;

  observaciones?: string;
  motivoCancelacion?: string;

  totalCostoMateriales: number;
  totalPrecioMateriales: number;

  gastosMateriales: CirugiaGastoMaterialResponse[];

  fechaCreacion: string;
  fechaModificacion?: string;
  activo: boolean;
}

export interface CirugiaMetricsResponse {
  totalCirugias: number;
  totalProgramadas: number;
  totalEnCurso: number;
  totalFinalizadas: number;
  totalCanceladas: number;
  montoTotalMaterialesConsumidos: number;
}

export interface LoteMaterialStockResponse {
  partidaInventarioId: number;
  lote: string;
  fechaVencimiento?: string;
  cantidadDisponible: number;
}

export interface MaterialQuirofanoStockResponse {
  productoId: number;
  codigo: string;
  nombre: string;
  categoria?: string;
  unidadMedida?: string;
  stockDisponible: number;
  costoReferencial: number;
  precioReferencial: number;
  lotes: LoteMaterialStockResponse[];
}

export interface CirugiaGastoMaterialRequest {
  productoId: number;
  partidaInventarioId?: number;
  cantidad: number;
  precioUnitario?: number;
  momentoQuirurgico?: string;
  observaciones?: string;
}

export interface CreateCirugiaRequest {
  tipo: TipoCirugia;
  tipoAnestesia: TipoAnestesia;
  admisionId?: number;
  pacienteId: number;
  cirujanoPrincipalId: number;
  anestesiologoId?: number;
  primerAyudanteId?: number;
  instrumentista?: string;
  circulante?: string;
  salaOperaciones: string;
  procedimientoQuirurgico: string;
  diagnosticoPreOperatorio?: string;
  fechaProgramada: string;
  almacenId?: number;
  observaciones?: string;
  gastosMaterialesIniciales?: CirugiaGastoMaterialRequest[];
}

export interface UpdateCirugiaRequest {
  tipo: TipoCirugia;
  tipoAnestesia: TipoAnestesia;
  admisionId?: number;
  pacienteId: number;
  cirujanoPrincipalId: number;
  anestesiologoId?: number;
  primerAyudanteId?: number;
  instrumentista?: string;
  circulante?: string;
  salaOperaciones: string;
  procedimientoQuirurgico: string;
  diagnosticoPreOperatorio?: string;
  fechaProgramada: string;
  observaciones?: string;
}

export interface IniciarCirugiaRequest {
  fechaInicio?: string;
  observaciones?: string;
}

export interface RegistrarGastoMaterialCirugiaRequest {
  gastos: CirugiaGastoMaterialRequest[];
}

export interface FinalizarCirugiaRequest {
  fechaFin?: string;
  diagnosticoPostOperatorio?: string;
  observaciones?: string;
  gastosFinales?: CirugiaGastoMaterialRequest[];
}

export interface CancelarCirugiaRequest {
  motivoCancelacion: string;
}

export interface CirugiaQueryParams {
  page?: number;
  pageSize?: number;
  estado?: EstadoCirugia;
  tipo?: TipoCirugia;
  cirujanoId?: number;
  sala?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
