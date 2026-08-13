import { apiClient } from "@/lib/api/api-client";
import type {
  CajaQueryParams,
  CajaResponse,
  CreateCajaRequest,
  PagedResult,
  UpdateCajaRequest,
} from "../types/caja.types";

export async function getCajas(
  params?: CajaQueryParams
): Promise<PagedResult<CajaResponse>> {
  const response = await apiClient.get<PagedResult<CajaResponse>>("/cajas", {
    params,
  });
  return response.data;
}

export async function getCajaById(id: number): Promise<CajaResponse> {
  const response = await apiClient.get<CajaResponse>(`/cajas/${id}`);
  return response.data;
}

export async function createCaja(
  request: CreateCajaRequest
): Promise<CajaResponse> {
  const response = await apiClient.post<CajaResponse>("/cajas", request);
  return response.data;
}

export async function updateCaja(
  id: number,
  request: UpdateCajaRequest
): Promise<CajaResponse> {
  const response = await apiClient.put<CajaResponse>(`/cajas/${id}`, request);
  return response.data;
}

export async function deleteCaja(id: number): Promise<void> {
  await apiClient.delete(`/cajas/${id}`);
}
