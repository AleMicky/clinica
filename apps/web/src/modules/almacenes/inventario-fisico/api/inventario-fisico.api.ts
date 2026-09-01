import { apiClient } from "@/lib/api/api-client";
import type {
  AnularInventarioFisicoRequest,
  CreateInventarioFisicoRequest,
  InventarioFisicoQueryParams,
  InventarioFisicoResponse,
  PagedResult,
  RegistrarConteoInventarioFisicoRequest,
  UpdateInventarioFisicoRequest,
} from "../types/inventario-fisico.types";

export async function getInventariosFisicos(
  params?: InventarioFisicoQueryParams
): Promise<PagedResult<InventarioFisicoResponse>> {
  const response = await apiClient.get<PagedResult<InventarioFisicoResponse>>(
    "/inventarios-fisicos",
    { params }
  );
  return response.data;
}

export async function getInventarioFisicoById(
  id: number
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.get<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}`
  );
  return response.data;
}

export async function createInventarioFisico(
  request: CreateInventarioFisicoRequest
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.post<InventarioFisicoResponse>(
    "/inventarios-fisicos",
    request
  );
  return response.data;
}

export async function updateInventarioFisico(
  id: number,
  request: UpdateInventarioFisicoRequest
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.put<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}`,
    request
  );
  return response.data;
}

export async function deleteInventarioFisico(id: number): Promise<void> {
  await apiClient.delete(`/inventarios-fisicos/${id}`);
}

export async function iniciarConteoInventarioFisico(
  id: number
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.post<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}/iniciar-conteo`
  );
  return response.data;
}

export async function registrarConteoInventarioFisico(
  id: number,
  request: RegistrarConteoInventarioFisicoRequest
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.post<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}/registrar-conteo`,
    request
  );
  return response.data;
}

export async function cerrarInventarioFisico(
  id: number
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.post<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}/cerrar`
  );
  return response.data;
}

export async function anularInventarioFisico(
  id: number,
  request: AnularInventarioFisicoRequest
): Promise<InventarioFisicoResponse> {
  const response = await apiClient.post<InventarioFisicoResponse>(
    `/inventarios-fisicos/${id}/anular`,
    request
  );
  return response.data;
}
