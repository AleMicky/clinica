import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export function useMedicosFilters() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [especialidadFilter, setEspecialidadFilter] = useState<string | undefined>()

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

    const hasActiveFilters = Boolean(search || especialidadFilter)

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    const handleSearchInputChange = (value: string) => {
        setSearchInput(value)
    }

    const handleEspecialidadFilterChange = (value: string | undefined) => {
        setEspecialidadFilter(value)
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setEspecialidadFilter(undefined)
        setPage(1)
    }

    return {
        page,
        pageSize,
        search,
        searchInput,
        especialidadFilter,
        hasActiveFilters,
        handleSearch,
        handleSearchInputChange,
        handleEspecialidadFilterChange,
        handlePageChange,
        clearFilters,
    }
}
