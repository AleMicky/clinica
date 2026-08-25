import { apiClient } from "@/lib/api/api-client";
import type {
  AsignarRolOpcionMenuRequest,
  CreateRolOpcionMenuRequest,
  RolOpcionMenuResponse,
  RolOpcionesMenuResponse,
  RolOpcionMenuTreeResponse,
} from "../types/rol-opcion-menu.types";

export async function getRolOpcionesMenu(
  rolId: number
): Promise<RolOpcionesMenuResponse> {
  const response = await apiClient.get<RolOpcionesMenuResponse>(
    `/roles/${rolId}/opciones-menu`
  );
  return response.data;
}

export async function getRolOpcionesMenuTree(
  rolId: number
): Promise<RolOpcionMenuTreeResponse[]> {
  const response = await apiClient.get<RolOpcionMenuTreeResponse[]>(
    `/roles/${rolId}/opciones-menu/arbol`
  );
  return response.data;
}

export async function createRolOpcionMenu(
  rolId: number,
  request: CreateRolOpcionMenuRequest
): Promise<RolOpcionMenuResponse> {
  const response = await apiClient.post<RolOpcionMenuResponse>(
    `/roles/${rolId}/opciones-menu`,
    request
  );
  return response.data;
}

export async function asignarRolOpcionesMenu(
  rolId: number,
  request: AsignarRolOpcionMenuRequest
): Promise<void> {
  await apiClient.put(`/roles/${rolId}/opciones-menu`, request);
}

export async function quitarRolOpcionMenu(
  rolId: number,
  opcionMenuId: number
): Promise<void> {
  await apiClient.delete(`/roles/${rolId}/opciones-menu/${opcionMenuId}`);
}
