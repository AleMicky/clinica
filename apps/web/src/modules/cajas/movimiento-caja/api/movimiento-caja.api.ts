import { apiClient } from "@/lib/api/api-client";
import type {
  CreateMovimientoCajaRequest,
  ExportarMovimientosQueryParams,
  MovimientoCajaMetricsResponse,
  MovimientoCajaQueryParams,
  MovimientoCajaResponse,
  PagedResult,
  UpdateMovimientoCajaRequest,
} from "../types/movimiento-caja.types";

/**
 * Operaciones principales para Movimientos de Caja (/movimientos-caja)
 */

export async function getMovimientosCaja(
  params?: MovimientoCajaQueryParams
): Promise<PagedResult<MovimientoCajaResponse>> {
  const response = await apiClient.get<PagedResult<MovimientoCajaResponse>>(
    "/movimientos-caja",
    { params }
  );
  return response.data;
}

export async function getMovimientoCajaById(
  id: number
): Promise<MovimientoCajaResponse> {
  const response = await apiClient.get<MovimientoCajaResponse>(
    `/movimientos-caja/${id}`
  );
  return response.data;
}

export async function createMovimientoCaja(
  request: CreateMovimientoCajaRequest
): Promise<MovimientoCajaResponse> {
  const response = await apiClient.post<MovimientoCajaResponse>(
    "/movimientos-caja",
    request
  );
  return response.data;
}

export async function updateMovimientoCaja(
  id: number,
  request: UpdateMovimientoCajaRequest
): Promise<MovimientoCajaResponse> {
  const response = await apiClient.put<MovimientoCajaResponse>(
    `/movimientos-caja/${id}`,
    request
  );
  return response.data;
}

export async function deleteMovimientoCaja(id: number): Promise<void> {
  await apiClient.delete(`/movimientos-caja/${id}`);
}

export async function getMovimientoCajaMetrics(params?: {
  search?: string;
  turnoCajaId?: number;
  naturaleza?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<MovimientoCajaMetricsResponse> {
  const response = await apiClient.get<MovimientoCajaMetricsResponse>(
    "/movimientos-caja/metricas",
    { params }
  );
  return response.data;
}

export async function exportarMovimientosCajaExcel(
  params?: ExportarMovimientosQueryParams
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    "/movimientos-caja/exportar-excel",
    {
      params,
      responseType: "blob",
    }
  );
  return response.data;
}

// Re-exportar tipos y conceptos desde el módulo especializado tipo-movimiento
export {
  getTiposMovimientoCaja,
  getConceptosMovimientoCaja,
} from "../../tipo-movimiento";
