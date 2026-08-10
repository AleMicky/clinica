import { apiClient } from "@/lib/api/api-client";
import type {
  CreateMedicoEspecialidadRequest,
  CreateMedicoRequest,
  CreateMedicoServicioAcuerdoRequest,
  MedicoEspecialidadResponse,
  MedicoQueryParams,
  MedicoResponse,
  MedicoServicioAcuerdoResponse,
  PagedResult,
  UpdateMedicoEspecialidadRequest,
  UpdateMedicoRequest,
  UpdateMedicoServicioAcuerdoRequest,
} from "../types/medico.types";

// === Medico Endpoints ===

export async function getMedicos(
  params?: MedicoQueryParams
): Promise<PagedResult<MedicoResponse>> {
  const response = await apiClient.get<PagedResult<MedicoResponse>>("/medicos", {
    params,
  });
  return response.data;
}

export async function getMedicoById(id: number): Promise<MedicoResponse> {
  const response = await apiClient.get<MedicoResponse>(`/medicos/${id}`);
  return response.data;
}

export async function createMedico(
  request: CreateMedicoRequest
): Promise<MedicoResponse> {
  const response = await apiClient.post<MedicoResponse>("/medicos", request);
  return response.data;
}

export async function updateMedico(
  id: number,
  request: UpdateMedicoRequest
): Promise<MedicoResponse> {
  const response = await apiClient.put<MedicoResponse>(`/medicos/${id}`, request);
  return response.data;
}

export async function deleteMedico(id: number): Promise<void> {
  await apiClient.delete(`/medicos/${id}`);
}

// === Medico Especialidades Endpoints ===

export async function getMedicoEspecialidades(
  empleadoId: number,
  medicoId: number
): Promise<PagedResult<MedicoEspecialidadResponse>> {
  const response = await apiClient.get<PagedResult<MedicoEspecialidadResponse>>(
    `/empleados/${empleadoId}/medicos/${medicoId}/especialidades`,
    { params: { pageSize: 100 } }
  );
  return response.data;
}

export async function createMedicoEspecialidad(
  empleadoId: number,
  medicoId: number,
  request: CreateMedicoEspecialidadRequest
): Promise<MedicoEspecialidadResponse> {
  const response = await apiClient.post<MedicoEspecialidadResponse>(
    `/empleados/${empleadoId}/medicos/${medicoId}/especialidades`,
    request
  );
  return response.data;
}

export async function updateMedicoEspecialidad(
  empleadoId: number,
  medicoId: number,
  id: number,
  request: UpdateMedicoEspecialidadRequest
): Promise<MedicoEspecialidadResponse> {
  const response = await apiClient.put<MedicoEspecialidadResponse>(
    `/empleados/${empleadoId}/medicos/${medicoId}/especialidades/${id}`,
    request
  );
  return response.data;
}

export async function deleteMedicoEspecialidad(
  empleadoId: number,
  medicoId: number,
  id: number
): Promise<void> {
  await apiClient.delete(
    `/empleados/${empleadoId}/medicos/${medicoId}/especialidades/${id}`
  );
}

// === Medico Servicio Acuerdos Endpoints ===

export async function getMedicoServicioAcuerdos(
  empleadoId: number,
  medicoId: number
): Promise<PagedResult<MedicoServicioAcuerdoResponse>> {
  const response = await apiClient.get<PagedResult<MedicoServicioAcuerdoResponse>>(
    `/empleados/${empleadoId}/medicos/${medicoId}/servicios-acuerdo`,
    { params: { pageSize: 100 } }
  );
  return response.data;
}

export async function createMedicoServicioAcuerdo(
  empleadoId: number,
  medicoId: number,
  request: CreateMedicoServicioAcuerdoRequest
): Promise<MedicoServicioAcuerdoResponse> {
  const response = await apiClient.post<MedicoServicioAcuerdoResponse>(
    `/empleados/${empleadoId}/medicos/${medicoId}/servicios-acuerdo`,
    request
  );
  return response.data;
}

export async function updateMedicoServicioAcuerdo(
  empleadoId: number,
  medicoId: number,
  id: number,
  request: UpdateMedicoServicioAcuerdoRequest
): Promise<MedicoServicioAcuerdoResponse> {
  const response = await apiClient.put<MedicoServicioAcuerdoResponse>(
    `/empleados/${empleadoId}/medicos/${medicoId}/servicios-acuerdo/${id}`,
    request
  );
  return response.data;
}

export async function deleteMedicoServicioAcuerdo(
  empleadoId: number,
  medicoId: number,
  id: number
): Promise<void> {
  await apiClient.delete(
    `/empleados/${empleadoId}/medicos/${medicoId}/servicios-acuerdo/${id}`
  );
}
