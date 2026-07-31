import { useMemo, useState } from 'react'

import { useCrudModalState } from '../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../shared/utils/crud-search'
import {
    useConceptosCaja,
    useCreateConceptoCaja,
    useDeleteConceptoCaja,
    useUpdateConceptoCaja,
} from './caja.hooks'
import type { ConceptoCajaFormValues } from '../schemas/concepto-caja.schema'
import type { ConceptoCaja } from '../types/caja.types'

export function useConceptosCajaView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<ConceptoCaja>()
    const [activoFilter, setActivoFilter] = useState<boolean | undefined>(undefined)
    const [tipoFilter, setTipoFilter] = useState<string | undefined>(undefined)

    const { data, isFetching } = useConceptosCaja()
    const createMutation = useCreateConceptoCaja()
    const updateMutation = useUpdateConceptoCaja()
    const deleteMutation = useDeleteConceptoCaja()

    const filtered = useMemo(() => {
        let source = data ?? []

        if (filters.search) {
            source = source.filter((item) =>
                matchesCodigoNombreDescripcion(item, filters.search),
            )
        }

        if (activoFilter !== undefined) {
            source = source.filter((item) => item.activo === activoFilter)
        }

        if (tipoFilter) {
            source = source.filter((item) => item.tipoMovimiento === tipoFilter)
        }

        return source
    }, [data, filters.search, activoFilter, tipoFilter])

    const items = useMemo(() => {
        const start = (filters.page - 1) * filters.pageSize
        return filtered.slice(start, start + filters.pageSize)
    }, [filtered, filters.page, filters.pageSize])

    const total = filtered.length
    const isSaving = createMutation.isPending || updateMutation.isPending
    const hasActiveFilters =
        filters.hasActiveFilters || activoFilter !== undefined || tipoFilter !== undefined

    const handleSubmit = async (values: ConceptoCajaFormValues) => {
        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                payload: {
                    nombre: values.nombre,
                    tipoMovimiento: values.tipoMovimiento,
                    activo: values.activo,
                },
            })
        } else {
            await createMutation.mutateAsync({
                codigo: values.codigo,
                nombre: values.nombre,
                tipoMovimiento: values.tipoMovimiento,
                activo: values.activo,
            })
        }
        modal.close()
    }

    const handleDelete = async (concepto: ConceptoCaja) => {
        modal.setDeletingId(concepto.id)
        try {
            await deleteMutation.mutateAsync(concepto.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    const clearFilters = () => {
        filters.clearFilters()
        setActivoFilter(undefined)
        setTipoFilter(undefined)
    }

    return {
        loading: isFetching,
        caption: formatRegistrosCaption(total, hasActiveFilters),
        filters: {
            searchInput: filters.searchInput,
            activoFilter,
            tipoFilter,
            hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onActivoFilterChange: (value: boolean | undefined) => {
                setActivoFilter(value)
                filters.handlePageChange(1, filters.pageSize)
            },
            onTipoFilterChange: (value: string | undefined) => {
                setTipoFilter(value)
                filters.handlePageChange(1, filters.pageSize)
            },
            onClearFilters: clearFilters,
        },
        table: {
            conceptos: items,
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
