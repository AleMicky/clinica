import { api } from './axios'
import type { ApiResponse } from '../types/api-response.types'
import type { PagedQuery, PagedResult } from '../types/pagination.types'
import { unwrap } from '../utils/helper'

export async function get<TResponse>(
    url: string
): Promise<TResponse> {
    const { data } = await api.get<ApiResponse<TResponse>>(url)
    return unwrap(data)
}

export async function getPaged<TResponse>(
    url: string,
    query: PagedQuery,
): Promise<PagedResult<TResponse>> {
    const { data } = await api.get<ApiResponse<PagedResult<TResponse>>>(url, {
        params: query,
    })
    return unwrap(data)
}

export async function post<TResponse, TRequest>(
    url: string,
    body: TRequest,
): Promise<TResponse> {
    const { data } = await api.post<ApiResponse<TResponse>>(url, body)
    return unwrap(data)
}

export async function put<TResponse, TRequest>(
    url: string,
    body: TRequest,
): Promise<TResponse> {
    const { data } = await api.put<ApiResponse<TResponse>>(url, body)
    return unwrap(data)
}

export async function del<TResponse>(
    url: string,
): Promise<TResponse> {
    const { data } = await api.delete<ApiResponse<TResponse>>(url)
    return unwrap(data)
}