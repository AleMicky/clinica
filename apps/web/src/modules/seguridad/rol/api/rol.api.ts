import { apiClient } from "@/lib/api/api-client";
import type {
  CreateRolRequest,
  PagedResult,
  RolQueryParams,
  RolResponse,
  UpdateRolRequest,
} from "../types/rol.types";

export async function getRoles(
  params?: RolQueryParams
): Promise<PagedResult<RolResponse>> {
  const response = await apiClient.get<PagedResult<RolResponse>>("/roles", {
    params,
  });
  return response.data;
}

export async function getRolById(id: number): Promise<RolResponse> {
  const response = await apiClient.get<RolResponse>(`/roles/${id}`);
  return response.data;
}

export async function createRol(
  request: CreateRolRequest
): Promise<RolResponse> {
  const response = await apiClient.post<RolResponse>("/roles", request);
  return response.data;
}

export async function updateRol(
  id: number,
  request: UpdateRolRequest
): Promise<RolResponse> {
  const response = await apiClient.put<RolResponse>(`/roles/${id}`, request);
  return response.data;
}

export async function deleteRol(id: number): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}
