import { get, post, put, del } from '../api/http'

export type EntityId = number | string

export type CrudEndpoints = {
    root: string
    byId: (id: EntityId) => string
}

export function createCrudService<
    TResponse,
    TCreate,
    TUpdate = TCreate,
>(endpoints: CrudEndpoints) {
    return {
        getAll: () => get<TResponse[]>(endpoints.root),
        getById: (id: EntityId) => get<TResponse>(endpoints.byId(id)),
        create: (data: TCreate) => post<TResponse, TCreate>(
            endpoints.root,
            data),
        update: (id: EntityId, data: TUpdate) => put<TResponse, TUpdate>(
            endpoints.byId(id),
            data,
        ),
        delete: (id: EntityId) => del<void>(endpoints.byId(id)),
    }

}