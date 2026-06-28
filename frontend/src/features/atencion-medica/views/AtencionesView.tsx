import { useState } from 'react'

import { ModuleSectionPanel } from '../../../shared/components/ui/module-page/ModuleSectionPanel'
import { AtencionFormModal } from '../components/AtencionFormModal'
import { AtencionesTable } from '../components/AtencionesTable'
import {
    useAtenciones,
    useCreateAtencion,
    useDeleteAtencion,
    useUpdateAtencion,
} from '../hooks/atencion-medica.hooks'
import {
    toCreateAtencionPayload,
    toUpdateAtencionPayload,
    type AtencionFormValues,
} from '../schemas/atencion.schema'
import type { Atencion } from '../types/atencion-medica.types'

const DEFAULT_PAGE_SIZE = 20

export function AtencionesView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAtencion, setEditingAtencion] = useState<Atencion | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data, isFetching } = useAtenciones({
        page,
        pageSize,
        search: search || undefined,
    })
    const createAtencion = useCreateAtencion()
    const updateAtencion = useUpdateAtencion()
    const deleteAtencion = useDeleteAtencion()

    const atenciones = data?.items ?? []
    const totalAtenciones = data?.totalRecords ?? 0
    const isSaving = createAtencion.isPending || updateAtencion.isPending

    const openCreateModal = () => {
        setEditingAtencion(null)
        setModalOpen(true)
    }

    const openEditModal = (atencion: Atencion) => {
        setEditingAtencion(atencion)
        setModalOpen(true)
    }

    const closeModal = () => {
        if (isSaving) return
        setModalOpen(false)
        setEditingAtencion(null)
    }

    const handleSubmit = async (values: AtencionFormValues) => {
        if (editingAtencion) {
            await updateAtencion.mutateAsync({
                id: editingAtencion.id,
                data: toUpdateAtencionPayload(values),
            })
        } else {
            await createAtencion.mutateAsync(toCreateAtencionPayload(values))
        }

        closeModal()
    }

    const handleDelete = async (atencion: Atencion) => {
        setDeletingId(atencion.id)

        try {
            await deleteAtencion.mutateAsync(atencion.id)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="module-object-page__panel">
            <ModuleSectionPanel
                title="Listado de atenciones"
                caption={`${totalAtenciones} registrada${totalAtenciones === 1 ? '' : 's'}`}
                searchPlaceholder="Buscar por trámite u observaciones…"
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onSearch={(value) => {
                    setSearch(value)
                    setPage(1)
                }}
                actionLabel="Nueva atención"
                onAction={openCreateModal}
            >
                <AtencionesTable
                    atenciones={atenciones}
                    loading={isFetching}
                    total={totalAtenciones}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={(nextPage, nextPageSize) => {
                        setPage(nextPage)
                        setPageSize(nextPageSize)
                    }}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </ModuleSectionPanel>

            <AtencionFormModal
                open={modalOpen}
                atencion={editingAtencion}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    )
}
