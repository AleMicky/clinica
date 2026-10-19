import { apiClient } from "@/lib/api/api-client";
import type {
  CancelarCirugiaRequest,
  CirugiaMetricsResponse,
  CirugiaQueryParams,
  CirugiaResponse,
  CreateCirugiaRequest,
  FinalizarCirugiaRequest,
  IniciarCirugiaRequest,
  MaterialQuirofanoStockResponse,
  PagedResult,
  RegistrarGastoMaterialCirugiaRequest,
  UpdateCirugiaRequest,
} from "../types/quirofano.types";

const BASE_URL = "/quirofano/cirugias";

export async function getCirugias(
  params?: CirugiaQueryParams
): Promise<PagedResult<CirugiaResponse>> {
  const { data } = await apiClient.get<PagedResult<CirugiaResponse>>(BASE_URL, {
    params,
  });
  return data;
}

export async function getCirugiaById(id: number): Promise<CirugiaResponse> {
  const { data } = await apiClient.get<CirugiaResponse>(`${BASE_URL}/${id}`);
  return data;
}

export async function getCirugiaMetrics(
  fechaDesde?: string,
  fechaHasta?: string
): Promise<CirugiaMetricsResponse> {
  const { data } = await apiClient.get<CirugiaMetricsResponse>(
    `${BASE_URL}/metricas`,
    {
      params: { fechaDesde, fechaHasta },
    }
  );
  return data;
}

export async function getMaterialesQuirofanoStock(
  almacenId?: number,
  search?: string
): Promise<MaterialQuirofanoStockResponse[]> {
  const { data } = await apiClient.get<MaterialQuirofanoStockResponse[]>(
    `${BASE_URL}/materiales-stock`,
    {
      params: { almacenId, search },
    }
  );
  return data;
}

export async function createCirugia(
  data: CreateCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.post<CirugiaResponse>(
    BASE_URL,
    data
  );
  return response;
}

export async function updateCirugia(
  id: number,
  data: UpdateCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.put<CirugiaResponse>(
    `${BASE_URL}/${id}`,
    data
  );
  return response;
}

export async function iniciarCirugia(
  id: number,
  data: IniciarCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.post<CirugiaResponse>(
    `${BASE_URL}/${id}/iniciar`,
    data
  );
  return response;
}

export async function registrarGastosMaterialesCirugia(
  id: number,
  data: RegistrarGastoMaterialCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.post<CirugiaResponse>(
    `${BASE_URL}/${id}/gastos-materiales`,
    data
  );
  return response;
}

export async function finalizarCirugia(
  id: number,
  data: FinalizarCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.post<CirugiaResponse>(
    `${BASE_URL}/${id}/finalizar`,
    data
  );
  return response;
}

export async function cancelarCirugia(
  id: number,
  data: CancelarCirugiaRequest
): Promise<CirugiaResponse> {
  const { data: response } = await apiClient.post<CirugiaResponse>(
    `${BASE_URL}/${id}/cancelar`,
    data
  );
  return response;
}
