import { apiClient } from "@/lib/api/api-client";
import type {
  CotizacionCompraQueryParams,
  CotizacionCompraResponse,
  CreateCotizacionCompraRequest,
  UpdateCotizacionCompraRequest,
  CancelarCotizacionCompraRequest,
  PagedResult,
} from "../types/cotizacion-compra.types";

export async function getCotizacionesCompra(
  params?: CotizacionCompraQueryParams
): Promise<PagedResult<CotizacionCompraResponse>> {
  const response = await apiClient.get<PagedResult<CotizacionCompraResponse>>(
    "/cotizaciones-compra",
    { params }
  );
  return response.data;
}

export async function getCotizacionCompraById(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.get<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}`
  );
  return response.data;
}

export async function createCotizacionCompra(
  request: CreateCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    "/cotizaciones-compra",
    request
  );
  return response.data;
}

export async function updateCotizacionCompra(
  id: number,
  request: UpdateCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.put<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}`,
    request
  );
  return response.data;
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
  return response.data;
}

export async function seleccionarCotizacionCompra(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/seleccionar`
  );
  return response.data;
}

export async function rechazarCotizacionCompra(
  id: number
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/rechazar`
  );
  return response.data;
}

export async function cancelarCotizacionCompra(
  id: number,
  request: CancelarCotizacionCompraRequest
): Promise<CotizacionCompraResponse> {
  const response = await apiClient.post<CotizacionCompraResponse>(
    `/cotizaciones-compra/${id}/cancelar`,
    request
  );
  return response.data;
}
