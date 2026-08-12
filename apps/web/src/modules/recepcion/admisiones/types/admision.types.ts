import type { PacienteResponse, PagedResult } from "../../pacientes/types/paciente.types";

export type { PagedResult };

export enum EstadoAdmision {
  Registrada = 1,
  PendientePago = 2,
  Pagada = 3,
  EnAtencion = 4,
  Finalizada = 5,
  Cancelada = 6,
}

export const EstadoAdmisionLabels: Record<EstadoAdmision, string> = {
  [EstadoAdmision.Registrada]: "Registrada",
  [EstadoAdmision.PendientePago]: "Pendiente de Pago",
  [EstadoAdmision.Pagada]: "Pagada",
  [EstadoAdmision.EnAtencion]: "En Atención",
  [EstadoAdmision.Finalizada]: "Finalizada",
  [EstadoAdmision.Cancelada]: "Cancelada",
};

export interface AdmisionDetalleResponse {
  id: number;
  admisionId: number;
  servicioId: number;
  servicioNombre?: string | null;
  medicoId?: number | null;
  medicoNombre?: string | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

export interface AdmisionResponse {
  id: number;
  numero: string;
  pacienteId: number;
  paciente?: PacienteResponse | null;
  pacienteNombre?: string | null;
  pacienteDocumento?: string | null;
  convenioId?: number | null;
  convenioNombre?: string | null;
  fechaHora: string;
  estado: EstadoAdmision;
  observacion?: string | null;
  detalles: AdmisionDetalleResponse[];
  totalAdmision?: number;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}

export interface CreateAdmisionDetalleRequest {
  servicioId: number;
  medicoId?: number | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

export interface UpdateAdmisionDetalleRequest extends CreateAdmisionDetalleRequest {}

export interface CreateAdmisionRequest {
  numero?: string;
  pacienteId: number;
  convenioId?: number | null;
  fechaHora: string;
  observacion?: string | null;
  detalles: CreateAdmisionDetalleRequest[];
}

export interface UpdateAdmisionRequest {
  numero: string;
  pacienteId: number;
  convenioId?: number | null;
  fechaHora: string;
  observacion?: string | null;
  detalles?: CreateAdmisionDetalleRequest[];
}

export interface CambiarEstadoRequest {
  nuevoEstado: EstadoAdmision;
  observacion?: string;
}

export interface AdmisionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoAdmision;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AdmisionMetrics {
  totalHoy: number;
  pendientesPago: number;
  enAtencion: number;
  finalizadas: number;
  montoTotalHoy: number;
}
