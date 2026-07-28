import { useState } from 'react'

import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import { formatRegistrosCaption } from '../../../shared/utils/crud-search'
import {
    toUpdatePersonaPayload,
    type PersonaFormValues,
} from '../schemas/persona.schema'
import type { Persona } from '../types/persona.types'
import { usePersonas, useUpdatePersona } from './personas.hooks'

export function usePersonasView() {
    const filters = usePagedSearchFilters()
    const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const { data, isFetching } = usePersonas({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
    })

    const updatePersona = useUpdatePersona()

    const personas = data?.items ?? []
    const totalPersonas = data?.totalRecords ?? 0
    const isSaving = updatePersona.isPending

    const openEdit = (persona: Persona) => {
        setEditingPersona(persona)
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        if (isSaving) return
        setDrawerOpen(false)
        setEditingPersona(null)
    }

    const handleSubmit = async (values: PersonaFormValues) => {
        if (!editingPersona) return

        await updatePersona.mutateAsync({
            id: editingPersona.id,
            data: toUpdatePersonaPayload(values),
        })

        setDrawerOpen(false)
        setEditingPersona(null)
    }

    return {
        loading: isFetching,
        caption: formatRegistrosCaption(totalPersonas, filters.hasActiveFilters),
        totalPersonas,
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onClearFilters: filters.clearFilters,
        },
        table: {
            personas,
            total: totalPersonas,
            page: filters.page,
            pageSize: filters.pageSize,
            onPageChange: filters.handlePageChange,
            onEdit: openEdit,
        },
        formDrawer: {
            open: drawerOpen,
            persona: editingPersona,
            isSaving,
            closeDrawer,
            handleSubmit,
        },
    }
}
