import { apiClient } from "@/lib/api/api-client";
import type {
  AnularCobroRequest,
  CobroQueryParams,
  CobroResponse,
  CreateCobroRequest,
  UpdateCobroRequest,
  PagedResult,
} from "../types/cobro.types";

export async function getCobros(
  params?: CobroQueryParams
): Promise<PagedResult<CobroResponse>> {
  const response = await apiClient.get<PagedResult<CobroResponse>>("/cobros", {
    params,
  });
  return response.data;
}

export async function getCobroById(id: number): Promise<CobroResponse> {
  const response = await apiClient.get<CobroResponse>(`/cobros/${id}`);
  return response.data;
}

export async function createCobro(
  request: CreateCobroRequest
): Promise<CobroResponse> {
  const response = await apiClient.post<CobroResponse>("/cobros", request);
  return response.data;
}

export async function updateCobro(
  id: number,
  request: UpdateCobroRequest
): Promise<CobroResponse> {
  const response = await apiClient.put<CobroResponse>(`/cobros/${id}`, request);
  return response.data;
}

export async function anularCobro(
  id: number,
  request: AnularCobroRequest
): Promise<CobroResponse> {
  const response = await apiClient.post<CobroResponse>(
    `/cobros/${id}/anular`,
    request
  );
  return response.data;
}

export async function deleteCobro(id: number): Promise<void> {
  await apiClient.delete(`/cobros/${id}`);
}
