import { apiClient } from "@/lib/api/api-client";
import type {
  CreateExistenciaPartidaRequest,
  ExistenciaPartidaQueryParams,
  ExistenciaPartidaResponse,
  PagedResult,
  UpdateExistenciaPartidaRequest,
} from "../types/existencia-partida.types";

export async function getExistenciasPartidas(
  params?: ExistenciaPartidaQueryParams
): Promise<PagedResult<ExistenciaPartidaResponse>> {
  const response = await apiClient.get<PagedResult<ExistenciaPartidaResponse>>(
    "/existencias-partidas",
    { params }
  );
  return response.data;
}

export async function getExistenciaPartidaById(
  id: number
): Promise<ExistenciaPartidaResponse> {
  const response = await apiClient.get<ExistenciaPartidaResponse>(
    `/existencias-partidas/${id}`
  );
  return response.data;
}

export async function createExistenciaPartida(
  request: CreateExistenciaPartidaRequest
): Promise<ExistenciaPartidaResponse> {
  const response = await apiClient.post<ExistenciaPartidaResponse>(
    "/existencias-partidas",
    request
  );
  return response.data;
}

export async function updateExistenciaPartida(
  id: number,
  request: UpdateExistenciaPartidaRequest
): Promise<ExistenciaPartidaResponse> {
  const response = await apiClient.put<ExistenciaPartidaResponse>(
    `/existencias-partidas/${id}`,
    request
  );
  return response.data;
}

export async function deleteExistenciaPartida(id: number): Promise<void> {
  await apiClient.delete(`/existencias-partidas/${id}`);
}
