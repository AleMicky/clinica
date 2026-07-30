import { useMemo } from 'react'

import { useCrudModalState } from '../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../shared/utils/crud-search'
import {
    useCreateMetodoPago,
    useDeleteMetodoPago,
    useMetodosPago,
    useUpdateMetodoPago,
} from './caja.hooks'
import type { MetodoPagoFormValues } from '../schemas/metodo-pago.schema'
import type { MetodoPago } from '../types/caja.types'

export function useMetodosPagoView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<MetodoPago>()

    const { data, isFetching } = useMetodosPago()
    const createMutation = useCreateMetodoPago()
    const updateMutation = useUpdateMetodoPago()
    const deleteMutation = useDeleteMetodoPago()

    const filtered = useMemo(() => {
        const source = data ?? []
        if (!filters.search) return source
        return source.filter((item) =>
            matchesCodigoNombreDescripcion(item, filters.search),
        )
    }, [data, filters.search])

    const items = useMemo(() => {
        const start = (filters.page - 1) * filters.pageSize
        return filtered.slice(start, start + filters.pageSize)
    }, [filtered, filters.page, filters.pageSize])

    const total = filtered.length
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: MetodoPagoFormValues) => {
        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                payload: {
                    nombre: values.nombre,
                    requiereReferencia: values.requiereReferencia,
                    esEfectivo: values.esEfectivo,
                },
            })
        } else {
            await createMutation.mutateAsync({
                codigo: values.codigo,
                nombre: values.nombre,
                requiereReferencia: values.requiereReferencia,
                esEfectivo: values.esEfectivo,
            })
        }
        modal.close()
    }

    const handleDelete = async (metodo: MetodoPago) => {
        modal.setDeletingId(metodo.id)
        try {
            await deleteMutation.mutateAsync(metodo.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption: formatRegistrosCaption(total, filters.hasActiveFilters),
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onClearFilters: filters.clearFilters,
        },
        table: {
            metodos: items,
            total,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: modal.openEdit,
            onDelete: handleDelete,
            deletingId: modal.deletingId,
        },
        formDrawer: {
            open: modal.open,
            entity: modal.editing,
            isSaving,
            openCreate: modal.openCreate,
            closeDrawer: () => modal.close(isSaving),
            handleSubmit,
        },
    }
}
