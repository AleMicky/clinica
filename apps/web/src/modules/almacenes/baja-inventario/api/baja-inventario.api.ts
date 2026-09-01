import { apiClient } from "@/lib/api/api-client";
import type {
  BajaInventarioQueryParams,
  BajaInventarioResponse,
  AnularBajaInventarioRequest,
  CreateBajaInventarioRequest,
  PagedResult,
  UpdateBajaInventarioRequest,
} from "../types/baja-inventario.types";

export async function getBajasInventario(
  params?: BajaInventarioQueryParams
): Promise<PagedResult<BajaInventarioResponse>> {
  const response = await apiClient.get<PagedResult<BajaInventarioResponse>>(
    "/bajas-inventario",
    { params }
  );
  return response.data;
}

export async function getBajaInventarioById(
  id: number
): Promise<BajaInventarioResponse> {
  const response = await apiClient.get<BajaInventarioResponse>(
    `/bajas-inventario/${id}`
  );
  return response.data;
}

export async function createBajaInventario(
  request: CreateBajaInventarioRequest
): Promise<BajaInventarioResponse> {
  const response = await apiClient.post<BajaInventarioResponse>(
    "/bajas-inventario",
    request
  );
  return response.data;
}

export async function updateBajaInventario(
  id: number,
  request: UpdateBajaInventarioRequest
): Promise<BajaInventarioResponse> {
  const response = await apiClient.put<BajaInventarioResponse>(
    `/bajas-inventario/${id}`,
    request
  );
  return response.data;
}

export async function deleteBajaInventario(id: number): Promise<void> {
  await apiClient.delete(`/bajas-inventario/${id}`);
}

export async function confirmarBajaInventario(
  id: number
): Promise<BajaInventarioResponse> {
  const response = await apiClient.post<BajaInventarioResponse>(
    `/bajas-inventario/${id}/confirmar`
  );
  return response.data;
}

export async function anularBajaInventario(
  id: number,
  request: AnularBajaInventarioRequest
): Promise<BajaInventarioResponse> {
  const response = await apiClient.post<BajaInventarioResponse>(
    `/bajas-inventario/${id}/anular`,
    request
  );
  return response.data;
}
