import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUnidadMedidaRequest,
  PagedResult,
  UnidadMedidaQueryParams,
  UnidadMedidaResponse,
  UpdateUnidadMedidaRequest,
} from "../types/unidad-medida.types";

export async function getUnidadesMedida(
  params?: UnidadMedidaQueryParams
): Promise<PagedResult<UnidadMedidaResponse>> {
  const response = await apiClient.get<PagedResult<UnidadMedidaResponse>>(
    "/unidades-medida",
    { params }
  );
  return response.data;
}

export async function getUnidadMedidaById(id: number): Promise<UnidadMedidaResponse> {
  const response = await apiClient.get<UnidadMedidaResponse>(`/unidades-medida/${id}`);
  return response.data;
}

export async function createUnidadMedida(
  request: CreateUnidadMedidaRequest
): Promise<UnidadMedidaResponse> {
  const response = await apiClient.post<UnidadMedidaResponse>("/unidades-medida", request);
  return response.data;
}

export async function updateUnidadMedida(
  id: number,
  request: UpdateUnidadMedidaRequest
): Promise<UnidadMedidaResponse> {
  const response = await apiClient.put<UnidadMedidaResponse>(
    `/unidades-medida/${id}`,
    request
  );
  return response.data;
}

export async function deleteUnidadMedida(id: number): Promise<void> {
  await apiClient.delete(`/unidades-medida/${id}`);
}
