import { apiClient } from "@/lib/api/api-client";
import type {
  CategoriaServicioQueryParams,
  CategoriaServicioResponse,
  CreateCategoriaServicioRequest,
  PagedResult,
  UpdateCategoriaServicioRequest,
} from "../types/categoria-servicio.types";

export async function getCategoriasServicio(
  params?: CategoriaServicioQueryParams
): Promise<PagedResult<CategoriaServicioResponse>> {
  const response = await apiClient.get<PagedResult<CategoriaServicioResponse>>(
    "/categorias-servicios",
    { params }
  );
  return response.data;
}

export async function getCategoriaServicioById(
  id: number
): Promise<CategoriaServicioResponse> {
  const response = await apiClient.get<CategoriaServicioResponse>(
    `/categorias-servicios/${id}`
  );
  return response.data;
}

export async function createCategoriaServicio(
  request: CreateCategoriaServicioRequest
): Promise<CategoriaServicioResponse> {
  const response = await apiClient.post<CategoriaServicioResponse>(
    "/categorias-servicios",
    request
  );
  return response.data;
}

export async function updateCategoriaServicio(
  id: number,
  request: UpdateCategoriaServicioRequest
): Promise<CategoriaServicioResponse> {
  const response = await apiClient.put<CategoriaServicioResponse>(
    `/categorias-servicios/${id}`,
    request
  );
  return response.data;
}

export async function deleteCategoriaServicio(id: number): Promise<void> {
  await apiClient.delete(`/categorias-servicios/${id}`);
}
