import type { CreatePacienteRequest, PacienteResponse } from "../../pacientes/types/paciente.types";

export type { PagedResult } from "../../pacientes/types/paciente.types";

export enum EstadoAdmision {
  Registrada = 1,
  Confirmada = 2,
  EnviadaVenta = 3,
  Cancelada = 4,
}

export const EstadoAdmisionLabels: Record<EstadoAdmision, string> = {
  [EstadoAdmision.Registrada]: "Registrada",
  [EstadoAdmision.Confirmada]: "Confirmada",
  [EstadoAdmision.EnviadaVenta]: "Enviada a Venta",
  [EstadoAdmision.Cancelada]: "Cancelada",
};

export interface PersonaInfoAdmision {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  tipoDocumento: string;
  numeroDocumento: string;
  extensionDocumento?: string | null;
  complementoDocumento?: string | null;
  telefono?: string | null;
}

export interface PacienteInfoAdmision {
  id: number;
  numeroHistoriaClinica: string;
  persona: PersonaInfoAdmision;
}

export type PacienteAdmision = PacienteInfoAdmision | PacienteResponse;

export interface ConvenioInfoAdmision {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ServicioInfoAdmision {
  id: number;
  codigo: string;
  nombre: string;
}

export interface EmpleadoBaseInfo {
  id: number;
  codigoEmpleado?: string | null;
  nombreCompleto: string;
}

export interface EmpleadoInfoAdmision {
  id: number;
  codigoEmpleado: string;
  nombreCompleto: string;
}

export interface MedicoInfoAdmision {
  id: number;
  empleado?: EmpleadoInfoAdmision | null;
  matriculaProfesional: string;
}

export interface AdmisionDetalleResponse {
  id: number;
  admisionId: number;
  servicio?: ServicioInfoAdmision | null;
  servicioId?: number;
  servicioNombre?: string | null;
  medico?: MedicoInfoAdmision | null;
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
  paciente?: PacienteAdmision | null;
  pacienteId?: number;
  pacienteNombre?: string | null;
  pacienteDocumento?: string | null;
  recepcionista?: EmpleadoBaseInfo | null;
  recepcionistaId?: number;
  convenio?: ConvenioInfoAdmision | null;
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

export function formatPacienteNombre(
  paciente?: PacienteAdmision | null,
  fallback = "Paciente sin registrar"
): string {
  if (!paciente) return fallback;
  const persona = "persona" in paciente ? paciente.persona : paciente;
  if (!persona) return fallback;
  const nombres = persona.nombres || "";
  const paterno = persona.apellidoPaterno || "";
  const materno = persona.apellidoMaterno || "";
  return `${nombres} ${paterno} ${materno}`.trim() || fallback;
}

export function formatPacienteDocumento(
  paciente?: PacienteAdmision | null,
  fallback = "Sin Documento"
): string {
  if (!paciente) return fallback;
  const persona = "persona" in paciente ? paciente.persona : paciente;
  if (!persona?.numeroDocumento) return fallback;
  return persona.tipoDocumento
    ? `${persona.tipoDocumento}: ${persona.numeroDocumento}`
    : persona.numeroDocumento;
}

export function formatRecepcionistaNombre(
  recepcionista?: EmpleadoBaseInfo | null,
  fallback?: string | null
): string {
  return recepcionista?.nombreCompleto || fallback || "Recepción General";
}

export function formatConvenioNombre(
  convenio?: ConvenioInfoAdmision | null,
  fallback?: string | null
): string {
  return convenio?.nombre || fallback || "Particular (Sin Convenio)";
}

export function formatServicioNombre(detalle: AdmisionDetalleResponse): string {
  return (
    detalle.servicio?.nombre ||
    detalle.servicioNombre ||
    `Servicio #${detalle.servicioId || detalle.id}`
  );
}

export function formatMedicoNombre(detalle: AdmisionDetalleResponse): string {
  return (
    detalle.medico?.empleado?.nombreCompleto ||
    detalle.medicoNombre ||
    (detalle.medicoId ? `Médico #${detalle.medicoId}` : "Médico de Guardia")
  );
}

export interface CreateAdmisionDetalleRequest {
  servicioId: number;
  medicoId?: number | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

export type UpdateAdmisionDetalleRequest = CreateAdmisionDetalleRequest;

export interface CreateAdmisionRequest {
  numero?: string;
  pacienteId: number;
  recepcionistaId: number;
  convenioId?: number | null;
  fechaHora: string;
  observacion?: string | null;
  detalles: CreateAdmisionDetalleRequest[];
}

export interface CreateAdmisionConPacienteRequest {
  paciente: CreatePacienteRequest;
  numero?: string;
  recepcionistaId: number;
  convenioId?: number | null;
  fechaHora: string;
  observacion?: string | null;
  detalles: CreateAdmisionDetalleRequest[];
}

export interface UpdateAdmisionRequest {
  numero?: string;
  pacienteId: number;
  recepcionistaId: number;
  convenioId?: number | null;
  fechaHora: string;
  observacion?: string | null;
  detalles?: CreateAdmisionDetalleRequest[];
}

export interface CambiarEstadoRequest {
  estadoDestino: EstadoAdmision;
  motivo?: string;
}

export interface AdmisionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  estado?: EstadoAdmision;
  fechaDesde?: string;
  fechaHasta?: string;
  convenioId?: number;
}

export interface ExportarAdmisionesQueryParams {
  search?: string;
  estado?: EstadoAdmision;
  fechaDesde?: string;
  fechaHasta?: string;
  convenioId?: number;
}

export type EstadoAdmisionTab = EstadoAdmision | "TODOS";

export interface AdmisionCounts {
  todos: number;
  registradas: number;
  confirmadas: number;
  enviadasVenta: number;
  canceladas: number;
}

export interface AdmisionMetrics {
  totalHoy: number;
  registradas: number;
  confirmadas: number;
  enviadasVenta: number;
  canceladas?: number;
  montoTotalHoy: number;
}

export interface AdmisionMetricsQueryParams {
  fechaDesde?: string;
  fechaHasta?: string;
}
