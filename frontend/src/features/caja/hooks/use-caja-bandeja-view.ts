import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import { useAnularCuenta, useCuentas } from './caja.hooks'
import type { CuentaListItem } from '../types/caja.types'

export function useCajaBandejaView() {
    const navigate = useNavigate()
    const filters = usePagedSearchFilters({ defaultPageSize: 10 })
    const [estadoFilter, setEstadoFilter] = useState<string | undefined>('ABIERTA')

    const query = {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        estado: estadoFilter && estadoFilter !== 'TODAS' ? estadoFilter : undefined,
    }

    const { data, isFetching } = useCuentas(query)
    const anularMutation = useAnularCuenta()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0

    return {
        loading: isFetching,
        caption:
            estadoFilter === 'ABIERTA'
                ? `${total} cuentas abiertas`
                : `${total} cuentas`,
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onClearFilters: filters.clearFilters,
            onPageChange: filters.handlePageChange,
            pageSize: filters.pageSize,
            estadoFilter,
            setEstadoFilter,
        },
        table: {
            items,
            total,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onOpen: (cuenta: CuentaListItem) => {
                void navigate({
                    to: '/caja/cuentas/$cuentaId',
                    params: { cuentaId: cuenta.id },
                })
            },
            onAnular: async (cuenta: CuentaListItem) => {
                await anularMutation.mutateAsync(cuenta.id)
            },
            deletingId: anularMutation.isPending
                ? (anularMutation.variables as string | undefined) ?? null
                : null,
        },
    }
}
