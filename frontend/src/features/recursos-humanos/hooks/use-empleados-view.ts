import { useState } from 'react'

import {
    useAreaDepartamentos,
    useAreas,
} from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import {
    toCreateEmpleadoPayload,
    toUpdateEmpleadoPayload,
    type EmpleadoFormValues,
} from '../schemas/empleado.schema'
import type { Empleado } from '../types/empleado.types'
import {
    useCreateEmpleado,
    useDeleteEmpleado,
    useEmpleados,
    useUpdateEmpleado,
} from './empleados.hooks'
import { useEmpleadosFilters } from './use-empleados-filters'

const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function useEmpleadosView() {
    const filters = useEmpleadosFilters()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: areasResult } = useAreas(LOOKUP_QUERY)
    const { data: departamentosResult } = useAreaDepartamentos(filters.areaFilter ?? null)

    const { data, isFetching } = useEmpleados({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        areaId: filters.areaFilter,
        departamentoId: filters.departamentoFilter,
    })

    const createEmpleado = useCreateEmpleado()
    const updateEmpleado = useUpdateEmpleado()
    const deleteEmpleado = useDeleteEmpleado()

    const empleados = data?.items ?? []
    const totalEmpleados = data?.totalRecords ?? 0
    const isSaving = createEmpleado.isPending || updateEmpleado.isPending

    const areaOptions =
        areasResult?.items.map((area) => ({
            label: area.nombre,
            value: area.id,
        })) ?? []

    const departamentoOptions = (departamentosResult ?? []).map((departamento) => ({
        label: departamento.nombre,
        value: departamento.id,
    }))

    const caption = `${totalEmpleados} registrado${totalEmpleados === 1 ? '' : 's'}${
        filters.hasActiveFilters ? ' · filtros activos' : ''
    }`

    const openCreateModal = () => {
        setEditingEmpleado(null)
        setModalOpen(true)
    }

    const openEditModal = (empleado: Empleado) => {
        setEditingEmpleado(empleado)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingEmpleado(null)
    }

    const handleSubmit = async (values: EmpleadoFormValues) => {
        if (editingEmpleado) {
            await updateEmpleado.mutateAsync({
                id: editingEmpleado.id,
                data: toUpdateEmpleadoPayload(values),
            })
        } else {
            await createEmpleado.mutateAsync(toCreateEmpleadoPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (empleado: Empleado) => {
        setDeletingId(empleado.id)

        try {
            await deleteEmpleado.mutateAsync(empleado.id)
        } finally {
            setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption,
        areaOptions,
        departamentoOptions,
        filters: {
            searchInput: filters.searchInput,
            areaFilter: filters.areaFilter,
            departamentoFilter: filters.departamentoFilter,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onAreaFilterChange: filters.handleAreaFilterChange,
            onDepartamentoFilterChange: filters.handleDepartamentoFilterChange,
            onClearFilters: filters.clearFilters,
        },
        table: {
            empleados,
            total: totalEmpleados,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: openEditModal,
            onDelete: handleDelete,
            deletingId,
        },
        formModal: {
            open: modalOpen,
            empleado: editingEmpleado,
            isSaving,
            openCreateModal,
            closeModal,
            handleSubmit,
        },
    }
}
