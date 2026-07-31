import { useState } from 'react'

import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import { useAnularPago, usePago, usePagos } from './caja.hooks'
import type { AnularPagoPayload, PagoListItem } from '../types/caja.types'

export function usePagosView() {
    const filters = usePagedSearchFilters({ defaultPageSize: 10 })
    const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
    const [detailPagoId, setDetailPagoId] = useState<string | null>(null)
    const [anularPago, setAnularPago] = useState<PagoListItem | null>(null)

    const query = {
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        estado: estadoFilter || undefined,
    }

    const { data, isFetching } = usePagos(query)
    const { data: pagoDetalle, isFetching: detailLoading } = usePago(detailPagoId ?? undefined)
    const anularMutation = useAnularPago()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0

    const hasExtraFilters = Boolean(estadoFilter)

    return {
        loading: isFetching,
        caption: `${total} pago${total === 1 ? '' : 's'}`,
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters || hasExtraFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onClearFilters: () => {
                filters.clearFilters()
                setEstadoFilter(undefined)
            },
            onPageChange: filters.handlePageChange,
            pageSize: filters.pageSize,
            estadoFilter,
            setEstadoFilter: (value: string | undefined) => {
                setEstadoFilter(value)
                filters.handlePageChange(1, filters.pageSize)
            },
        },
        table: {
            items,
            total,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onOpen: (pago: PagoListItem) => setDetailPagoId(pago.id),
            onAnular: (pago: PagoListItem) => setAnularPago(pago),
            onRecibo: (pago: PagoListItem) => setDetailPagoId(pago.id),
            anulatingId: anularMutation.isPending
                ? (anularMutation.variables?.id ?? null)
                : null,
        },
        detailDrawer: {
            open: Boolean(detailPagoId),
            pago: pagoDetalle,
            loading: detailLoading,
            onClose: () => setDetailPagoId(null),
            onAnular: () => {
                if (!pagoDetalle) return
                setAnularPago({
                    id: pagoDetalle.id,
                    numero: pagoDetalle.numero,
                    pacienteId: pagoDetalle.pacienteId,
                    cuentaId: pagoDetalle.cuentaId,
                    turnoCajaId: pagoDetalle.turnoCajaId,
                    fechaPago: pagoDetalle.fechaPago,
                    monto: pagoDetalle.monto,
                    estado: pagoDetalle.estado,
                    observaciones: pagoDetalle.observaciones,
                })
            },
        },
        anularDrawer: {
            open: Boolean(anularPago),
            pago: anularPago,
            loading: anularMutation.isPending,
            onClose: () => setAnularPago(null),
            onSubmit: async (payload: AnularPagoPayload) => {
                if (!anularPago) return
                await anularMutation.mutateAsync({ id: anularPago.id, payload })
                setAnularPago(null)
                setDetailPagoId(null)
            },
        },
    }
}
