import { apiClient } from "@/lib/api/api-client";
import type {
  CreateProveedorRequest,
  PagedResult,
  ProveedorQueryParams,
  ProveedorResponse,
  UpdateProveedorRequest,
} from "../types/proveedor.types";

export async function getProveedores(
  params?: ProveedorQueryParams
): Promise<PagedResult<ProveedorResponse>> {
  const response = await apiClient.get<PagedResult<ProveedorResponse>>(
    "/proveedores",
    { params }
  );
  return response.data;
}

export async function getProveedorById(
  id: number
): Promise<ProveedorResponse> {
  const response = await apiClient.get<ProveedorResponse>(
    `/proveedores/${id}`
  );
  return response.data;
}

export async function createProveedor(
  request: CreateProveedorRequest
): Promise<ProveedorResponse> {
  const response = await apiClient.post<ProveedorResponse>(
    "/proveedores",
    request
  );
  return response.data;
}

export async function updateProveedor(
  id: number,
  request: UpdateProveedorRequest
): Promise<ProveedorResponse> {
  const response = await apiClient.put<ProveedorResponse>(
    `/proveedores/${id}`,
    request
  );
  return response.data;
}

export async function deleteProveedor(id: number): Promise<void> {
  await apiClient.delete(`/proveedores/${id}`);
}
