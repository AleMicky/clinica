import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUsuarioRequest,
  PagedResult,
  UpdateUsuarioRequest,
  UsuarioQueryParams,
  UsuarioResponse,
} from "../types/usuario.types";

export async function getUsuarios(
  params?: UsuarioQueryParams
): Promise<PagedResult<UsuarioResponse>> {
  const response = await apiClient.get<PagedResult<UsuarioResponse>>("/usuarios", {
    params,
  });
  return response.data;
}

export async function getUsuarioById(id: number): Promise<UsuarioResponse> {
  const response = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`);
  return response.data;
}

export async function createUsuario(
  request: CreateUsuarioRequest
): Promise<UsuarioResponse> {
  const response = await apiClient.post<UsuarioResponse>("/usuarios", request);
  return response.data;
}

export async function updateUsuario(
  id: number,
  request: UpdateUsuarioRequest
): Promise<UsuarioResponse> {
  const response = await apiClient.put<UsuarioResponse>(`/usuarios/${id}`, request);
  return response.data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await apiClient.delete(`/usuarios/${id}`);
}
