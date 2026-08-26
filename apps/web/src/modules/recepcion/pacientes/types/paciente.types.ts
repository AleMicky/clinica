export interface PacientePersonaResponse {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento: string;
  extensionDocumento?: string | null;
  complementoDocumento?: string | null;
  genero?: string | null;
  estadoCivil?: string | null;
}

export interface PacienteResponse {
  id: number;
  numeroHistoriaClinica: string;
  persona: PacientePersonaResponse;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreatePacienteRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  telefono?: string;
  direccion?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  extensionDocumento?: string;
  complementoDocumento?: string;
  genero?: string;
  estadoCivil?: string;
}

export interface UpdatePacienteRequest extends CreatePacienteRequest {}

export interface ConvenioInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface PacienteConvenioResponse {
  id: number;
  pacienteId: number;
  convenioId: number;
  convenio?: ConvenioInfo | null;
  numeroAfiliado?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  esPrincipal: boolean;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreatePacienteConvenioRequest {
  convenioId: number;
  numeroAfiliado?: string;
  fechaInicio: string;
  fechaFin?: string;
  esPrincipal: boolean;
}

export interface UpdatePacienteConvenioRequest extends CreatePacienteConvenioRequest {}

export interface PacienteQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface PacienteMetrics {
  totalPacientes: number;
  pacientesActivos: number;
  conTelefono: number;
  conConvenio: number;
}

export interface ExcelImportError {
  row: number;
  column?: string | null;
  value?: string | null;
  message: string;
}

export interface ExcelImportResult {
  total: number;
  importados: number;
  omitidos: number;
  errores: number;
  errors: ExcelImportError[];
}
