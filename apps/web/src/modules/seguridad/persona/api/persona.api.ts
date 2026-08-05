import { apiClient } from "@/lib/api/api-client";
import type {
  CreatePersonaRequest,
  PagedResult,
  PersonaQueryParams,
  PersonaResponse,
  UpdatePersonaRequest,
} from "../types/persona.types";

export async function getPersonas(
  params?: PersonaQueryParams
): Promise<PagedResult<PersonaResponse>> {
  const response = await apiClient.get<PagedResult<PersonaResponse>>("/personas", {
    params,
  });
  return response.data;
}

export async function getPersonaById(id: number): Promise<PersonaResponse> {
  const response = await apiClient.get<PersonaResponse>(`/personas/${id}`);
  return response.data;
}

export async function createPersona(
  request: CreatePersonaRequest
): Promise<PersonaResponse> {
  const response = await apiClient.post<PersonaResponse>("/personas", request);
  return response.data;
}

export async function updatePersona(
  id: number,
  request: UpdatePersonaRequest
): Promise<PersonaResponse> {
  const response = await apiClient.put<PersonaResponse>(`/personas/${id}`, request);
  return response.data;
}

export async function deletePersona(id: number): Promise<void> {
  await apiClient.delete(`/personas/${id}`);
}
