import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export function useEmpleadosFilters() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [areaFilter, setAreaFilter] = useState<string | undefined>()
    const [departamentoFilter, setDepartamentoFilter] = useState<string | undefined>()

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
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    const hasActiveFilters = Boolean(search || areaFilter || departamentoFilter)

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    const handleSearchInputChange = (value: string) => {
        setSearchInput(value)
    }

    const handleAreaFilterChange = (value: string | undefined) => {
        setAreaFilter(value)
        setDepartamentoFilter(undefined)
        setPage(1)
    }

    const handleDepartamentoFilterChange = (value: string | undefined) => {
        setDepartamentoFilter(value)
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setAreaFilter(undefined)
        setDepartamentoFilter(undefined)
        setPage(1)
    }

    return {
        page,
        pageSize,
        search,
        searchInput,
        areaFilter,
        departamentoFilter,
        hasActiveFilters,
        handleSearch,
        handleSearchInputChange,
        handleAreaFilterChange,
        handleDepartamentoFilterChange,
        handlePageChange,
        clearFilters,
    }
}
