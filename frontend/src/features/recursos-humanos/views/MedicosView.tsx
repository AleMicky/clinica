import { useState } from 'react'
import { Select } from 'antd'

import { useEspecialidades } from '../../catalogo-clinico/hooks/catalogo-clinico.hooks'
import { SeguridadSectionPanel } from '../../seguridad/components/SeguridadSectionPanel'
import { MedicoFormModal } from '../components/MedicoFormModal'
import { MedicosTable } from '../components/MedicosTable'
import {
    useCreateMedico,
    useDeleteMedico,
    useMedicos,
    useUpdateMedico,
} from '../hooks/medicos.hooks'
import {
    toCreateMedicoPayload,
    toUpdateMedicoPayload,
    type MedicoFormValues,
} from '../schemas/medico.schema'
import type { Medico } from '../types/medico.types'

const DEFAULT_PAGE_SIZE = 20
const LOOKUP_QUERY = { page: 1, pageSize: 200 }

export function MedicosView() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [especialidadFilter, setEspecialidadFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editingMedico, setEditingMedico] = useState<Medico | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { data: especialidadesResult } = useEspecialidades(LOOKUP_QUERY)

    const { data, isFetching } = useMedicos({
        page,
        pageSize,
        search: search || undefined,
        especialidadId: especialidadFilter,
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

    const handleSearch = (value: string) => {
        setSearch(value.trim())
        setPage(1)
    }

    const handlePageChange = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage)
        setPageSize(nextPageSize)
    }

    return (
        <>
            <SeguridadSectionPanel
                title="Directorio de médicos"
                caption={
                    <>
                        {totalMedicos} registrado{totalMedicos === 1 ? '' : 's'}
                        {especialidadFilter ? ' · filtro por especialidad' : ''}
                    </>
                }
                searchPlaceholder="Buscar por nombre o matrícula…"
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                onSearch={handleSearch}
                actionLabel="Nuevo médico"
                onAction={openCreateModal}
            >
                <div className="rrhh-page__filters rrhh-page__filters--embedded">
                    <Select
                        allowClear
                        size="small"
                        placeholder="Especialidad"
                        options={especialidadOptions}
                        value={especialidadFilter}
                        onChange={(value) => {
                            setEspecialidadFilter(value)
                            setPage(1)
                        }}
                        className="rrhh-page__filter-select"
                    />
                </div>

                <MedicosTable
                    medicos={medicos}
                    loading={isFetching}
                    total={totalMedicos}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </SeguridadSectionPanel>

            <MedicoFormModal
                open={modalOpen}
                medico={editingMedico}
                loading={isSaving}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </>
    )
}
