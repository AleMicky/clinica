import { useMemo } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../../shared/utils/crud-search'
import type { TipoAreaFormValues } from '../schemas/tipo-area.schema'
import type { TipoArea } from '../types/tipo-area.types'
import {
    useCreateTipoArea,
    useDeleteTipoArea,
    useTiposArea,
    useUpdateTipoArea,
} from './tipos-area.hooks'

export function useTiposAreaView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<TipoArea>()

    const { data, isFetching } = useTiposArea({
        page: filters.page,
        pageSize: filters.pageSize,
    })

    const createMutation = useCreateTipoArea()
    const updateMutation = useUpdateTipoArea()
    const deleteMutation = useDeleteTipoArea()

    const items = useMemo(() => {
        const source = data?.items ?? []
        if (!filters.search) return source
        return source.filter((item) =>
            matchesCodigoNombreDescripcion(item, filters.search),
        )
    }, [data?.items, filters.search])

    const total = filters.search ? items.length : (data?.totalRecords ?? 0)
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: TipoAreaFormValues) => {
        const payload = {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || '',
            orden: values.orden,
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

    const handleDelete = async (tipoArea: TipoArea) => {
        modal.setDeletingId(tipoArea.id)
        try {
            await deleteMutation.mutateAsync(tipoArea.id)
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
