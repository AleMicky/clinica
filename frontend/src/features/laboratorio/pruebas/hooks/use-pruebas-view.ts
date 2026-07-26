import { useMemo } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import type { PruebaFormValues } from '../schemas/prueba.schema'
import type { Prueba } from '../types/prueba.types'
import {
    useCreatePrueba,
    useDeletePrueba,
    usePruebas,
    useUpdatePrueba,
} from './pruebas.hooks'

function matchesPruebaSearch(item: Prueba, search: string) {
    const term = search.trim().toLowerCase()
    if (!term) return true

    return (
        item.codigo.toLowerCase().includes(term) ||
        item.nombre.toLowerCase().includes(term) ||
        item.especialidadNombre.toLowerCase().includes(term) ||
        item.tipoExamenNombre.toLowerCase().includes(term) ||
        item.tipoMuestraNombre.toLowerCase().includes(term)
    )
}

export function usePruebasView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<Prueba>()

    const { data, isFetching } = usePruebas({
        page: filters.page,
        pageSize: filters.pageSize,
    })

    const createMutation = useCreatePrueba()
    const updateMutation = useUpdatePrueba()
    const deleteMutation = useDeletePrueba()

    const items = useMemo(() => {
        const source = data?.items ?? []
        if (!filters.search) return source
        return source.filter((item) => matchesPruebaSearch(item, filters.search))
    }, [data?.items, filters.search])

    const total = filters.search ? items.length : (data?.totalRecords ?? 0)
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: PruebaFormValues) => {
        const payload = {
            codigo: values.codigo,
            nombre: values.nombre,
            especialidadId: values.especialidadId,
            tipoExamenId: values.tipoExamenId,
            tipoMuestraId: values.tipoMuestraId,
            requiereAyuno: values.requiereAyuno,
            horasAyuno: values.requiereAyuno ? values.horasAyuno : 0,
            esDerivable: values.esDerivable,
        }

        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                data: payload,
            })
        } else {
            await createMutation.mutateAsync(payload)
        }
        modal.close()
    }

    const handleDelete = async (prueba: Prueba) => {
        modal.setDeletingId(prueba.id)
        try {
            await deleteMutation.mutateAsync(prueba.id)
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
            items,
            total,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: modal.openEdit,
            onDelete: handleDelete,
            deletingId: modal.deletingId,
        },
        formModal: {
            open: modal.open,
            entity: modal.editing,
            isSaving,
            openCreateModal: modal.openCreate,
            closeModal: () => modal.close(isSaving),
            handleSubmit,
        },
    }
}
