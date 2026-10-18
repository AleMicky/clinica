import { apiClient } from "@/lib/api/api-client";
import type {
  AnularCobroRequest,
  CobroMetrics,
  CobroQueryParams,
  CobroResponse,
  ConfirmarCobroRequest,
  ExportarCobrosQueryParams,
  GenerarCobroDesdeVentaRequest,
  PagedResult,
} from "../types/cobro.types";

export async function getCobros(
  params?: CobroQueryParams
): Promise<PagedResult<CobroResponse>> {
  const response = await apiClient.get<PagedResult<CobroResponse>>("/cobros", {
    params,
  });
  return response.data;
}

export async function getCobroMetrics(params?: {
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<CobroMetrics> {
  const response = await apiClient.get<CobroMetrics>("/cobros/metricas", {
    params,
  });
  return response.data;
}

export async function exportarCobrosExcel(
  params?: ExportarCobrosQueryParams
): Promise<Blob> {
  const response = await apiClient.get<Blob>("/cobros/exportar-excel", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export async function getCobroById(id: number): Promise<CobroResponse> {
  const response = await apiClient.get<CobroResponse>(`/cobros/${id}`);
  return response.data;
}

export async function generarCobroDesdeVenta(
  request: GenerarCobroDesdeVentaRequest
): Promise<CobroResponse> {
  const response = await apiClient.post<CobroResponse>(
    "/cobros/generar-desde-venta",
    request
  );
  return response.data;
}

export async function confirmarCobro(
  id: number,
  request: ConfirmarCobroRequest
): Promise<CobroResponse> {
  const response = await apiClient.post<CobroResponse>(
    `/cobros/${id}/confirmar`,
    request
  );
  return response.data;
}

export async function anularCobro(
  id: number,
  request: AnularCobroRequest
): Promise<CobroResponse> {
  const response = await apiClient.post<CobroResponse>(
    `/cobros/${id}/anular`,
    request
  );
  return response.data;
}
