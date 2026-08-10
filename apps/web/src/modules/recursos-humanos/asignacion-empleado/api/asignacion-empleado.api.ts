import { apiClient } from "@/lib/api/api-client";
import type {
    AsignacionEmpleadoQueryParams,
    AsignacionEmpleadoResponse,
    CreateAsignacionEmpleadoRequest,
    PagedResult,
    UpdateAsignacionEmpleadoRequest,
} from "../types/asignacion-empleado.types";

const BASE = "/asignaciones-empleado";

export async function getAsignacionesEmpleado(
    params?: AsignacionEmpleadoQueryParams,
): Promise<PagedResult<AsignacionEmpleadoResponse>> {
    const response = await apiClient.get<PagedResult<AsignacionEmpleadoResponse>>(
        BASE,
        { params },
    );
    return response.data;
}

export async function getAsignacionEmpleadoById(
    id: number,
): Promise<AsignacionEmpleadoResponse> {
    const response = await apiClient.get<AsignacionEmpleadoResponse>(
        `${BASE}/${id}`,
    );
    return response.data;
}

export async function createAsignacionEmpleado(
    request: CreateAsignacionEmpleadoRequest,
): Promise<AsignacionEmpleadoResponse> {
    const response = await apiClient.post<AsignacionEmpleadoResponse>(
        BASE,
        request,
    );
    return response.data;
}

export async function updateAsignacionEmpleado(
    id: number,
    request: UpdateAsignacionEmpleadoRequest,
): Promise<AsignacionEmpleadoResponse> {
    const response = await apiClient.put<AsignacionEmpleadoResponse>(
        `${BASE}/${id}`,
        request,
    );
    return response.data;
}

export async function deleteAsignacionEmpleado(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}
