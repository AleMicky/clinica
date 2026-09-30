import { apiClient } from "@/lib/api/api-client";
import type {
  MarcaQueryParams,
  MarcaResponse,
  CreateMarcaRequest,
  PagedResult,
  UpdateMarcaRequest,
} from "../types/marca.types";

export async function getMarcas(
  params?: MarcaQueryParams
): Promise<PagedResult<MarcaResponse>> {
  const response = await apiClient.get<PagedResult<MarcaResponse>>(
    "/marcas",
    { params }
  );
  return response.data;
}

export async function getMarcaById(
  id: number
): Promise<MarcaResponse> {
  const response = await apiClient.get<MarcaResponse>(
    `/marcas/${id}`
  );
  return response.data;
}

export async function createMarca(
  request: CreateMarcaRequest
): Promise<MarcaResponse> {
  const response = await apiClient.post<MarcaResponse>(
    "/marcas",
    request
  );
  return response.data;
}

export async function updateMarca(
  id: number,
  request: UpdateMarcaRequest
): Promise<MarcaResponse> {
  const response = await apiClient.put<MarcaResponse>(
    `/marcas/${id}`,
    request
  );
  return response.data;
}

export async function deleteMarca(id: number): Promise<void> {
  await apiClient.delete(`/marcas/${id}`);
}
