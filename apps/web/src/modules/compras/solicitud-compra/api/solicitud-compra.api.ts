import { apiClient } from "@/lib/api/api-client";
import {
  normalizeEstadoSolicitudCompra,
  type SolicitudCompraQueryParams,
  type SolicitudCompraResponse,
  type CreateSolicitudCompraRequest,
  type UpdateSolicitudCompraRequest,
  type AprobarSolicitudCompraRequest,
  type RechazarSolicitudCompraRequest,
  type CancelarSolicitudCompraRequest,
  type PagedResult,
} from "../types/solicitud-compra.types";

function mapSolicitudResponse(
  item: SolicitudCompraResponse
): SolicitudCompraResponse {
  return {
    ...item,
    estado: normalizeEstadoSolicitudCompra(item.estado),
  };
}

export async function getSolicitudesCompra(
  params?: SolicitudCompraQueryParams
): Promise<PagedResult<SolicitudCompraResponse>> {
  const response = await apiClient.get<PagedResult<SolicitudCompraResponse>>(
    "/solicitudes-compra",
    { params }
  );
  return {
    ...response.data,
    items: (response.data.items ?? []).map(mapSolicitudResponse),
  };
}

export async function getSolicitudCompraById(
  id: number
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.get<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}`
  );
  return mapSolicitudResponse(response.data);
}

export async function createSolicitudCompra(
  request: CreateSolicitudCompraRequest
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.post<SolicitudCompraResponse>(
    "/solicitudes-compra",
    request
  );
  return mapSolicitudResponse(response.data);
}

export async function updateSolicitudCompra(
  id: number,
  request: UpdateSolicitudCompraRequest
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.put<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}`,
    request
  );
  return mapSolicitudResponse(response.data);
}

export async function deleteSolicitudCompra(id: number): Promise<void> {
  await apiClient.delete(`/solicitudes-compra/${id}`);
}

export async function enviarAprobacionSolicitudCompra(
  id: number
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.post<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}/enviar-aprobacion`
  );
  return mapSolicitudResponse(response.data);
}

export async function aprobarSolicitudCompra(
  id: number,
  request: AprobarSolicitudCompraRequest
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.post<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}/aprobar`,
    request
  );
  return mapSolicitudResponse(response.data);
}

export async function rechazarSolicitudCompra(
  id: number,
  request: RechazarSolicitudCompraRequest
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.post<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}/rechazar`,
    request
  );
  return mapSolicitudResponse(response.data);
}

export async function cancelarSolicitudCompra(
  id: number,
  request: CancelarSolicitudCompraRequest
): Promise<SolicitudCompraResponse> {
  const response = await apiClient.post<SolicitudCompraResponse>(
    `/solicitudes-compra/${id}/cancelar`,
    request
  );
  return mapSolicitudResponse(response.data);
}
