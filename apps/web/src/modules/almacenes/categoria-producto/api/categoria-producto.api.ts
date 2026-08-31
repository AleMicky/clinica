import { apiClient } from "@/lib/api/api-client";
import type {
  CategoriaProductoQueryParams,
  CategoriaProductoResponse,
  CreateCategoriaProductoRequest,
  PagedResult,
  UpdateCategoriaProductoRequest,
} from "../types/categoria-producto.types";

export async function getCategoriasProducto(
  params?: CategoriaProductoQueryParams
): Promise<PagedResult<CategoriaProductoResponse>> {
  const response = await apiClient.get<PagedResult<CategoriaProductoResponse>>(
    "/categorias-producto",
    { params }
  );
  return response.data;
}

export async function getCategoriaProductoById(
  id: number
): Promise<CategoriaProductoResponse> {
  const response = await apiClient.get<CategoriaProductoResponse>(
    `/categorias-producto/${id}`
  );
  return response.data;
}

export async function createCategoriaProducto(
  request: CreateCategoriaProductoRequest
): Promise<CategoriaProductoResponse> {
  const response = await apiClient.post<CategoriaProductoResponse>(
    "/categorias-producto",
    request
  );
  return response.data;
}

export async function updateCategoriaProducto(
  id: number,
  request: UpdateCategoriaProductoRequest
): Promise<CategoriaProductoResponse> {
  const response = await apiClient.put<CategoriaProductoResponse>(
    `/categorias-producto/${id}`,
    request
  );
  return response.data;
}

export async function deleteCategoriaProducto(id: number): Promise<void> {
  await apiClient.delete(`/categorias-producto/${id}`);
}
