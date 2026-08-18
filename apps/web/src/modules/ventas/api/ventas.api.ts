import { apiClient } from "@/lib/api/api-client";
import type {
  CambiarEstadoVentaRequest,
  CreateVentaDetalleRequest,
  CreateVentaPagadorRequest,
  CreateVentaRequest,
  PagedResult,
  UpdateVentaDetalleRequest,
  UpdateVentaPagadorRequest,
  VentaDetalleResponse,
  VentaPagadorResponse,
  VentaQueryParams,
  VentaResponse,
} from "../types/ventas.types";

export async function getVentas(
  params?: VentaQueryParams
): Promise<PagedResult<VentaResponse>> {
  const response = await apiClient.get<PagedResult<VentaResponse>>("/ventas", {
    params,
  });
  return response.data;
}

export async function getVentaById(id: number): Promise<VentaResponse> {
  const response = await apiClient.get<VentaResponse>(`/ventas/${id}`);
  return response.data;
}

export async function createVenta(
  request: CreateVentaRequest
): Promise<VentaResponse> {
  const response = await apiClient.post<VentaResponse>("/ventas", request);
  return response.data;
}

export async function cambiarEstadoVenta(
  id: number,
  request: CambiarEstadoVentaRequest
): Promise<VentaResponse> {
  const response = await apiClient.patch<VentaResponse>(
    `/ventas/${id}/estado`,
    request
  );
  return response.data;
}

export async function anularVenta(id: number): Promise<void> {
  await apiClient.delete(`/ventas/${id}`);
}

// Submódulo Detalles
export async function getVentaDetalles(
  ventaId: number,
  params?: VentaQueryParams
): Promise<PagedResult<VentaDetalleResponse>> {
  const response = await apiClient.get<any>(
    `/ventas/${ventaId}/detalles`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      totalItems: response.data.length,
      pageNumber: 1,
      pageSize: response.data.length,
      totalPages: 1,
    };
  }
  return response.data;
}

export async function createVentaDetalle(
  ventaId: number,
  request: CreateVentaDetalleRequest
): Promise<VentaDetalleResponse> {
  const response = await apiClient.post<VentaDetalleResponse>(
    `/ventas/${ventaId}/detalles`,
    request
  );
  return response.data;
}

export async function updateVentaDetalle(
  ventaId: number,
  detalleId: number,
  request: UpdateVentaDetalleRequest
): Promise<VentaDetalleResponse> {
  const response = await apiClient.put<VentaDetalleResponse>(
    `/ventas/${ventaId}/detalles/${detalleId}`,
    request
  );
  return response.data;
}

export async function deleteVentaDetalle(
  ventaId: number,
  detalleId: number
): Promise<void> {
  await apiClient.delete(`/ventas/${ventaId}/detalles/${detalleId}`);
}

// Submódulo Pagadores
export async function getVentaPagadores(
  ventaId: number,
  params?: VentaQueryParams
): Promise<PagedResult<VentaPagadorResponse>> {
  const response = await apiClient.get<any>(
    `/ventas/${ventaId}/pagadores`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      totalItems: response.data.length,
      pageNumber: 1,
      pageSize: response.data.length,
      totalPages: 1,
    };
  }
  return response.data;
}

export async function createVentaPagador(
  ventaId: number,
  request: CreateVentaPagadorRequest
): Promise<VentaPagadorResponse> {
  const response = await apiClient.post<VentaPagadorResponse>(
    `/ventas/${ventaId}/pagadores`,
    request
  );
  return response.data;
}

export async function updateVentaPagador(
  ventaId: number,
  pagadorId: number,
  request: UpdateVentaPagadorRequest
): Promise<VentaPagadorResponse> {
  const response = await apiClient.put<VentaPagadorResponse>(
    `/ventas/${ventaId}/pagadores/${pagadorId}`,
    request
  );
  return response.data;
}

export async function deleteVentaPagador(
  ventaId: number,
  pagadorId: number
): Promise<void> {
  await apiClient.delete(`/ventas/${ventaId}/pagadores/${pagadorId}`);
}
