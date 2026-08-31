import { apiClient } from "@/lib/api/api-client";
import type {
  AlmacenQueryParams,
  AlmacenResponse,
  CreateAlmacenRequest,
  PagedResult,
  UpdateAlmacenRequest,
} from "../types/almacen.types";

export async function getAlmacenes(
  params?: AlmacenQueryParams
): Promise<PagedResult<AlmacenResponse>> {
  const response = await apiClient.get<PagedResult<AlmacenResponse>>(
    "/almacenes",
    { params }
  );
  return response.data;
}

export async function getAlmacenById(
  id: number
): Promise<AlmacenResponse> {
  const response = await apiClient.get<AlmacenResponse>(
    `/almacenes/${id}`
  );
  return response.data;
}

export async function createAlmacen(
  request: CreateAlmacenRequest
): Promise<AlmacenResponse> {
  const response = await apiClient.post<AlmacenResponse>(
    "/almacenes",
    request
  );
  return response.data;
}

export async function updateAlmacen(
  id: number,
  request: UpdateAlmacenRequest
): Promise<AlmacenResponse> {
  const response = await apiClient.put<AlmacenResponse>(
    `/almacenes/${id}`,
    request
  );
  return response.data;
}

export async function deleteAlmacen(id: number): Promise<void> {
  await apiClient.delete(`/almacenes/${id}`);
}
