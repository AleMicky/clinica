import { apiClient } from "@/lib/api/api-client";
import type {
  AjusteInventarioQueryParams,
  AjusteInventarioResponse,
  AnularAjusteInventarioRequest,
  CreateAjusteInventarioRequest,
  PagedResult,
  UpdateAjusteInventarioRequest,
} from "../types/ajuste-inventario.types";

export async function getAjustesInventario(
  params?: AjusteInventarioQueryParams
): Promise<PagedResult<AjusteInventarioResponse>> {
  const response = await apiClient.get<PagedResult<AjusteInventarioResponse>>(
    "/ajustes-inventario",
    { params }
  );
  return response.data;
}

export async function getAjusteInventarioById(
  id: number
): Promise<AjusteInventarioResponse> {
  const response = await apiClient.get<AjusteInventarioResponse>(
    `/ajustes-inventario/${id}`
  );
  return response.data;
}

export async function createAjusteInventario(
  request: CreateAjusteInventarioRequest
): Promise<AjusteInventarioResponse> {
  const response = await apiClient.post<AjusteInventarioResponse>(
    "/ajustes-inventario",
    request
  );
  return response.data;
}

export async function updateAjusteInventario(
  id: number,
  request: UpdateAjusteInventarioRequest
): Promise<AjusteInventarioResponse> {
  const response = await apiClient.put<AjusteInventarioResponse>(
    `/ajustes-inventario/${id}`,
    request
  );
  return response.data;
}

export async function deleteAjusteInventario(id: number): Promise<void> {
  await apiClient.delete(`/ajustes-inventario/${id}`);
}

export async function confirmarAjusteInventario(
  id: number
): Promise<AjusteInventarioResponse> {
  const response = await apiClient.post<AjusteInventarioResponse>(
    `/ajustes-inventario/${id}/confirmar`
  );
  return response.data;
}

export async function anularAjusteInventario(
  id: number,
  request: AnularAjusteInventarioRequest
): Promise<AjusteInventarioResponse> {
  const response = await apiClient.post<AjusteInventarioResponse>(
    `/ajustes-inventario/${id}/anular`,
    request
  );
  return response.data;
}
