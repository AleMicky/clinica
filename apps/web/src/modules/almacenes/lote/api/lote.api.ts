import { apiClient } from "@/lib/api/api-client";
import type {
  LoteQueryParams,
  LoteResponse,
  CreateLoteRequest,
  PagedResult,
  UpdateLoteRequest,
} from "../types/lote.types";

export async function getLotes(
  params?: LoteQueryParams
): Promise<PagedResult<LoteResponse>> {
  const response = await apiClient.get<PagedResult<LoteResponse>>(
    "/lotes",
    { params }
  );
  return response.data;
}

export async function getLoteById(id: number): Promise<LoteResponse> {
  const response = await apiClient.get<LoteResponse>(`/lotes/${id}`);
  return response.data;
}

export async function createLote(
  request: CreateLoteRequest
): Promise<LoteResponse> {
  const response = await apiClient.post<LoteResponse>(
    "/lotes",
    request
  );
  return response.data;
}

export async function updateLote(
  id: number,
  request: UpdateLoteRequest
): Promise<LoteResponse> {
  const response = await apiClient.put<LoteResponse>(
    `/lotes/${id}`,
    request
  );
  return response.data;
}

export async function deleteLote(id: number): Promise<void> {
  await apiClient.delete(`/lotes/${id}`);
}
