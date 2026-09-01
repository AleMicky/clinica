import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTipoMovimientoInventarioRequest,
  PagedResult,
  TipoMovimientoInventarioQueryParams,
  TipoMovimientoInventarioResponse,
  UpdateTipoMovimientoInventarioRequest,
} from "../types/tipo-movimiento-inventario.types";

export async function getTiposMovimientoInventario(
  params?: TipoMovimientoInventarioQueryParams
): Promise<PagedResult<TipoMovimientoInventarioResponse>> {
  const response = await apiClient.get<PagedResult<TipoMovimientoInventarioResponse>>(
    "/tipos-movimiento-inventario",
    { params }
  );
  return response.data;
}

export async function getTipoMovimientoInventarioById(
  id: number
): Promise<TipoMovimientoInventarioResponse> {
  const response = await apiClient.get<TipoMovimientoInventarioResponse>(
    `/tipos-movimiento-inventario/${id}`
  );
  return response.data;
}

export async function createTipoMovimientoInventario(
  request: CreateTipoMovimientoInventarioRequest
): Promise<TipoMovimientoInventarioResponse> {
  const response = await apiClient.post<TipoMovimientoInventarioResponse>(
    "/tipos-movimiento-inventario",
    request
  );
  return response.data;
}

export async function updateTipoMovimientoInventario(
  id: number,
  request: UpdateTipoMovimientoInventarioRequest
): Promise<TipoMovimientoInventarioResponse> {
  const response = await apiClient.put<TipoMovimientoInventarioResponse>(
    `/tipos-movimiento-inventario/${id}`,
    request
  );
  return response.data;
}

export async function deleteTipoMovimientoInventario(id: number): Promise<void> {
  await apiClient.delete(`/tipos-movimiento-inventario/${id}`);
}
