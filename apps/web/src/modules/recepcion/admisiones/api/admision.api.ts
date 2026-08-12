import { apiClient } from "@/lib/api/api-client";
import type {
  AdmisionDetalleResponse,
  AdmisionQueryParams,
  AdmisionResponse,
  CambiarEstadoRequest,
  CreateAdmisionDetalleRequest,
  CreateAdmisionRequest,
  CreateAdmisionConPacienteRequest,
  PagedResult,
  UpdateAdmisionDetalleRequest,
  UpdateAdmisionRequest,
} from "../types/admision.types";

export async function getAdmisiones(
  params?: AdmisionQueryParams
): Promise<PagedResult<AdmisionResponse>> {
  const response = await apiClient.get<PagedResult<AdmisionResponse>>("/admisiones", {
    params,
  });
  return response.data;
}

export async function getAdmisionById(id: number): Promise<AdmisionResponse> {
  const response = await apiClient.get<AdmisionResponse>(`/admisiones/${id}`);
  return response.data;
}

export async function createAdmision(
  request: CreateAdmisionRequest
): Promise<AdmisionResponse> {
  const response = await apiClient.post<AdmisionResponse>("/admisiones", request);
  return response.data;
}

export async function createAdmisionConPaciente(
  request: CreateAdmisionConPacienteRequest
): Promise<AdmisionResponse> {
  const response = await apiClient.post<AdmisionResponse>("/admisiones/con-paciente", request);
  return response.data;
}


export async function updateAdmision(
  id: number,
  request: UpdateAdmisionRequest
): Promise<AdmisionResponse> {
  const response = await apiClient.put<AdmisionResponse>(`/admisiones/${id}`, request);
  return response.data;
}

export async function deleteAdmision(id: number): Promise<void> {
  await apiClient.delete(`/admisiones/${id}`);
}

export async function cambiarEstadoAdmision(
  id: number,
  request: CambiarEstadoRequest
): Promise<AdmisionResponse> {
  const response = await apiClient.patch<AdmisionResponse>(`/admisiones/${id}/estado`, request);
  return response.data;
}

// Submódulo de detalles de admisión
export async function getAdmisionDetalles(
  admisionId: number,
  params?: AdmisionQueryParams
): Promise<PagedResult<AdmisionDetalleResponse>> {
  const response = await apiClient.get<PagedResult<AdmisionDetalleResponse>>(
    `/admisiones/${admisionId}/detalles`,
    { params }
  );
  return response.data;
}

export async function getAdmisionDetalleById(
  admisionId: number,
  detalleId: number
): Promise<AdmisionDetalleResponse> {
  const response = await apiClient.get<AdmisionDetalleResponse>(
    `/admisiones/${admisionId}/detalles/${detalleId}`
  );
  return response.data;
}

export async function createAdmisionDetalle(
  admisionId: number,
  request: CreateAdmisionDetalleRequest
): Promise<AdmisionDetalleResponse> {
  const response = await apiClient.post<AdmisionDetalleResponse>(
    `/admisiones/${admisionId}/detalles`,
    request
  );
  return response.data;
}

export async function updateAdmisionDetalle(
  admisionId: number,
  detalleId: number,
  request: UpdateAdmisionDetalleRequest
): Promise<AdmisionDetalleResponse> {
  const response = await apiClient.put<AdmisionDetalleResponse>(
    `/admisiones/${admisionId}/detalles/${detalleId}`,
    request
  );
  return response.data;
}

export async function deleteAdmisionDetalle(
  admisionId: number,
  detalleId: number
): Promise<void> {
  await apiClient.delete(`/admisiones/${admisionId}/detalles/${detalleId}`);
}
