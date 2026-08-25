import { apiClient } from "@/lib/api/api-client";
import type {
  CreateOpcionMenuRequest,
  OpcionMenuQueryParams,
  OpcionMenuResponse,
  OpcionMenuTreeResponse,
  PagedResult,
  UpdateOpcionMenuRequest,
} from "../types/opcion-menu.types";

export async function getOpcionesMenu(
  params?: OpcionMenuQueryParams
): Promise<PagedResult<OpcionMenuResponse>> {
  const response = await apiClient.get<PagedResult<OpcionMenuResponse>>(
    "/opciones-menu",
    { params }
  );
  return response.data;
}

export async function getOpcionesMenuTree(): Promise<OpcionMenuTreeResponse[]> {
  const response = await apiClient.get<OpcionMenuTreeResponse[]>(
    "/opciones-menu/arbol"
  );
  return response.data;
}

export async function getOpcionMenuById(id: number): Promise<OpcionMenuResponse> {
  const response = await apiClient.get<OpcionMenuResponse>(
    `/opciones-menu/${id}`
  );
  return response.data;
}

export async function createOpcionMenu(
  request: CreateOpcionMenuRequest
): Promise<OpcionMenuResponse> {
  const response = await apiClient.post<OpcionMenuResponse>(
    "/opciones-menu",
    request
  );
  return response.data;
}

export async function updateOpcionMenu(
  id: number,
  request: UpdateOpcionMenuRequest
): Promise<OpcionMenuResponse> {
  const response = await apiClient.put<OpcionMenuResponse>(
    `/opciones-menu/${id}`,
    request
  );
  return response.data;
}

export async function deleteOpcionMenu(id: number): Promise<void> {
  await apiClient.delete(`/opciones-menu/${id}`);
}

export async function activarOpcionMenu(id: number): Promise<void> {
  await apiClient.patch(`/opciones-menu/${id}/activar`);
}

export async function inactivarOpcionMenu(id: number): Promise<void> {
  await apiClient.patch(`/opciones-menu/${id}/inactivar`);
}
