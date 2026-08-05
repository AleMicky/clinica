export interface PersonaResponse {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fechaNacimiento: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento: string;
  numeroDocumento: string;
  extensionDocumento?: string | null;
  complementoDocumento?: string | null;
  genero?: string | null;
  estadoCivil?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreatePersonaRequest {
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

export interface UpdatePersonaRequest extends CreatePersonaRequest {}

export interface PersonaQueryParams {
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

export interface PersonaMetrics {
  totalPersonas: number;
  personasActivas: number;
  conTelefono: number;
  personasInactivas: number;
}
