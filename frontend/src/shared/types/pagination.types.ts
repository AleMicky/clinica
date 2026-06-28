export type PagedQuery = {
    page?: number
    pageSize?: number
    search?: string
}

export type PagedResult<T> = {
    items: T[]
    totalRecords: number
    page: number
    pageSize: number
    totalPages: number
    hasPreviousPage?: boolean
    hasNextPage?: boolean
}
