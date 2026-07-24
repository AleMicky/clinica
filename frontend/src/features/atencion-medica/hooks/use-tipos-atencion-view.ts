import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { tiposAtencionHooks, useTiposAtencion } from './atencion-medica.hooks'
import type { TipoAtencionFormValues } from '../schemas/tipo-atencion.schema'
import type { TipoAtencion } from '../types/atencion-medica.types'

const DEFAULT_PAGE_SIZE = 20

function toPayload(values: TipoAtencionFormValues) {
    return {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion || '',
        color: values.color,
        icono: values.icono || null,
    }
}

export function useTiposAtencionView() {
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<TipoAtencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // El backend de tipos-atencion aún no filtra por `search`; se aplica filtro local.
    const { data, isFetching } = useTiposAtencion({
        page,
        pageSize,
    })

    const createMutation = tiposAtencionHooks.useCreate()
    const updateMutation = tiposAtencionHooks.useUpdate()
    const deleteMutation = tiposAtencionHooks.useDelete()
    const isSaving = createMutation.isPending || updateMutation.isPending

    const items = useMemo(() => {
        const source = data?.items ?? []
        const term = search.trim().toLowerCase()

        if (!term) return source

        return source.filter((item) => {
            const codigo = item.codigo.toLowerCase()
            const nombre = item.nombre.toLowerCase()
            const descripcion = item.descripcion?.toLowerCase() ?? ''
            return (
                codigo.includes(term) ||
                nombre.includes(term) ||
                descripcion.includes(term)
            )
        })
    }, [data?.items, search])

    const total = search ? items.length : (data?.totalRecords ?? 0)
    const hasActiveFilters = Boolean(search)

    const caption = `${total} registrado${total === 1 ? '' : 's'}${
        hasActiveFilters ? ' · filtros activos' : ''
    }`

    const applySearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const openCreateModal = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const openEditModal = (tipo: TipoAtencion) => {
        setEditing(tipo)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditing(null)
    }

    const handleSubmit = async (values: TipoAtencionFormValues) => {
        if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, data: toPayload(values) })
        } else {
            await createMutation.mutateAsync(toPayload(values))
        }
        closeModal()
    }

    const handleDelete = async (tipo: TipoAtencion) => {
        setDeletingId(tipo.id)
        try {
            await deleteMutation.mutateAsync(tipo.id)
        } finally {
            setDeletingId(null)
        }
    }

    const handleManageForms = (tipo: TipoAtencion) => {
        void navigate({
            to: '/atenciones/formularios/$tipoAtencionId',
            params: { tipoAtencionId: tipo.id },
        })
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    return {
        loading: isFetching,
        caption,
        filters: {
            searchInput,
            hasActiveFilters,
            onSearchInputChange: setSearchInput,
            onSearch: applySearch,
        },
        table: {
            items,
            total,
            page,
            pageSize,
            onPageChange: handlePageChange,
            onEdit: openEditModal,
            onDelete: handleDelete,
            onManageForms: handleManageForms,
            onCreate: openCreateModal,
            deletingId,
            hasActiveFilters,
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
