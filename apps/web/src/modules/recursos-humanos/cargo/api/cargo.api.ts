import { apiClient } from "@/lib/api/api-client";
import type {
    CargoQueryParams,
    CargoResponse,
    CreateCargoRequest,
    PagedResult,
    UpdateCargoRequest,
} from "../types/cargo.types";

const BASE = "/cargos";

export async function getCargos(
    params?: CargoQueryParams,
): Promise<PagedResult<CargoResponse>> {
    const response = await apiClient.get<PagedResult<CargoResponse>>(BASE, {
        params,
    });
    return response.data;
}

export async function getCargoById(
    id: number,
): Promise<CargoResponse> {
    const response = await apiClient.get<CargoResponse>(`${BASE}/${id}`);
    return response.data;
}

export async function createCargo(
    request: CreateCargoRequest,
): Promise<CargoResponse> {
    const response = await apiClient.post<CargoResponse>(BASE, request);
    return response.data;
}

export async function updateCargo(
    id: number,
    request: UpdateCargoRequest,
): Promise<CargoResponse> {
    const response = await apiClient.put<CargoResponse>(`${BASE}/${id}`, request);
    return response.data;
}

export async function deleteCargo(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}