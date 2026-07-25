import { useState } from 'react'

import type { UnidadMedidaFormValues } from '../schemas/unidades-medida.schema'
import type { UnidadMedida } from '../types/unidades-medida.types'
import {
    useCreateUnidadMedida,
    useDeleteUnidadMedida,
    useUnidadesMedida,
    useUpdateUnidadMedida,
} from './unidades-medida.hooks'
import { useUnidadesMedidaFilters } from './use-unidades-medida-filters'

export function useUnidadesMedidaView() {
    const filters = useUnidadesMedidaFilters()
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<UnidadMedida | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    const caption = `${total} registrado${total === 1 ? '' : 's'}${
        filters.hasActiveFilters ? ' · filtros activos' : ''
    }`

    const openCreateModal = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const openEditModal = (unidad: UnidadMedida) => {
        setEditing(unidad)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditing(null)
    }

    const handleSubmit = async (values: UnidadMedidaFormValues) => {
        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: values })
        } else {
            await createMutation.mutateAsync(values)
        }
        closeModal()
    }

    const handleDelete = async (unidad: UnidadMedida) => {
        setDeletingId(unidad.id)
        try {
            await deleteMutation.mutateAsync(unidad.id)
        } finally {
            setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption,
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
            onEdit: openEditModal,
            onDelete: handleDelete,
            deletingId,
        },
        formModal: {
            open: modalOpen,
            entity: editing,
            isSaving,
            openCreateModal,
            closeModal,
            handleSubmit,
        },
    }
}
