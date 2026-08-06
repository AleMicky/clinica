import { apiClient } from "@/lib/api/api-client";
import type {
    CreateTipoAreaRequest,
    PagedResult,
    TipoAreaQueryParams,
    TipoAreaResponse,
    UpdateTipoAreaRequest,
} from "../types/tipo-area.types";

const BASE = "/tipos-area";

export async function getTiposArea(
    params?: TipoAreaQueryParams,
): Promise<PagedResult<TipoAreaResponse>> {
    const response = await apiClient.get<PagedResult<TipoAreaResponse>>(BASE, {
        params,
    });
    return response.data;
}

export async function getTipoAreaById(
    id: number,
): Promise<TipoAreaResponse> {
    const response = await apiClient.get<TipoAreaResponse>(`${BASE}/${id}`);
    return response.data;
}

export async function createTipoArea(
    request: CreateTipoAreaRequest,
): Promise<TipoAreaResponse> {
    const response = await apiClient.post<TipoAreaResponse>(BASE, request);
    return response.data;
}

export async function updateTipoArea(
    id: number,
    request: UpdateTipoAreaRequest,
): Promise<TipoAreaResponse> {
    const response = await apiClient.put<TipoAreaResponse>(`${BASE}/${id}`, request);
    return response.data;
}

export async function deleteTipoArea(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}