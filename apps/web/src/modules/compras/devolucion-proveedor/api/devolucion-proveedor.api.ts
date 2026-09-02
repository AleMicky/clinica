import { apiClient } from "@/lib/api/api-client";
import type {
  DevolucionProveedorQueryParams,
  DevolucionProveedorResponse,
  CreateDevolucionProveedorRequest,
  UpdateDevolucionProveedorRequest,
  AnularDevolucionProveedorRequest,
  PagedResult,
} from "../types/devolucion-proveedor.types";

export async function getDevolucionesProveedor(
  params?: DevolucionProveedorQueryParams
): Promise<PagedResult<DevolucionProveedorResponse>> {
  const response = await apiClient.get<PagedResult<DevolucionProveedorResponse>>(
    "/devoluciones-proveedor",
    { params }
  );
  return response.data;
}

export async function getDevolucionProveedorById(
  id: number
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.get<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}`
  );
  return response.data;
}

export async function createDevolucionProveedor(
  request: CreateDevolucionProveedorRequest
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    "/devoluciones-proveedor",
    request
  );
  return response.data;
}

export async function updateDevolucionProveedor(
  id: number,
  request: UpdateDevolucionProveedorRequest
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.put<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}`,
    request
  );
  return response.data;
}

export async function deleteDevolucionProveedor(id: number): Promise<void> {
  await apiClient.delete(`/devoluciones-proveedor/${id}`);
}

export async function enviarAprobacionDevolucionProveedor(
  id: number
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}/enviar-aprobacion`
  );
  return response.data;
}

export async function aprobarDevolucionProveedor(
  id: number
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}/aprobar`
  );
  return response.data;
}

export async function rechazarDevolucionProveedor(
  id: number
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}/rechazar`
  );
  return response.data;
}

export async function confirmarDevolucionProveedor(
  id: number
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}/confirmar`
  );
  return response.data;
}

export async function anularDevolucionProveedor(
  id: number,
  request: AnularDevolucionProveedorRequest
): Promise<DevolucionProveedorResponse> {
  const response = await apiClient.post<DevolucionProveedorResponse>(
    `/devoluciones-proveedor/${id}/anular`,
    request
  );
  return response.data;
}
