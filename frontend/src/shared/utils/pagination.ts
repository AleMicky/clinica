import type { PagedQuery, PagedResult } from '../types/pagination.types'

export function paginateList<T>(
    items: T[],
    query: PagedQuery,
    filterFn?: (item: T, search: string) => boolean,
): PagedResult<T> {
    const page = Math.max(1, query.page ?? 1)
    const pageSize = Math.max(1, query.pageSize ?? 10)
    const search = query.search?.trim().toLowerCase()

    const filtered =
        search && filterFn
            ? items.filter((item) => filterFn(item, search))
            : items

    const totalRecords = filtered.length
    const totalPages =
        pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 0
    const start = (page - 1) * pageSize

    return {
        items: filtered.slice(start, start + pageSize),
        totalRecords,
        page,
        pageSize,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
    }
}
