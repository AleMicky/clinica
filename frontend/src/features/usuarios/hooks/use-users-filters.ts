import { useCallback, useEffect, useRef, useState } from 'react'

export type StatusFilter = 'all' | 'activo' | 'inactivo'

const SEARCH_DEBOUNCE_MS = 400

export function useUsersFilters() {
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [page, setPage] = useState(1)

    const onSearchRef = useRef<(value: string) => void>(() => undefined)

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    const hasActiveFilters = Boolean(roleFilter) || statusFilter !== 'all'

    const handleSearch = useCallback((value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }, [])

    const handleSearchInputChange = useCallback((value: string) => {
        setSearchInput(value)
    }, [])

    const handleRoleFilterChange = useCallback((value: string | null) => {
        setRoleFilter(value)
        setPage(1)
    }, [])

    const handleStatusFilterChange = useCallback((value: StatusFilter) => {
        setStatusFilter(value)
        setPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setRoleFilter(null)
        setStatusFilter('all')
        setPage(1)
    }, [])

    return {
        search,
        searchInput,
        roleFilter,
        statusFilter,
        page,
        setPage,
        hasActiveFilters,
        handleSearch,
        handleSearchInputChange,
        handleRoleFilterChange,
        handleStatusFilterChange,
        clearFilters,
    }
}
