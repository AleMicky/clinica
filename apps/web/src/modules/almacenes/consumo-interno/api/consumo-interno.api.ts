import { apiClient } from "@/lib/api/api-client";
import type {
  ConsumoInternoQueryParams,
  ConsumoInternoResponse,
  AnularConsumoInternoRequest,
  CreateConsumoInternoRequest,
  PagedResult,
  UpdateConsumoInternoRequest,
} from "../types/consumo-interno.types";

export async function getConsumosInterno(
  params?: ConsumoInternoQueryParams
): Promise<PagedResult<ConsumoInternoResponse>> {
  const response = await apiClient.get<PagedResult<ConsumoInternoResponse>>(
    "/consumos-interno",
    { params }
  );
  return response.data;
}

export async function getConsumoInternoById(
  id: number
): Promise<ConsumoInternoResponse> {
  const response = await apiClient.get<ConsumoInternoResponse>(
    `/consumos-interno/${id}`
  );
  return response.data;
}

export async function createConsumoInterno(
  request: CreateConsumoInternoRequest
): Promise<ConsumoInternoResponse> {
  const response = await apiClient.post<ConsumoInternoResponse>(
    "/consumos-interno",
    request
  );
  return response.data;
}

export async function updateConsumoInterno(
  id: number,
  request: UpdateConsumoInternoRequest
): Promise<ConsumoInternoResponse> {
  const response = await apiClient.put<ConsumoInternoResponse>(
    `/consumos-interno/${id}`,
    request
  );
  return response.data;
}

export async function deleteConsumoInterno(id: number): Promise<void> {
  await apiClient.delete(`/consumos-interno/${id}`);
}

export async function confirmarConsumoInterno(
  id: number
): Promise<ConsumoInternoResponse> {
  const response = await apiClient.post<ConsumoInternoResponse>(
    `/consumos-interno/${id}/confirmar`
  );
  return response.data;
}

export async function anularConsumoInterno(
  id: number,
  request: AnularConsumoInternoRequest
): Promise<ConsumoInternoResponse> {
  const response = await apiClient.post<ConsumoInternoResponse>(
    `/consumos-interno/${id}/anular`,
    request
  );
  return response.data;
}
