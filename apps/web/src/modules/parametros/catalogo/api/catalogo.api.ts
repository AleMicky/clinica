import { apiClient } from "@/lib/api/api-client";
import type {
  CatalogoGrupoResponse,
  CatalogoItemResponse,
  CatalogoQueryParams,
  CreateCatalogoGrupoRequest,
  CreateCatalogoItemRequest,
  PagedResult,
  UpdateCatalogoGrupoRequest,
  UpdateCatalogoItemRequest,
} from "../types/catalogo.types";

// ===================================
// Catálogo Grupos API
// ===================================

export async function getCatalogoGrupos(
  params?: CatalogoQueryParams
): Promise<PagedResult<CatalogoGrupoResponse>> {
  const response = await apiClient.get<PagedResult<CatalogoGrupoResponse>>("/catalogos", {
    params,
  });
  return response.data;
}

export async function getCatalogoGrupoById(id: number): Promise<CatalogoGrupoResponse> {
  const response = await apiClient.get<CatalogoGrupoResponse>(`/catalogos/${id}`);
  return response.data;
}

export async function createCatalogoGrupo(
  request: CreateCatalogoGrupoRequest
): Promise<CatalogoGrupoResponse> {
  const response = await apiClient.post<CatalogoGrupoResponse>("/catalogos", request);
  return response.data;
}

export async function updateCatalogoGrupo(
  id: number,
  request: UpdateCatalogoGrupoRequest
): Promise<CatalogoGrupoResponse> {
  const response = await apiClient.put<CatalogoGrupoResponse>(`/catalogos/${id}`, request);
  return response.data;
}

export async function deleteCatalogoGrupo(id: number): Promise<void> {
  await apiClient.delete(`/catalogos/${id}`);
}

// ===================================
// Catálogo Items API
// ===================================

export async function getCatalogoItems(
  grupoId: number,
  params?: CatalogoQueryParams
): Promise<PagedResult<CatalogoItemResponse>> {
  const response = await apiClient.get<PagedResult<CatalogoItemResponse>>(
    `/catalogos/${grupoId}/items`,
    { params }
  );
  return response.data;
}

export async function getCatalogoItemsByCodigo(
  codigo: string,
  params?: CatalogoQueryParams
): Promise<PagedResult<CatalogoItemResponse>> {
  const response = await apiClient.get<PagedResult<CatalogoItemResponse>>(
    `/catalogos/${codigo}/items`,
    { params }
  );
  return response.data;
}

export async function getCatalogoItemById(
  grupoId: number,
  itemId: number
): Promise<CatalogoItemResponse> {
  const response = await apiClient.get<CatalogoItemResponse>(
    `/catalogos/${grupoId}/items/${itemId}`
  );
  return response.data;
}

export async function createCatalogoItem(
  grupoId: number,
  request: CreateCatalogoItemRequest
): Promise<CatalogoItemResponse> {
  const response = await apiClient.post<CatalogoItemResponse>(
    `/catalogos/${grupoId}/items`,
    request
  );
  return response.data;
}

export async function updateCatalogoItem(
  grupoId: number,
  itemId: number,
  request: UpdateCatalogoItemRequest
): Promise<CatalogoItemResponse> {
  const response = await apiClient.put<CatalogoItemResponse>(
    `/catalogos/${grupoId}/items/${itemId}`,
    request
  );
  return response.data;
}

export async function deleteCatalogoItem(
  grupoId: number,
  itemId: number
): Promise<void> {
  await apiClient.delete(`/catalogos/${grupoId}/items/${itemId}`);
}
