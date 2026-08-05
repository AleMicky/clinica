import { apiClient } from "@/lib/api/api-client";
import type {
  CreateMonedaRequest,
  MonedaQueryParams,
  MonedaResponse,
  PagedResult,
  UpdateMonedaRequest,
} from "../types/moneda.types";

export async function getMonedas(
  params?: MonedaQueryParams
): Promise<PagedResult<MonedaResponse>> {
  const response = await apiClient.get<PagedResult<MonedaResponse>>("/monedas", {
    params,
  });
  return response.data;
}

export async function getMonedaById(id: number): Promise<MonedaResponse> {
  const response = await apiClient.get<MonedaResponse>(`/monedas/${id}`);
  return response.data;
}

export async function createMoneda(
  request: CreateMonedaRequest
): Promise<MonedaResponse> {
  const response = await apiClient.post<MonedaResponse>("/monedas", request);
  return response.data;
}

export async function updateMoneda(
  id: number,
  request: UpdateMonedaRequest
): Promise<MonedaResponse> {
  const response = await apiClient.put<MonedaResponse>(`/monedas/${id}`, request);
  return response.data;
}

export async function deleteMoneda(id: number): Promise<void> {
  await apiClient.delete(`/monedas/${id}`);
}
