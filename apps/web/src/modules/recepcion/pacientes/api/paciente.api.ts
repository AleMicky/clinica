import { apiClient } from "@/lib/api/api-client";
import type {
  CreatePacienteConvenioRequest,
  CreatePacienteRequest,
  PagedResult,
  PacienteConvenioResponse,
  PacienteQueryParams,
  PacienteResponse,
  UpdatePacienteConvenioRequest,
  UpdatePacienteRequest,
} from "../types/paciente.types";

export async function getPacientes(
  params?: PacienteQueryParams
): Promise<PagedResult<PacienteResponse>> {
  const response = await apiClient.get<PagedResult<PacienteResponse>>("/pacientes", {
    params,
  });
  return response.data;
}

export async function getPacienteById(id: number): Promise<PacienteResponse> {
  const response = await apiClient.get<PacienteResponse>(`/pacientes/${id}`);
  return response.data;
}

export async function createPaciente(
  request: CreatePacienteRequest
): Promise<PacienteResponse> {
  const response = await apiClient.post<PacienteResponse>("/pacientes", request);
  return response.data;
}

export async function updatePaciente(
  id: number,
  request: UpdatePacienteRequest
): Promise<PacienteResponse> {
  const response = await apiClient.put<PacienteResponse>(`/pacientes/${id}`, request);
  return response.data;
}

export async function deletePaciente(id: number): Promise<void> {
  await apiClient.delete(`/pacientes/${id}`);
}

// Submódulo Convenios del Paciente
export async function getPacienteConvenios(
  pacienteId: number
): Promise<PagedResult<PacienteConvenioResponse>> {
  const response = await apiClient.get<PagedResult<PacienteConvenioResponse>>(
    `/pacientes/${pacienteId}/convenios`
  );
  return response.data;
}

export async function createPacienteConvenio(
  pacienteId: number,
  request: CreatePacienteConvenioRequest
): Promise<PacienteConvenioResponse> {
  const response = await apiClient.post<PacienteConvenioResponse>(
    `/pacientes/${pacienteId}/convenios`,
    request
  );
  return response.data;
}

export async function updatePacienteConvenio(
  pacienteId: number,
  id: number,
  request: UpdatePacienteConvenioRequest
): Promise<PacienteConvenioResponse> {
  const response = await apiClient.put<PacienteConvenioResponse>(
    `/pacientes/${pacienteId}/convenios/${id}`,
    request
  );
  return response.data;
}

export async function deletePacienteConvenio(
  pacienteId: number,
  id: number
): Promise<void> {
  await apiClient.delete(`/pacientes/${pacienteId}/convenios/${id}`);
}
