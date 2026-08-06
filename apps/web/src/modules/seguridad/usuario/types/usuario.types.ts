import type { PersonaResponse } from "../../persona/types/persona.types";

export interface UsuarioResponse {
  id: number;
  userName: string;
  email: string;
  activo: boolean;
  debeCambiarPassword?: boolean;
  persona?: PersonaResponse | null;
  roles: string[];
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

export interface PersonaUsuarioPayload {
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

export interface CreateUsuarioRequest {
  persona?: PersonaUsuarioPayload;
  email: string;
  userName: string;
  password?: string;
  roles?: string[];
}

export interface UpdateUsuarioRequest {
  email: string;
  userName: string;
  activo: boolean;
  roles?: string[];
}

export interface UsuarioQueryParams {
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

export interface UsuarioMetrics {
  totalUsuarios: number;
  cuentasActivas: number;
  cuentasBloqueadas: number;
  coberturaSeguridad: number;
}
