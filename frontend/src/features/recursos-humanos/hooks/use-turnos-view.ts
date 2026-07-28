import { useCrudModalState } from '../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../shared/utils/crud-search'
import { toTurnoPayload, type TurnoFormValues } from '../schemas/turno.schema'
import type { Turno } from '../types/turnos.types'
import {
    useCreateTurno,
    useDeleteTurno,
    useTurnos,
    useUpdateTurno,
} from './turnos.hooks'

export function useTurnosView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<Turno>()

    const { data, isFetching } = useTurnos({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
    })

    const createMutation = useCreateTurno()
    const updateMutation = useUpdateTurno()
    const deleteMutation = useDeleteTurno()

    const items = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: TurnoFormValues) => {
        const payload = toTurnoPayload(values)

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

    const handleDelete = async (turno: Turno) => {
        modal.setDeletingId(turno.id)
        try {
            await deleteMutation.mutateAsync(turno.id)
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
