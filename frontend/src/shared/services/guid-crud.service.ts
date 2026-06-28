import { del, get, getPaged, post, put } from '../api/http'
import type { PagedQuery, PagedResult } from '../types/pagination.types'

export function createGuidCrudService<
    TResponse,
    TCreate,
    TUpdate = TCreate,
>(root: string) {
    return {
        getPaged(query: PagedQuery & Record<string, unknown>) {
            return getPaged<TResponse>(root, query)
        },

        getById(id: string) {
            return get<TResponse>(`${root}/${id}`)
        },

        create(data: TCreate) {
            return post<TResponse, TCreate>(root, data)
        },

        update(id: string, data: TUpdate) {
            return put<TResponse, TUpdate>(`${root}/${id}`, data)
        },

        delete(id: string) {
            return del<void>(`${root}/${id}`)
        },
    }
}

export type GuidCrudService<
    TResponse,
    TCreate,
    TUpdate = TCreate,
> = {
    getPaged: (
        query: PagedQuery & Record<string, unknown>,
    ) => Promise<PagedResult<TResponse>>
    getById: (id: string) => Promise<TResponse>
    create: (data: TCreate) => Promise<TResponse>
    update: (id: string, data: TUpdate) => Promise<TResponse>
    delete: (id: string) => Promise<void>
}
