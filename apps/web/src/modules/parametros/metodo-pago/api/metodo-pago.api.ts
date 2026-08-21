import { apiClient } from "@/lib/api/api-client";
import type {
  CreateMetodoPagoRequest,
  MetodoPagoQueryParams,
  MetodoPagoResponse,
  PagedResult,
  UpdateMetodoPagoRequest,
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

export async function createMetodoPago(
  data: CreateMetodoPagoRequest
): Promise<MetodoPagoResponse> {
  const response = await apiClient.post<MetodoPagoResponse>(
    "/metodos-pago",
    data
  );
  return response.data;
}

export async function updateMetodoPago(
  id: number,
  data: UpdateMetodoPagoRequest
): Promise<MetodoPagoResponse> {
  const response = await apiClient.put<MetodoPagoResponse>(
    `/metodos-pago/${id}`,
    data
  );
  return response.data;
}

export async function deleteMetodoPago(id: number): Promise<void> {
  await apiClient.delete(`/metodos-pago/${id}`);
}
