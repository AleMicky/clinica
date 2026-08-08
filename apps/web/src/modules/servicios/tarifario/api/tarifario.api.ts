import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTarifarioDetalleRequest,
  CreateTarifarioRequest,
  PagedResult,
  TarifarioDetalleResponse,
  TarifarioQueryParams,
  TarifarioResponse,
  UpdateTarifarioDetalleRequest,
  UpdateTarifarioRequest,
} from "../types/tarifario.types";

export async function getTarifarios(
  params?: TarifarioQueryParams
): Promise<PagedResult<TarifarioResponse>> {
  const response = await apiClient.get<PagedResult<TarifarioResponse>>("/tarifarios", {
    params,
  });
  return response.data;
}

export async function getTarifarioById(id: number): Promise<TarifarioResponse> {
  const response = await apiClient.get<TarifarioResponse>(`/tarifarios/${id}`);
  return response.data;
}

export async function createTarifario(
  request: CreateTarifarioRequest
): Promise<TarifarioResponse> {
  const response = await apiClient.post<TarifarioResponse>("/tarifarios", request);
  return response.data;
}

export async function updateTarifario(
  id: number,
  request: UpdateTarifarioRequest
): Promise<TarifarioResponse> {
  const response = await apiClient.put<TarifarioResponse>(`/tarifarios/${id}`, request);
  return response.data;
}

export async function deleteTarifario(id: number): Promise<void> {
  await apiClient.delete(`/tarifarios/${id}`);
}

// Detalles
export async function getTarifarioDetalles(
  tarifarioId: number,
  params?: TarifarioQueryParams
): Promise<PagedResult<TarifarioDetalleResponse>> {
  const response = await apiClient.get<PagedResult<TarifarioDetalleResponse>>(
    `/tarifarios/${tarifarioId}/detalles`,
    { params }
  );
  return response.data;
}

export async function createTarifarioDetalle(
  tarifarioId: number,
  request: CreateTarifarioDetalleRequest
): Promise<TarifarioDetalleResponse> {
  const response = await apiClient.post<TarifarioDetalleResponse>(
    `/tarifarios/${tarifarioId}/detalles`,
    request
  );
  return response.data;
}

export async function updateTarifarioDetalle(
  tarifarioId: number,
  detalleId: number,
  request: UpdateTarifarioDetalleRequest
): Promise<TarifarioDetalleResponse> {
  const response = await apiClient.put<TarifarioDetalleResponse>(
    `/tarifarios/${tarifarioId}/detalles/${detalleId}`,
    request
  );
  return response.data;
}

export async function deleteTarifarioDetalle(
  tarifarioId: number,
  detalleId: number
): Promise<void> {
  await apiClient.delete(`/tarifarios/${tarifarioId}/detalles/${detalleId}`);
}
