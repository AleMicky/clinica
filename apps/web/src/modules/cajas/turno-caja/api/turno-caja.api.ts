import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTurnoCajaRequest,
  PagedResult,
  TurnoCajaQueryParams,
  TurnoCajaResponse,
  UpdateTurnoCajaRequest,
} from "../types/turno-caja.types";

export async function getTurnosCaja(
  params?: TurnoCajaQueryParams
): Promise<PagedResult<TurnoCajaResponse>> {
  const response = await apiClient.get<PagedResult<TurnoCajaResponse>>(
    "/turnos-caja",
    { params }
  );
  return response.data;
}

export async function getTurnoCajaById(id: number): Promise<TurnoCajaResponse> {
  const response = await apiClient.get<TurnoCajaResponse>(`/turnos-caja/${id}`);
  return response.data;
}

export async function createTurnoCaja(
  request: CreateTurnoCajaRequest
): Promise<TurnoCajaResponse> {
  const response = await apiClient.post<TurnoCajaResponse>(
    "/turnos-caja",
    request
  );
  return response.data;
}

export async function updateTurnoCaja(
  id: number,
  request: UpdateTurnoCajaRequest
): Promise<TurnoCajaResponse> {
  const response = await apiClient.put<TurnoCajaResponse>(
    `/turnos-caja/${id}`,
    request
  );
  return response.data;
}

export async function deleteTurnoCaja(id: number): Promise<void> {
  await apiClient.delete(`/turnos-caja/${id}`);
}
