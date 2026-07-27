import { useMemo } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../../shared/utils/crud-search'
import type { LaboratorioExternoFormValues } from '../schemas/laboratorio-externo.schema'
import type { LaboratorioExterno } from '../types/laboratorio-externo.types'
import {
    useCreateLaboratorioExterno,
    useDeleteLaboratorioExterno,
    useLaboratoriosExternos,
    useUpdateLaboratorioExterno,
} from './laboratorios-externos.hooks'

export function useLaboratoriosExternosView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<LaboratorioExterno>()

    const { data, isFetching } = useLaboratoriosExternos({
        page: filters.page,
        pageSize: filters.pageSize,
    })

    const createMutation = useCreateLaboratorioExterno()
    const updateMutation = useUpdateLaboratorioExterno()
    const deleteMutation = useDeleteLaboratorioExterno()

    const items = useMemo(() => {
        const source = data?.items ?? []
        if (!filters.search) return source
        return source.filter((item) =>
            matchesCodigoNombreDescripcion(item, filters.search),
        )
    }, [data?.items, filters.search])

    const total = filters.search ? items.length : (data?.totalRecords ?? 0)
    const isSaving = createMutation.isPending || updateMutation.isPending

    const handleSubmit = async (values: LaboratorioExternoFormValues) => {
        const payload = {
            codigo: values.codigo,
            nombre: values.nombre,
            descripcion: values.descripcion || null,
            contacto: values.contacto || null,
            telefono: values.telefono || null,
            email: values.email || null,
            activo: values.activo,
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

    const handleDelete = async (item: LaboratorioExterno) => {
        modal.setDeletingId(item.id)
        try {
            await deleteMutation.mutateAsync(item.id)
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
