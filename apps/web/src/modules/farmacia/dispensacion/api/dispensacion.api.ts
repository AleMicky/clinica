import { apiClient } from "@/lib/api/api-client";
import type {
  AnularDispensacionRequest,
  CreateDispensacionRequest,
  DispensacionMetricsResponse,
  DispensacionQueryParams,
  DispensacionResponse,
  MedicamentoStockResponse,
  PagedResult,
  RegistrarCobroDispensacionRequest,
} from "../types/dispensacion.types";

export async function getDispensaciones(
  params?: DispensacionQueryParams
): Promise<PagedResult<DispensacionResponse>> {
  const response = await apiClient.get<PagedResult<DispensacionResponse>>(
    "/farmacia/dispensaciones",
    { params }
  );
  return response.data;
}

export async function getDispensacionById(
  id: number
): Promise<DispensacionResponse> {
  const response = await apiClient.get<DispensacionResponse>(
    `/farmacia/dispensaciones/${id}`
  );
  return response.data;
}

export async function getDispensacionMetrics(params?: {
  almacenId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<DispensacionMetricsResponse> {
  const response = await apiClient.get<DispensacionMetricsResponse>(
    "/farmacia/dispensaciones/metricas",
    { params }
  );
  return response.data;
}

export async function getMedicamentosStock(
  almacenId: number,
  search?: string
): Promise<MedicamentoStockResponse[]> {
  const response = await apiClient.get<MedicamentoStockResponse[]>(
    "/farmacia/dispensaciones/medicamentos-stock",
    {
      params: { almacenId, search },
    }
  );
  return response.data;
}

export async function createDispensacion(
  request: CreateDispensacionRequest
): Promise<DispensacionResponse> {
  const response = await apiClient.post<DispensacionResponse>(
    "/farmacia/dispensaciones",
    request
  );
  return response.data;
}

export async function registrarCobroDispensacion(
  id: number,
  request: RegistrarCobroDispensacionRequest
): Promise<DispensacionResponse> {
  const response = await apiClient.post<DispensacionResponse>(
    `/farmacia/dispensaciones/${id}/cobrar`,
    request
  );
  return response.data;
}

export async function entregarMedicamentosDispensacion(
  id: number
): Promise<DispensacionResponse> {
  const response = await apiClient.post<DispensacionResponse>(
    `/farmacia/dispensaciones/${id}/entregar`
  );
  return response.data;
}

export async function anularDispensacion(
  id: number,
  request: AnularDispensacionRequest
): Promise<DispensacionResponse> {
  const response = await apiClient.post<DispensacionResponse>(
    `/farmacia/dispensaciones/${id}/anular`,
    request
  );
  return response.data;
}
