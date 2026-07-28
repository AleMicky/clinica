import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../../shared/utils/crud-search'
import type { UnidadMedidaFormValues } from '../schemas/unidades-medida.schema'
import type { UnidadMedida } from '../types/unidades-medida.types'
import {
    useCreateUnidadMedida,
    useDeleteUnidadMedida,
    useUnidadesMedida,
    useUpdateUnidadMedida,
} from './unidades-medida.hooks'

export function useUnidadesMedidaView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<UnidadMedida>()

    const { data, isFetching } = useUnidadesMedida({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
    })

    const createMutation = useCreateUnidadMedida()
    const updateMutation = useUpdateUnidadMedida()
    const deleteMutation = useDeleteUnidadMedida()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: UnidadMedidaFormValues) => {
        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                data: values,
            })
        } else {
            await createMutation.mutateAsync(values)
        }
        modal.close()
    }

    const handleDelete = async (unidad: UnidadMedida) => {
        modal.setDeletingId(unidad.id)
        try {
            await deleteMutation.mutateAsync(unidad.id)
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
