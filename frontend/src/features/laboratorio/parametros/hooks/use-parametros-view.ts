import { useMemo, useState } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import { usePagedSearchFilters } from '../../../../shared/hooks/use-paged-search-filters'
import {
    formatRegistrosCaption,
    matchesCodigoNombreDescripcion,
} from '../../../../shared/utils/crud-search'
import { usePruebas } from '../../pruebas/hooks/pruebas.hooks'
import type { ParametroFormValues } from '../schemas/parametro.schema'
import type { Parametro } from '../types/parametro.types'
import {
    useCreateParametro,
    useDeleteParametro,
    useParametros,
    useUpdateParametro,
} from './parametros.hooks'

const PRUEBAS_LOOKUP_QUERY = { page: 1, pageSize: 200 } as const

export function useParametrosView() {
    const filters = usePagedSearchFilters()
    const modal = useCrudModalState<Parametro>()
    const [pruebaId, setPruebaId] = useState<string | undefined>(undefined)

    const { data: pruebasResult } = usePruebas(PRUEBAS_LOOKUP_QUERY)

    const { data, isFetching } = useParametros({
        page: filters.page,
        pageSize: filters.pageSize,
        pruebaId,
    })

    const createMutation = useCreateParametro()
    const updateMutation = useUpdateParametro()
    const deleteMutation = useDeleteParametro()

    const items = useMemo(() => {
        const source = data?.items ?? []
        if (!filters.search) return source
        return source.filter((item) =>
            matchesCodigoNombreDescripcion(
                { codigo: item.codigo, nombre: item.nombre },
                filters.search,
            ),
        )
    }, [data?.items, filters.search])

    const total = filters.search ? items.length : (data?.totalRecords ?? 0)
    const isSaving = createMutation.isPending || updateMutation.isPending

    const pruebaOptions = useMemo(
        () =>
            (pruebasResult?.items ?? []).map((item) => ({
                label: `${item.codigo} — ${item.nombre}`,
                value: item.id,
            })),
        [pruebasResult?.items],
    )

    const handleFilterPrueba = (value: string | undefined) => {
        setPruebaId(value)
        filters.handlePageChange(1, filters.pageSize)
    }

    const handleSubmit = async (values: ParametroFormValues) => {
        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                data: {
                    codigo: values.codigo,
                    nombre: values.nombre,
                    unidadMedidaId: values.unidadMedidaId || null,
                    tipoDato: values.tipoDato,
                    orden: values.orden,
                    activo: values.activo,
                },
            })
        } else {
            await createMutation.mutateAsync({
                pruebaId: values.pruebaId,
                codigo: values.codigo,
                nombre: values.nombre,
                unidadMedidaId: values.unidadMedidaId || null,
                tipoDato: values.tipoDato,
                orden: values.orden,
                activo: values.activo,
            })
        }
        modal.close()
    }

    const handleDelete = async (item: Parametro) => {
        modal.setDeletingId(item.id)
        try {
            await deleteMutation.mutateAsync(item.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption: formatRegistrosCaption(total, filters.hasActiveFilters || Boolean(pruebaId)),
        filters: {
            searchInput: filters.searchInput,
            hasActiveFilters: filters.hasActiveFilters,
            onSearchInputChange: filters.handleSearchInputChange,
            onSearch: filters.handleSearch,
            onClearFilters: filters.clearFilters,
            pruebaId,
            pruebaOptions,
            onFilterPrueba: handleFilterPrueba,
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
            initialPruebaId: pruebaId,
            openCreateModal: modal.openCreate,
            closeModal: () => modal.close(isSaving),
            handleSubmit,
        },
    }
}
