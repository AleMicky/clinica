import { useState } from 'react'

import { useEspecialidades } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import {
    toCreateMedicoPayload,
    toUpdateMedicoPayload,
    type MedicoFormValues,
} from '../schemas/medico.schema'
import type { Medico } from '../types/medico.types'
import {
    useCreateMedico,
    useDeleteMedico,
    useMedicos,
    useUpdateMedico,
} from './medicos.hooks'
import { useMedicosFilters } from './use-medicos-filters'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function useMedicosView() {
    const filters = useMedicosFilters()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingMedico, setEditingMedico] = useState<Medico | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: especialidadesResult } = useEspecialidades(LOOKUP_QUERY)

    const { data, isFetching } = useMedicos({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        especialidadId: filters.especialidadFilter,
    })

    const createMedico = useCreateMedico()
    const updateMedico = useUpdateMedico()
    const deleteMedico = useDeleteMedico()

    const medicos = data?.items ?? []
    const totalMedicos = data?.totalRecords ?? 0
    const isSaving = createMedico.isPending || updateMedico.isPending

    const especialidadOptions =
        especialidadesResult?.items.map((especialidad) => ({
            label: especialidad.nombre,
            value: especialidad.id,
        })) ?? []

    const caption = `${totalMedicos} registrado${totalMedicos === 1 ? '' : 's'}${
        filters.hasActiveFilters ? ' · filtros activos' : ''
    }`

    const openCreateModal = () => {
        setEditingMedico(null)
        setModalOpen(true)
    }

    const openEditModal = (medico: Medico) => {
        setEditingMedico(medico)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingMedico(null)
    }

    const handleSubmit = async (values: MedicoFormValues) => {
        if (editingMedico) {
            await updateMedico.mutateAsync({
                id: editingMedico.id,
                data: toUpdateMedicoPayload(values),
            })
        } else {
            await createMedico.mutateAsync(toCreateMedicoPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (medico: Medico) => {
        setDeletingId(medico.id)

        try {
            await deleteMedico.mutateAsync(medico.id)
        } finally {
            setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption,
        especialidadOptions,
        filters: {
            searchInput: filters.searchInput,
            especialidadFilter: filters.especialidadFilter,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onEspecialidadFilterChange: filters.handleEspecialidadFilterChange,
            onClearFilters: filters.clearFilters,
        },
        table: {
            medicos,
            total: totalMedicos,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: openEditModal,
            onDelete: handleDelete,
            deletingId,
        },
        formModal: {
            open: modalOpen,
            medico: editingMedico,
            isSaving,
            openCreateModal,
            closeModal,
            handleSubmit,
        },
    }
}
