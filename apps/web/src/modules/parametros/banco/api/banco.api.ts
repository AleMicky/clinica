import { apiClient } from "@/lib/api/api-client";
import type {
  BancoQueryParams,
  BancoResponse,
  CreateBancoRequest,
  CreateCuentaBancariaRequest,
  CuentaBancariaQueryParams,
  CuentaBancariaResponse,
  PagedResult,
  UpdateBancoRequest,
  UpdateCuentaBancariaRequest,
} from "../types/banco.types";

export async function getBancos(
  params?: BancoQueryParams
): Promise<PagedResult<BancoResponse>> {
  const response = await apiClient.get<PagedResult<BancoResponse>>("/bancos", {
    params,
  });
  return response.data;
}

export async function getBancoById(id: number): Promise<BancoResponse> {
  const response = await apiClient.get<BancoResponse>(`/bancos/${id}`);
  return response.data;
}

export async function createBanco(
  request: CreateBancoRequest
): Promise<BancoResponse> {
  const response = await apiClient.post<BancoResponse>("/bancos", request);
  return response.data;
}

export async function updateBanco(
  id: number,
  request: UpdateBancoRequest
): Promise<BancoResponse> {
  const response = await apiClient.put<BancoResponse>(`/bancos/${id}`, request);
  return response.data;
}

export async function deleteBanco(id: number): Promise<void> {
  await apiClient.delete(`/bancos/${id}`);
}

// Cuentas Bancarias
export async function getCuentasBancarias(
  bancoId: number,
  params?: CuentaBancariaQueryParams
): Promise<PagedResult<CuentaBancariaResponse>> {
  const response = await apiClient.get<PagedResult<CuentaBancariaResponse>>(
    `/bancos/${bancoId}/cuentas`,
    { params }
  );
  return response.data;
}

export async function getCuentaBancariaById(
  bancoId: number,
  cuentaId: number
): Promise<CuentaBancariaResponse> {
  const response = await apiClient.get<CuentaBancariaResponse>(
    `/bancos/${bancoId}/cuentas/${cuentaId}`
  );
  return response.data;
}

export async function createCuentaBancaria(
  bancoId: number,
  request: CreateCuentaBancariaRequest
): Promise<CuentaBancariaResponse> {
  const response = await apiClient.post<CuentaBancariaResponse>(
    `/bancos/${bancoId}/cuentas`,
    request
  );
  return response.data;
}

export async function updateCuentaBancaria(
  bancoId: number,
  cuentaId: number,
  request: UpdateCuentaBancariaRequest
): Promise<CuentaBancariaResponse> {
  const response = await apiClient.put<CuentaBancariaResponse>(
    `/bancos/${bancoId}/cuentas/${cuentaId}`,
    request
  );
  return response.data;
}

export async function deleteCuentaBancaria(
  bancoId: number,
  cuentaId: number
): Promise<void> {
  await apiClient.delete(`/bancos/${bancoId}/cuentas/${cuentaId}`);
}
