import { apiClient } from "@/lib/api/api-client";
import type {
  AnularMovimientoInventarioRequest,
  CreateMovimientoInventarioRequest,
  MovimientoInventarioQueryParams,
  MovimientoInventarioResponse,
  PagedResult,
  UpdateMovimientoInventarioRequest,
} from "../types/movimiento-inventario.types";

export async function getMovimientosInventario(
  params?: MovimientoInventarioQueryParams
): Promise<PagedResult<MovimientoInventarioResponse>> {
  const response = await apiClient.get<PagedResult<MovimientoInventarioResponse>>(
    "/movimientos-inventario",
    { params }
  );
  return response.data;
}

export async function getMovimientoInventarioById(
  id: number
): Promise<MovimientoInventarioResponse> {
  const response = await apiClient.get<MovimientoInventarioResponse>(
    `/movimientos-inventario/${id}`
  );
  return response.data;
}

export async function createMovimientoInventario(
  request: CreateMovimientoInventarioRequest
): Promise<MovimientoInventarioResponse> {
  const response = await apiClient.post<MovimientoInventarioResponse>(
    "/movimientos-inventario",
    request
  );
  return response.data;
}

export async function updateMovimientoInventario(
  id: number,
  request: UpdateMovimientoInventarioRequest
): Promise<MovimientoInventarioResponse> {
  const response = await apiClient.put<MovimientoInventarioResponse>(
    `/movimientos-inventario/${id}`,
    request
  );
  return response.data;
}

export async function deleteMovimientoInventario(id: number): Promise<void> {
  await apiClient.delete(`/movimientos-inventario/${id}`);
}

export async function confirmarMovimientoInventario(
  id: number
): Promise<MovimientoInventarioResponse> {
  const response = await apiClient.post<MovimientoInventarioResponse>(
    `/movimientos-inventario/${id}/confirmar`
  );
  return response.data;
}

export async function anularMovimientoInventario(
  id: number,
  request: AnularMovimientoInventarioRequest
): Promise<MovimientoInventarioResponse> {
  const response = await apiClient.post<MovimientoInventarioResponse>(
    `/movimientos-inventario/${id}/anular`,
    request
  );
  return response.data;
}
