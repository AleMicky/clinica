import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

export function usePacientesFilters() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [hcFilterInput, setHcFilterInput] = useState('')
    const [docFilterInput, setDocFilterInput] = useState('')
    const [hcFilter, setHcFilter] = useState('')
    const [docFilter, setDocFilter] = useState('')

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
            onSearchRef.current(searchInput)
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        const next = hcFilterInput.trim()
        const timer = window.setTimeout(() => {
            if (next === hcFilter) return
            setHcFilter(next)
            setPage(1)
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [hcFilterInput, hcFilter])

    useEffect(() => {
        const next = docFilterInput.trim()
        const timer = window.setTimeout(() => {
            if (next === docFilter) return
            setDocFilter(next)
            setPage(1)
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [docFilterInput, docFilter])

    const hasActiveFilters = Boolean(search || hcFilter || docFilter)

    const handleSearch = (value: string) => {
        setSearchInput(value)
        setSearch(value.trim())
        setPage(1)
    }

    const handleSearchInputChange = (value: string) => {
        setSearchInput(value)
    }

    const handleHcFilterInputChange = (value: string) => {
        setHcFilterInput(value)
    }

    const handleDocFilterInputChange = (value: string) => {
        setDocFilterInput(value)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setHcFilterInput('')
        setDocFilterInput('')
        setHcFilter('')
        setDocFilter('')
        setPage(1)
    }

    return {
        page,
        pageSize,
        search,
        searchInput,
        hcFilterInput,
        docFilterInput,
        hcFilter,
        docFilter,
        hasActiveFilters,
        handleSearch,
        handleSearchInputChange,
        handleHcFilterInputChange,
        handleDocFilterInputChange,
        handlePageChange,
        clearFilters,
    }
}
