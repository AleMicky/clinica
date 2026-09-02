import { apiClient } from "@/lib/api/api-client";
import type {
  RecepcionCompraQueryParams,
  RecepcionCompraResponse,
  CreateRecepcionCompraRequest,
  UpdateRecepcionCompraRequest,
  AnularRecepcionCompraRequest,
  PagedResult,
} from "../types/recepcion-compra.types";

export async function getRecepcionesCompra(
  params?: RecepcionCompraQueryParams
): Promise<PagedResult<RecepcionCompraResponse>> {
  const response = await apiClient.get<PagedResult<RecepcionCompraResponse>>(
    "/recepciones-compra",
    { params }
  );
  return response.data;
}

export async function getRecepcionCompraById(
  id: number
): Promise<RecepcionCompraResponse> {
  const response = await apiClient.get<RecepcionCompraResponse>(
    `/recepciones-compra/${id}`
  );
  return response.data;
}

export async function createRecepcionCompra(
  request: CreateRecepcionCompraRequest
): Promise<RecepcionCompraResponse> {
  const response = await apiClient.post<RecepcionCompraResponse>(
    "/recepciones-compra",
    request
  );
  return response.data;
}

export async function updateRecepcionCompra(
  id: number,
  request: UpdateRecepcionCompraRequest
): Promise<RecepcionCompraResponse> {
  const response = await apiClient.put<RecepcionCompraResponse>(
    `/recepciones-compra/${id}`,
    request
  );
  return response.data;
}

export async function deleteRecepcionCompra(id: number): Promise<void> {
  await apiClient.delete(`/recepciones-compra/${id}`);
}

export async function confirmarRecepcionCompra(
  id: number
): Promise<RecepcionCompraResponse> {
  const response = await apiClient.post<RecepcionCompraResponse>(
    `/recepciones-compra/${id}/confirmar`
  );
  return response.data;
}

export async function anularRecepcionCompra(
  id: number,
  request: AnularRecepcionCompraRequest
): Promise<RecepcionCompraResponse> {
  const response = await apiClient.post<RecepcionCompraResponse>(
    `/recepciones-compra/${id}/anular`,
    request
  );
  return response.data;
}
