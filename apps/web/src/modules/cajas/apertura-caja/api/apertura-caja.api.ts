import { apiClient } from "@/lib/api/api-client";
import type {
  AperturaCajaQueryParams,
  AperturaCajaResponse,
  CreateAperturaCajaRequest,
  PagedResult,
  UpdateAperturaCajaRequest,
} from "../types/apertura-caja.types";

export async function getAperturasCaja(
  params?: AperturaCajaQueryParams
): Promise<PagedResult<AperturaCajaResponse>> {
  const response = await apiClient.get<PagedResult<AperturaCajaResponse>>(
    "/aperturas-caja",
    { params }
  );
  return response.data;
}

export async function getAperturaCajaById(id: number): Promise<AperturaCajaResponse> {
  const response = await apiClient.get<AperturaCajaResponse>(`/aperturas-caja/${id}`);
  return response.data;
}

export async function createAperturaCaja(
  request: CreateAperturaCajaRequest
): Promise<AperturaCajaResponse> {
  const response = await apiClient.post<AperturaCajaResponse>(
    "/aperturas-caja",
    request
  );
  return response.data;
}

export async function updateAperturaCaja(
  id: number,
  request: UpdateAperturaCajaRequest
): Promise<AperturaCajaResponse> {
  const response = await apiClient.put<AperturaCajaResponse>(
    `/aperturas-caja/${id}`,
    request
  );
  return response.data;
}

export async function deleteAperturaCaja(id: number): Promise<void> {
  await apiClient.delete(`/aperturas-caja/${id}`);
}
