import { apiClient } from "@/lib/api/api-client";
import type {
  ConvenioQueryParams,
  ConvenioResponse,
  ConvenioTarifarioResponse,
  CreateConvenioRequest,
  CreateConvenioTarifarioRequest,
  PagedResult,
  UpdateConvenioRequest,
  UpdateConvenioTarifarioRequest,
} from "../types/convenio.types";

export async function getConvenios(
  params?: ConvenioQueryParams
): Promise<PagedResult<ConvenioResponse>> {
  const response = await apiClient.get<PagedResult<ConvenioResponse>>("/convenios", {
    params,
  });
  return response.data;
}

export async function getConvenioById(id: number): Promise<ConvenioResponse> {
  const response = await apiClient.get<ConvenioResponse>(`/convenios/${id}`);
  return response.data;
}

export async function createConvenio(
  request: CreateConvenioRequest
): Promise<ConvenioResponse> {
  const response = await apiClient.post<ConvenioResponse>("/convenios", request);
  return response.data;
}

export async function updateConvenio(
  id: number,
  request: UpdateConvenioRequest
): Promise<ConvenioResponse> {
  const response = await apiClient.put<ConvenioResponse>(`/convenios/${id}`, request);
  return response.data;
}

export async function deleteConvenio(id: number): Promise<void> {
  await apiClient.delete(`/convenios/${id}`);
}

// Tarifarios de Convenio
export async function getConvenioTarifarios(
  convenioId: number,
  params?: ConvenioQueryParams
): Promise<PagedResult<ConvenioTarifarioResponse>> {
  const response = await apiClient.get<PagedResult<ConvenioTarifarioResponse>>(
    `/convenios/${convenioId}/tarifarios`,
    { params }
  );
  return response.data;
}

export async function createConvenioTarifario(
  convenioId: number,
  request: CreateConvenioTarifarioRequest
): Promise<ConvenioTarifarioResponse> {
  const response = await apiClient.post<ConvenioTarifarioResponse>(
    `/convenios/${convenioId}/tarifarios`,
    request
  );
  return response.data;
}

export async function updateConvenioTarifario(
  convenioId: number,
  id: number,
  request: UpdateConvenioTarifarioRequest
): Promise<ConvenioTarifarioResponse> {
  const response = await apiClient.put<ConvenioTarifarioResponse>(
    `/convenios/${convenioId}/tarifarios/${id}`,
    request
  );
  return response.data;
}

export async function deleteConvenioTarifario(
  convenioId: number,
  id: number
): Promise<void> {
  await apiClient.delete(`/convenios/${convenioId}/tarifarios/${id}`);
}
