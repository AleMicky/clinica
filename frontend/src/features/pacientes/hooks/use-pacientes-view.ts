import { useState } from 'react'

import {
    toCreatePacientePayload,
    toUpdatePacientePayload,
    type PacienteFormValues,
} from '../schemas/paciente.schema'
import type { Paciente } from '../types/paciente.types'
import {
    useCreatePaciente,
    useDeletePaciente,
    usePacientes,
    useUpdatePaciente,
} from './pacientes.hooks'
import { usePacientesFilters } from './use-pacientes-filters'

export function usePacientesView() {
    const filters = usePacientesFilters()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
    const [viewingPaciente, setViewingPaciente] = useState<Paciente | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = usePacientes({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
    })

    const createPaciente = useCreatePaciente()
    const updatePaciente = useUpdatePaciente()
    const deletePaciente = useDeletePaciente()

    const pacientes = data?.items ?? []
    const totalPacientes = data?.totalRecords ?? 0
    const isSaving = createPaciente.isPending || updatePaciente.isPending

    const caption = `${totalPacientes} paciente${totalPacientes === 1 ? '' : 's'}${
        filters.hasActiveFilters ? ' · filtros activos' : ''
    }`

    const openCreateModal = () => {
        setEditingPaciente(null)
        setModalOpen(true)
    }

    const openEditModal = (paciente: Paciente) => {
        setEditingPaciente(paciente)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingPaciente(null)
    }

    const handleSubmit = async (values: PacienteFormValues) => {
        if (editingPaciente) {
            await updatePaciente.mutateAsync({
                id: editingPaciente.id,
                data: toUpdatePacientePayload(
                    values,
                    editingPaciente.personaId,
                    editingPaciente.numeroHistoriaClinica,
                ),
            })
        } else {
            await createPaciente.mutateAsync(toCreatePacientePayload(values))
        }

        closeModal()
    }

    const handleDelete = async (paciente: Paciente) => {
        setDeletingId(paciente.id)

        try {
            await deletePaciente.mutateAsync(paciente.id)
        } finally {
            setDeletingId(null)
        }
    }

    const openFicha = (paciente: Paciente) => {
        setViewingPaciente(paciente)
    }

    const closeFicha = () => {
        setViewingPaciente(null)
    }

    const editFromFicha = () => {
        if (!viewingPaciente) return
        setViewingPaciente(null)
        openEditModal(viewingPaciente)
    }

    return {
        loading: isFetching,
        caption,
        totalPacientes,
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
        },
        table: {
            pacientes,
            total: totalPacientes,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: openEditModal,
            onViewFicha: openFicha,
            onDelete: handleDelete,
            onCreate: openCreateModal,
            deletingId,
            hasActiveFilters: filters.hasActiveFilters,
        },
        formModal: {
            open: modalOpen,
            paciente: editingPaciente,
            isSaving,
            openCreateModal,
            closeModal,
            handleSubmit,
        },
        fichaModal: {
            paciente: viewingPaciente,
            close: closeFicha,
            edit: editFromFicha,
        },
    }
}
