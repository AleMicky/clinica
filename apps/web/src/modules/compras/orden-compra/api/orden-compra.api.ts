import { apiClient } from "@/lib/api/api-client";
import {
  normalizeEstadoOrdenCompra,
  type OrdenCompraQueryParams,
  type OrdenCompraResponse,
  type CreateOrdenCompraRequest,
  type UpdateOrdenCompraRequest,
  type RecibirOrdenCompraRequest,
  type CancelarOrdenCompraRequest,
  type PagedResult,
} from "../types/orden-compra.types";

function normalizeOrdenCompra(item: OrdenCompraResponse): OrdenCompraResponse {
  return {
    ...item,
    estado: normalizeEstadoOrdenCompra(item.estado),
  };
}

export async function getOrdenesCompra(
  params?: OrdenCompraQueryParams
): Promise<PagedResult<OrdenCompraResponse>> {
  const response = await apiClient.get<PagedResult<OrdenCompraResponse>>(
    "/ordenes-compra",
    { params }
  );
  return {
    ...response.data,
    items: (response.data.items ?? []).map(normalizeOrdenCompra),
  };
}

export async function getOrdenCompraById(
  id: number
): Promise<OrdenCompraResponse> {
  const response = await apiClient.get<OrdenCompraResponse>(
    `/ordenes-compra/${id}`
  );
  return normalizeOrdenCompra(response.data);
}

export async function createOrdenCompra(
  request: CreateOrdenCompraRequest
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    "/ordenes-compra",
    request
  );
  return normalizeOrdenCompra(response.data);
}

export async function updateOrdenCompra(
  id: number,
  request: UpdateOrdenCompraRequest
): Promise<OrdenCompraResponse> {
  const response = await apiClient.put<OrdenCompraResponse>(
    `/ordenes-compra/${id}`,
    request
  );
  return normalizeOrdenCompra(response.data);
}

export async function deleteOrdenCompra(id: number): Promise<void> {
  await apiClient.delete(`/ordenes-compra/${id}`);
}

export async function enviarAprobacionOrdenCompra(
  id: number
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    `/ordenes-compra/${id}/enviar-aprobacion`
  );
  return normalizeOrdenCompra(response.data);
}

export async function aprobarOrdenCompra(
  id: number
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    `/ordenes-compra/${id}/aprobar`
  );
  return normalizeOrdenCompra(response.data);
}

export async function enviarProveedorOrdenCompra(
  id: number
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    `/ordenes-compra/${id}/enviar-proveedor`
  );
  return normalizeOrdenCompra(response.data);
}

export async function recibirOrdenCompra(
  id: number,
  request: RecibirOrdenCompraRequest
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    `/ordenes-compra/${id}/recibir`,
    request
  );
  return normalizeOrdenCompra(response.data);
}

export async function cancelarOrdenCompra(
  id: number,
  request: CancelarOrdenCompraRequest
): Promise<OrdenCompraResponse> {
  const response = await apiClient.post<OrdenCompraResponse>(
    `/ordenes-compra/${id}/cancelar`,
    request
  );
  return normalizeOrdenCompra(response.data);
}
