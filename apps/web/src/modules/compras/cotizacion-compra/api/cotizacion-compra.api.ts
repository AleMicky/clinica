import { apiClient } from "@/lib/api/api-client";
import {
  normalizeEstadoCotizacionCompra,
  type CotizacionCompraQueryParams,
  type CotizacionCompraResponse,
  type CreateCotizacionCompraRequest,
  type UpdateCotizacionCompraRequest,
  type CancelarCotizacionCompraRequest,
  type PagedResult,
} from "../types/cotizacion-compra.types";

function mapCotizacionResponse(
  item: CotizacionCompraResponse
): CotizacionCompraResponse {
  return {
    ...item,
    estado: normalizeEstadoCotizacionCompra(item.estado),
  };
}

export async function getCotizacionesCompra(
  params?: CotizacionCompraQueryParams
): Promise<PagedResult<CotizacionCompraResponse>> {
  const response = await apiClient.get<PagedResult<CotizacionCompraResponse>>(
    "/cotizaciones-compra",
    { params }
  );
  return {
    ...response.data,
    items: (response.data.items ?? []).map(mapCotizacionResponse),
  };
}

export async function getCotizacionCompraById(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.get<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}`
  );
  return mapCotizacionResponse(response.data);
}

export async function createCotizacionCompra(
  request: CreateCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    "/cotizaciones-compra",
    request
  );
  return mapCotizacionResponse(response.data);
}

export async function updateCotizacionCompra(
  id: number,
  request: UpdateCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.put<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}`,
    request
  );
  return mapCotizacionResponse(response.data);
}

export async function deleteCotizacionCompra(id: number): Promise<void> {
  await apiClient.delete(`/cotizaciones-compra/${id}`);
}

export async function recibirCotizacionCompra(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/recibir`
  );
  return mapCotizacionResponse(response.data);
}

export async function seleccionarCotizacionCompra(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/seleccionar`
  );
  return mapCotizacionResponse(response.data);
}

export async function rechazarCotizacionCompra(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/rechazar`
  );
  return mapCotizacionResponse(response.data);
}

export async function cancelarCotizacionCompra(
  id: number,
  request: CancelarCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/cancelar`,
    request
  );
  return mapCotizacionResponse(response.data);
}
