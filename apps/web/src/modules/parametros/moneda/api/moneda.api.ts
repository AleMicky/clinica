import { apiClient } from "@/lib/api/api-client";
import type {
    CreateMonedaRequest,
    CreateTipoCambioRequest,
    MonedaQueryParams,
    MonedaResponse,
    PagedResult,
    TipoCambioQueryParams,
    TipoCambioResponse,
    UpdateMonedaRequest,
    UpdateTipoCambioRequest,
} from "../types/moneda.types";


export async function getMonedas(
    params?: MonedaQueryParams
): Promise<PagedResult<MonedaResponse>> {
    const response = await apiClient.get<PagedResult<MonedaResponse>>("/monedas", {
        params,
    });
    return response.data;
}

export async function getMonedaById(id: number): Promise<MonedaResponse> {
    const response = await apiClient.get<MonedaResponse>(`/monedas/${id}`);
    return response.data;
}

export async function createMoneda(
    request: CreateMonedaRequest
): Promise<MonedaResponse> {
    const response = await apiClient.post<MonedaResponse>("/monedas", request);
    return response.data;
}

export async function updateMoneda(
    id: number,
    request: UpdateMonedaRequest
): Promise<MonedaResponse> {
    const response = await apiClient.put<MonedaResponse>(`/monedas/${id}`, request);
    return response.data;
}

export async function deleteMoneda(id: number): Promise<void> {
    await apiClient.delete(`/monedas/${id}`);
}


export async function getTiposCambio(
    params?: TipoCambioQueryParams
): Promise<PagedResult<TipoCambioResponse>> {
    const response = await apiClient.get<PagedResult<TipoCambioResponse>>(
        "/tipos-cambio",
        { params }
    );
    return response.data;
}

export async function getTipoCambioById(id: number): Promise<TipoCambioResponse> {
    const response = await apiClient.get<TipoCambioResponse>(`/tipos-cambio/${id}`);
    return response.data;
}

export async function createTipoCambio(
    request: CreateTipoCambioRequest
): Promise<TipoCambioResponse> {
    const response = await apiClient.post<TipoCambioResponse>(
        "/tipos-cambio",
        request
    );
    return response.data;
}

export async function updateTipoCambio(
    id: number,
    request: UpdateTipoCambioRequest
): Promise<TipoCambioResponse> {
    const response = await apiClient.put<TipoCambioResponse>(
        `/tipos-cambio/${id}`,
        request
    );
    return response.data;
}

export async function deleteTipoCambio(id: number): Promise<void> {
    await apiClient.delete(`/tipos-cambio/${id}`);
}
