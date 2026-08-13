import { apiClient } from "@/lib/api/api-client";
import type {
  ArqueoCajaQueryParams,
  ArqueoCajaResponse,
  CreateArqueoCajaRequest,
  PagedResult,
  UpdateArqueoCajaRequest,
} from "../types/arqueo-caja.types";

export async function getArqueosCaja(
  params?: ArqueoCajaQueryParams
): Promise<PagedResult<ArqueoCajaResponse>> {
  const response = await apiClient.get<PagedResult<ArqueoCajaResponse>>(
    "/arqueos-caja",
    { params }
  );
  return response.data;
}

export async function getArqueoCajaById(
  id: number
): Promise<ArqueoCajaResponse> {
  const response = await apiClient.get<ArqueoCajaResponse>(
    `/arqueos-caja/${id}`
  );
  return response.data;
}

export async function createArqueoCaja(
  request: CreateArqueoCajaRequest
): Promise<ArqueoCajaResponse> {
  const response = await apiClient.post<ArqueoCajaResponse>(
    "/arqueos-caja",
    request
  );
  return response.data;
}

export async function updateArqueoCaja(
  id: number,
  request: UpdateArqueoCajaRequest
): Promise<ArqueoCajaResponse> {
  const response = await apiClient.put<ArqueoCajaResponse>(
    `/arqueos-caja/${id}`,
    request
  );
  return response.data;
}

export async function deleteArqueoCaja(id: number): Promise<void> {
  await apiClient.delete(`/arqueos-caja/${id}`);
}
