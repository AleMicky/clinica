import { apiClient } from "@/lib/api/api-client";
import type {
  AprobarTransferenciaAlmacenRequest,
  CancelarTransferenciaAlmacenRequest,
  CreateTransferenciaAlmacenRequest,
  DespacharTransferenciaAlmacenRequest,
  PagedResult,
  RecibirTransferenciaAlmacenRequest,
  TransferenciaAlmacenQueryParams,
  TransferenciaAlmacenResponse,
  UpdateTransferenciaAlmacenRequest,
} from "../types/transferencia-almacen.types";

export async function getTransferenciasAlmacen(
  params?: TransferenciaAlmacenQueryParams
): Promise<PagedResult<TransferenciaAlmacenResponse>> {
  const response = await apiClient.get<
    PagedResult<TransferenciaAlmacenResponse>
  >("/transferencias-almacen", {
    params,
  });
  return response.data;
}

export async function getTransferenciaAlmacenById(
  id: number
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.get<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}`
  );
  return response.data;
}

export async function createTransferenciaAlmacen(
  request: CreateTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    "/transferencias-almacen",
    request
  );
  return response.data;
}

export async function updateTransferenciaAlmacen(
  id: number,
  request: UpdateTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.put<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}`,
    request
  );
  return response.data;
}

export async function deleteTransferenciaAlmacen(id: number): Promise<void> {
  await apiClient.delete(`/transferencias-almacen/${id}`);
}

export async function solicitarTransferenciaAlmacen(
  id: number
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}/solicitar`
  );
  return response.data;
}

export async function aprobarTransferenciaAlmacen(
  id: number,
  request: AprobarTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}/aprobar`,
    request
  );
  return response.data;
}

export async function despacharTransferenciaAlmacen(
  id: number,
  request: DespacharTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}/despachar`,
    request
  );
  return response.data;
}

export async function recibirTransferenciaAlmacen(
  id: number,
  request: RecibirTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}/recibir`,
    request
  );
  return response.data;
}

export async function cancelarTransferenciaAlmacen(
  id: number,
  request: CancelarTransferenciaAlmacenRequest
): Promise<TransferenciaAlmacenResponse> {
  const response = await apiClient.post<TransferenciaAlmacenResponse>(
    `/transferencias-almacen/${id}/cancelar`,
    request
  );
  return response.data;
}
