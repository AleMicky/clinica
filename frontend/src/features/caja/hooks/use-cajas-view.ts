import { useEffect, useRef, useState } from 'react'

import { useCrudModalState } from '../../../shared/hooks/use-crud-modal-state'
import { formatRegistrosCaption } from '../../../shared/utils/crud-search'
import {
    useCreateCaja,
    useCajas,
    useDeleteCaja,
    useUpdateCaja,
} from './caja.hooks'
import type { CajaFormValues } from '../schemas/caja.schema'
import type { CajaFisica } from '../types/caja.types'

const DEFAULT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

export function useCajasView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [activoFilter, setActivoFilter] = useState<boolean | undefined>()
    const modal = useCrudModalState<CajaFisica>()

    const onSearchRef = useRef((value: string) => {
        setSearch(value.trim())
        setPage(1)
    })

    useEffect(() => {
        onSearchRef.current = (value: string) => {
            setSearch(value.trim())
            setPage(1)
        }
    })

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onSearchRef.current(searchInput.trim())
        }, SEARCH_DEBOUNCE_MS)

        return () => window.clearTimeout(timer)
    }, [searchInput])

    const { data, isFetching } = useCajas({
        page,
        pageSize,
        search: search || undefined,
        activo: activoFilter,
    })

    const createMutation = useCreateCaja()
    const updateMutation = useUpdateCaja()
    const deleteMutation = useDeleteCaja()

    const cajas = data?.items ?? []
    const total = data?.totalRecords ?? 0
    const isSaving = createMutation.isPending || updateMutation.isPending
    const hasActiveFilters = Boolean(search || activoFilter !== undefined)

    const handleSubmit = async (values: CajaFormValues) => {
        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                payload: {
                    nombre: values.nombre,
                    descripcion: values.descripcion || null,
                    activo: values.activo,
                },
            })
        } else {
            await createMutation.mutateAsync({
                codigo: values.codigo,
                nombre: values.nombre,
                descripcion: values.descripcion || null,
                activo: values.activo,
            })
        }
        modal.close()
    }

    const handleDelete = async (caja: CajaFisica) => {
        modal.setDeletingId(caja.id)
        try {
            await deleteMutation.mutateAsync(caja.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    return {
        loading: isFetching,
        caption: formatRegistrosCaption(total, hasActiveFilters),
        filters: {
            searchInput,
            activoFilter,
            hasActiveFilters,
            onSearchInputChange: setSearchInput,
            onSearch: (value: string) => {
                setSearchInput(value)
                setSearch(value.trim())
                setPage(1)
            },
            onActivoFilterChange: (value: boolean | undefined) => {
                setActivoFilter(value)
                setPage(1)
            },
            onClearFilters: () => {
                setSearchInput('')
                setSearch('')
                setActivoFilter(undefined)
                setPage(1)
            },
        },
        table: {
            cajas,
            total,
            page,
            pageSize,
            onPageChange: (nextPage: number, nextPageSize: number) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
            },
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
