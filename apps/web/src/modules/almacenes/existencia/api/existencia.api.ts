import { apiClient } from "@/lib/api/api-client";
import type {
  CreateExistenciaRequest,
  ExistenciaQueryParams,
  ExistenciaResponse,
  PagedResult,
  UpdateExistenciaRequest,
} from "../types/existencia.types";

export async function getExistencias(
  params?: ExistenciaQueryParams
): Promise<PagedResult<ExistenciaResponse>> {
  const response = await apiClient.get<PagedResult<ExistenciaResponse>>(
    "/existencias",
    { params }
  );
  return response.data;
}

export async function getExistenciaById(
  id: number
): Promise<ExistenciaResponse> {
  const response = await apiClient.get<ExistenciaResponse>(
    `/existencias/${id}`
  );
  return response.data;
}

export async function createExistencia(
  request: CreateExistenciaRequest
): Promise<ExistenciaResponse> {
  const response = await apiClient.post<ExistenciaResponse>(
    "/existencias",
    request
  );
  return response.data;
}

export async function updateExistencia(
  id: number,
  request: UpdateExistenciaRequest
): Promise<ExistenciaResponse> {
  const response = await apiClient.put<ExistenciaResponse>(
    `/existencias/${id}`,
    request
  );
  return response.data;
}

export async function deleteExistencia(id: number): Promise<void> {
  await apiClient.delete(`/existencias/${id}`);
}
