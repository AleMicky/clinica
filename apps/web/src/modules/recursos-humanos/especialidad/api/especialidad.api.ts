import { apiClient } from "@/lib/api/api-client";
import type {
  CreateEspecialidadRequest,
  EspecialidadQueryParams,
  EspecialidadResponse,
  PagedResult,
  UpdateEspecialidadRequest,
} from "../types/especialidad.types";

export async function getEspecialidades(
  params?: EspecialidadQueryParams
): Promise<PagedResult<EspecialidadResponse>> {
  const response = await apiClient.get<PagedResult<EspecialidadResponse>>(
    "/especialidades",
    { params }
  );
  return response.data;
}

export async function getEspecialidadById(
  id: number
): Promise<EspecialidadResponse> {
  const response = await apiClient.get<EspecialidadResponse>(
    `/especialidades/${id}`
  );
  return response.data;
}

export async function createEspecialidad(
  request: CreateEspecialidadRequest
): Promise<EspecialidadResponse> {
  const response = await apiClient.post<EspecialidadResponse>(
    "/especialidades",
    request
  );
  return response.data;
}

export async function updateEspecialidad(
  id: number,
  request: UpdateEspecialidadRequest
): Promise<EspecialidadResponse> {
  const response = await apiClient.put<EspecialidadResponse>(
    `/especialidades/${id}`,
    request
  );
  return response.data;
}

export async function deleteEspecialidad(id: number): Promise<void> {
  await apiClient.delete(`/especialidades/${id}`);
}
