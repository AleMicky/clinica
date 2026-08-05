import { apiClient } from "@/lib/api/api-client";
import type { PagedResult } from "../../moneda/types/moneda.types";
import type {
  CreateTipoCambioRequest,
  TipoCambioQueryParams,
  TipoCambioResponse,
  UpdateTipoCambioRequest,
} from "../types/tipo-cambio.types";

export async function getTiposCambio(
  params?: TipoCambioQueryParams
): Promise<PagedResult<TipoCambioResponse>> {
  const response = await apiClient.get<PagedResult<TipoCambioResponse>>(
    "/tipos-cambio",
    { params }
  );
  return response.data;
}

export async function getTipoCambioById(id: number): Promise<TipoCambioResponse> {
  const response = await apiClient.get<TipoCambioResponse>(`/tipos-cambio/${id}`);
  return response.data;
}

export async function createTipoCambio(
  request: CreateTipoCambioRequest
): Promise<TipoCambioResponse> {
  const response = await apiClient.post<TipoCambioResponse>(
    "/tipos-cambio",
    request
  );
  return response.data;
}

export async function updateTipoCambio(
  id: number,
  request: UpdateTipoCambioRequest
): Promise<TipoCambioResponse> {
  const response = await apiClient.put<TipoCambioResponse>(
    `/tipos-cambio/${id}`,
    request
  );
  return response.data;
}

export async function deleteTipoCambio(id: number): Promise<void> {
  await apiClient.delete(`/tipos-cambio/${id}`);
}
