import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

type UsePagedSearchFiltersOptions = {
    defaultPageSize?: number
    debounceMs?: number
}

export function usePagedSearchFilters(options?: UsePagedSearchFiltersOptions) {
    const defaultPageSize = options?.defaultPageSize ?? DEFAULT_PAGE_SIZE
    const debounceMs = options?.debounceMs ?? SEARCH_DEBOUNCE_MS

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(defaultPageSize)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')

    const onSearchRef = useRef((value: string) => {
        setSearch(value.trim())
        setPage(1)
    })

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, debounceMs)

        return () => window.clearTimeout(timer)
    }, [searchInput, debounceMs])

    const hasActiveFilters = Boolean(search)

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    const handleSearchInputChange = (value: string) => {
        setSearchInput(value)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setPage(1)
    }

    return {
        page,
        pageSize,
        search,
        searchInput,
        hasActiveFilters,
        handleSearch,
        handleSearchInputChange,
        handlePageChange,
        clearFilters,
    }
}
