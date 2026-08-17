import { apiClient } from "@/lib/api/api-client";
import type {
  CreateServicioRequest,
  PagedResult,
  ServicioQueryParams,
  ServicioResponse,
  ServicioTarifarioResponse,
  UpdateServicioRequest,
} from "../types/servicio.types";

export async function getServiciosByCategoria(
  categoriaId: number,
  params?: ServicioQueryParams
): Promise<PagedResult<ServicioResponse>> {
  const response = await apiClient.get<PagedResult<ServicioResponse>>(
    `/categorias-servicios/${categoriaId}/servicios`,
    { params }
  );
  return response.data;
}

export async function getServiciosByCategoriaTarifario(
  categoriaId: number,
  tarifarioId?: number,
  params?: ServicioQueryParams
): Promise<PagedResult<ServicioTarifarioResponse> | ServicioTarifarioResponse[]> {
  const queryParams = {
    ...params,
    ...(tarifarioId ? { tarifarioId } : {}),
  };
  const response = await apiClient.get<PagedResult<ServicioTarifarioResponse> | ServicioTarifarioResponse[]>(
    `/categorias-servicios/${categoriaId}/servicios/tarifario`,
    { params: queryParams }
  );
  return response.data;
}

export async function getServicioById(
  categoriaId: number,
  servicioId: number
): Promise<ServicioResponse> {
  const response = await apiClient.get<ServicioResponse>(
    `/categorias-servicios/${categoriaId}/servicios/${servicioId}`
  );
  return response.data;
}

export async function createServicio(
  categoriaId: number,
  request: CreateServicioRequest
): Promise<ServicioResponse> {
  const response = await apiClient.post<ServicioResponse>(
    `/categorias-servicios/${categoriaId}/servicios`,
    request
  );
  return response.data;
}

export async function updateServicio(
  categoriaId: number,
  servicioId: number,
  request: UpdateServicioRequest
): Promise<ServicioResponse> {
  const response = await apiClient.put<ServicioResponse>(
    `/categorias-servicios/${categoriaId}/servicios/${servicioId}`,
    request
  );
  return response.data;
}

export async function deleteServicio(
  categoriaId: number,
  servicioId: number
): Promise<void> {
  await apiClient.delete(
    `/categorias-servicios/${categoriaId}/servicios/${servicioId}`
  );
}
