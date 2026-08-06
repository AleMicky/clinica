import { apiClient } from "@/lib/api/api-client";
import type {
    AreaArbolResponse,
    AreaQueryParams,
    AreaResponse,
    CreateAreaRequest,
    PagedResult,
    UpdateAreaRequest,
} from "../types/area.types";

const BASE = "/areas";

export async function getAreas(
    params?: AreaQueryParams,
): Promise<PagedResult<AreaResponse>> {
    const response = await apiClient.get<PagedResult<AreaResponse>>(BASE, {
        params,
    });
    return response.data;
}

export async function getArbolAreas(): Promise<AreaArbolResponse> {
    const response = await apiClient.get<AreaArbolResponse>(`${BASE}/arbol`);
    return response.data;
}

export async function getSubareas(
    id: number,
): Promise<AreaArbolResponse[]> {
    const response = await apiClient.get<AreaArbolResponse[]>(
        `${BASE}/${id}/subareas`,
    );
    return response.data;
}

export async function getAreaById(id: number): Promise<AreaResponse> {
    const response = await apiClient.get<AreaResponse>(`${BASE}/${id}`);
    return response.data;
}

export async function createArea(
    request: CreateAreaRequest,
): Promise<AreaResponse> {
    const response = await apiClient.post<AreaResponse>(BASE, request);
    return response.data;
}

export async function updateArea(
    id: number,
    request: UpdateAreaRequest,
): Promise<AreaResponse> {
    const response = await apiClient.put<AreaResponse>(`${BASE}/${id}`, request);
    return response.data;
}

export async function deleteArea(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}