import { apiClient } from "@/lib/api/api-client";
import type {
  AnularCobroRequest,
  CobroQueryParams,
  CobroResponse,
  ConfirmarCobroRequest,
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
