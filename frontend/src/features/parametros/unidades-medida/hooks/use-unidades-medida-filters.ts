import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export function useUnidadesMedidaFilters() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
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
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

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
