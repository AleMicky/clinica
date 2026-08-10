export interface PersonaInfo {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
}

export interface EmpleadoInfo {
  id: number;
  codigoEmpleado: string;
  nombreCompleto: string;
  persona?: PersonaInfo | null;
}

export interface MedicoResponse {
  id: number;
  empleadoId: number;
  empleado?: EmpleadoInfo | null;
  matriculaProfesional: string;
  registroMinisterioSalud?: string | null;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateMedicoRequest {
  empleadoId: number;
  matriculaProfesional: string;
  registroMinisterioSalud?: string | null;
}

export interface UpdateMedicoRequest {
  empleadoId: number;
  matriculaProfesional: string;
  registroMinisterioSalud?: string | null;
}

export interface MedicoQueryParams {
  empleadoId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface EspecialidadInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MedicoEspecialidadResponse {
  id: number;
  medicoId: number;
  especialidadId: number;
  especialidad?: EspecialidadInfo | null;
  esPrincipal: boolean;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateMedicoEspecialidadRequest {
  especialidadId: number;
  esPrincipal: boolean;
}

export interface UpdateMedicoEspecialidadRequest {
  especialidadId: number;
  esPrincipal: boolean;
}

export interface ServicioInfo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MedicoServicioAcuerdoResponse {
  id: number;
  medicoId: number;
  servicioId: number;
  servicio?: ServicioInfo | null;
  porcentajeMedico: number;
  fechaInicio: string;
  fechaFin?: string | null;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateMedicoServicioAcuerdoRequest {
  servicioId: number;
  porcentajeMedico: number;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface UpdateMedicoServicioAcuerdoRequest {
  servicioId: number;
  porcentajeMedico: number;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
