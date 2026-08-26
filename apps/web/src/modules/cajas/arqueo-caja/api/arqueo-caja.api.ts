import { apiClient } from "@/lib/api/api-client";
import type {
  ArqueoCajaQueryParams,
  ArqueoCajaResponse,
  ArqueoCajaResumenResponse,
  PagedResult,
  RegistrarArqueoCajaRequest,
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

export async function getResumenArqueoCaja(
  turnoCajaId: number
): Promise<ArqueoCajaResumenResponse> {
  const response = await apiClient.get<ArqueoCajaResumenResponse>(
    `/arqueos-caja/turnos/${turnoCajaId}/resumen`
  );
  return response.data;
}

export async function registrarArqueoCaja(
  request: RegistrarArqueoCajaRequest
): Promise<ArqueoCajaResponse> {
  const response = await apiClient.post<ArqueoCajaResponse>(
    "/arqueos-caja",
    request
  );
  return response.data;
}

// Alias para compatibilidad
export const createArqueoCaja = registrarArqueoCaja;
