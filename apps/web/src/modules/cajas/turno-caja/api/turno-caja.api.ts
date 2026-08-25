import { apiClient } from "@/lib/api/api-client";
import type {
  AbrirTurnoCajaRequest,
  CerrarTurnoCajaRequest,
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

export async function abrirTurnoCaja(
  request: AbrirTurnoCajaRequest
): Promise<TurnoCajaResponse> {
  const response = await apiClient.post<TurnoCajaResponse>(
    "/turnos-caja/abrir",
    request
  );
  return response.data;
}

export async function cerrarTurnoCaja(
  id: number,
  request: CerrarTurnoCajaRequest
): Promise<TurnoCajaResponse> {
  const response = await apiClient.post<TurnoCajaResponse>(
    `/turnos-caja/${id}/cerrar`,
    request
  );
  return response.data;
}

export async function createTurnoCaja(
  request: CreateTurnoCajaRequest
): Promise<TurnoCajaResponse> {
  return abrirTurnoCaja({
    cajaId: request.cajaId,
    empleadoId: request.empleadoId,
    montoInicial: request.montoInicial,
    observacion: request.observacionApertura,
  });
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

export async function getTurnoCajaAbiertoEmpleado(
  empleadoId: number
): Promise<TurnoCajaResponse | null> {
  const response = await apiClient.get<TurnoCajaResponse>(
    `/turnos-caja/empleado/${empleadoId}/abierto`
  );
  return response.data;
}

export async function getTurnoCajaAbiertoCaja(
  cajaId: number
): Promise<TurnoCajaResponse | null> {
  const response = await apiClient.get<TurnoCajaResponse>(
    `/turnos-caja/caja/${cajaId}/abierto`
  );
  return response.data;
}
