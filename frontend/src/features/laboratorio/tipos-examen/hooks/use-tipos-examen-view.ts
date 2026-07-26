import { useMemo } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../../shared/utils/crud-search'
import type { TipoExamenFormValues } from '../schemas/tipo-examen.schema'
import type { TipoExamen } from '../types/tipo-examen.types'
import {
    useCreateTipoExamen,
    useDeleteTipoExamen,
    useTiposExamen,
    useUpdateTipoExamen,
} from './tipos-examen.hooks'

export function useTiposExamenView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<TipoExamen>()

    const { data, isFetching } = useTiposExamen({
        page: filters.page,
        pageSize: filters.pageSize,
    })

    const createMutation = useCreateTipoExamen()
    const updateMutation = useUpdateTipoExamen()
    const deleteMutation = useDeleteTipoExamen()

    const items = useMemo(() => {
        const source = data?.items ?? []
        if (!filters.search) return source
        return source.filter((item) =>
            matchesCodigoNombreDescripcion(item, filters.search),
        )
    }, [data?.items, filters.search])

    const total = filters.search ? items.length : (data?.totalRecords ?? 0)
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: TipoExamenFormValues) => {
        const payload = {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || '',
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

    const handleDelete = async (tipo: TipoExamen) => {
        modal.setDeletingId(tipo.id)
        try {
            await deleteMutation.mutateAsync(tipo.id)
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
