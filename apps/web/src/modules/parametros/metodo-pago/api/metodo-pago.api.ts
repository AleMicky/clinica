import { apiClient } from "@/lib/api/api-client";
import type {
  MetodoPagoQueryParams,
  MetodoPagoResponse,
  PagedResult,
} from "../types/metodo-pago.types";

export async function getMetodosPago(
  params?: MetodoPagoQueryParams
): Promise<PagedResult<MetodoPagoResponse>> {
  const response = await apiClient.get<PagedResult<MetodoPagoResponse>>(
    "/metodos-pago",
    { params }
  );
  return response.data;
}

export async function getMetodoPagoById(
  id: number
): Promise<MetodoPagoResponse> {
  const response = await apiClient.get<MetodoPagoResponse>(
    `/metodos-pago/${id}`
  );
  return response.data;
}
