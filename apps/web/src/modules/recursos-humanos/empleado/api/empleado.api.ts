import { apiClient } from "@/lib/api/api-client";
import type {
    CreateEmpleadoRequest,
    EmpleadoBaseInfo,
    EmpleadoQueryParams,
    EmpleadoResponse,
    PagedResult,
    UpdateEmpleadoRequest,
} from "../types/empleado.types";

const BASE = "/empleados";

export async function getEmpleadosPermitidos(): Promise<EmpleadoBaseInfo[]> {
    const response = await apiClient.get<EmpleadoBaseInfo[]>(
        `${BASE}/permitidos`,
    );
    return response.data;
}

export async function getEmpleados(
    params?: EmpleadoQueryParams,
): Promise<PagedResult<EmpleadoResponse>> {
    const response = await apiClient.get<PagedResult<EmpleadoResponse>>(
        BASE,
        { params },
    );
    return response.data;
}

export async function getEmpleadoById(
    id: number,
): Promise<EmpleadoResponse> {
    const response = await apiClient.get<EmpleadoResponse>(
        `${BASE}/${id}`,
    );
    return response.data;
}

export async function createEmpleado(
    request: CreateEmpleadoRequest,
): Promise<EmpleadoResponse> {
    const response = await apiClient.post<EmpleadoResponse>(
        BASE,
        request,
    );
    return response.data;
}

export async function updateEmpleado(
    id: number,
    request: UpdateEmpleadoRequest,
): Promise<EmpleadoResponse> {
    const response = await apiClient.put<EmpleadoResponse>(
        `${BASE}/${id}`,
        request,
    );
    return response.data;
}

export async function deleteEmpleado(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}